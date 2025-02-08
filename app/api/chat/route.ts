import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    console.log("Sending request to Langbase API:", JSON.stringify({ messages, stream: true }))

    const response = await fetch(`${process.env.LANGBASE_API_BASE_URL}/v1/pipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LANGBASE_PIPE_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Langbase API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Langbase API error: ${response.status} ${errorText}` },
        { status: response.status },
      )
    }

    const stream = response.body
    if (!stream) {
      throw new Error("No response stream from Langbase API")
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Unexpected error in API route:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

