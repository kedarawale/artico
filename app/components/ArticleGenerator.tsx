"use client"

import { useState } from "react"
import { generateArticle } from "../actions/generateArticle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ArticleGenerator() {
  const [topic, setTopic] = useState("")
  const [article, setArticle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setArticle("")

    const result = await generateArticle(topic)

    if (result.success) {
      setArticle(result.content)
    } else {
      setError(result.error || "An unexpected error occurred")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Article/Blog Generator</CardTitle>
        <CardDescription>Enter a topic to generate an article or blog post</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic here"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Article"}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {article && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Generated Article:</h3>
            <div className="prose max-w-none">
              {article.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

