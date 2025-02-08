import { NextRequest } from "next/server";
import { Langbase, getRunner } from "langbase";

const langbase = new Langbase();

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    // Call the pipe with streaming enabled
    const { stream } = await langbase.pipe.run({
      apiKey: process.env.LANGBASE_API_KEY || "pipe_3tkXTPjmpRNFZHk2U1XdothjPnnkaAjoWtNYNhncUPJrPLKpUcQDMwXdrAodQC5zkSnpv85zwhiDUfvUWmdsQUv1",
      stream: true,
      messages: [{ role: "user", content: topic }],
    });

    // Convert the returned ReadableStream into a runner
    const runner = getRunner(stream);

    // Create a TransformStream to forward chunks to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Forward content chunks
    runner.on("content", async (chunk: string) => {
      await writer.write(encoder.encode(chunk));
    });

    // Handle errors and close
    runner.on("error", async (err: Error) => {
      console.error("Langbase streaming error:", err);
      await writer.close();
    });

    runner.on("close", async () => {
      await writer.close();
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in /api/generate route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}