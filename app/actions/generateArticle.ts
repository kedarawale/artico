"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateArticle(topic: string) {
  try {
    const prompt = `Write a comprehensive article about "${topic}". The article should be well-structured, informative, and engaging. Include an introduction, main body with key points, and a conclusion.`

    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: prompt,
      system: "You are an expert writer capable of creating high-quality articles and blog posts on various topics.",
    })

    return { success: true, content: text }
  } catch (error) {
    console.error("Error generating article:", error)
    return { success: false, error: "Failed to generate article. Please try again." }
  }
}

