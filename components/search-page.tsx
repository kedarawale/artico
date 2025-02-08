"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // adjust path as needed
import { PenBox, ClipboardCopy, Send } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function SearchPage() {
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState("");
  const [articleLoading, setArticleLoading] = useState(false);

  // Show chatbot after article is complete
  const [showChatbot, setShowChatbot] = useState(false);

  // The conversation array
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Current user input for the chatbot
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [chatbotLoading, setChatbotLoading] = useState(false);

  // Generic streaming fetch with 20s timeout
  async function fetchStreamedContent(prompt: string, onChunk: (chunk: string) => void) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.log("Aborted after 20 seconds.");
    }, 20000);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: prompt }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        console.error("API request failed or empty body.");
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          let chunk = decoder.decode(value);
          // Remove runs of asterisks and quotes
          chunk = chunk.replace(/\*+/g, "").replace(/"+/g, "");
          onChunk(chunk);
        }
      }
    } catch (err) {
      console.error("Fetch or streaming error:", err);
    } finally {
      clearTimeout(timeout);
    }
  }

  // 1) Generate the article from user’s topic
  async function handleGenerateArticle() {
    if (!topic.trim()) {
      alert("Please enter a valid topic.");
      return;
    }
    setArticle("");
    setArticleLoading(true);

    // Example prompt with custom AI-chosen title
    const prompt = `Write a creative article about ${topic}, with an interesting AI-generated title on top, then a blank line, then the article content. Avoid repeating the exact user topic.`;

    try {
      await fetchStreamedContent(prompt, (chunk) => {
        setArticle((prev) => prev + chunk);
      });
      // Once article is done, show chatbot
      setShowChatbot(true);
    } catch (err) {
      console.error("Error generating article:", err);
    } finally {
      setArticleLoading(false);
    }
  }

  // 2) Send a user message to the chatbot
  async function handleChatSend() {
    if (!currentUserInput.trim()) {
      alert("Please enter something to ask or say.");
      return;
    }
    setChatbotLoading(true);

    // 2a) Add the user's message to the conversation
    const userMsg = { role: "user" as const, content: currentUserInput };
    setMessages((prev) => [...prev, userMsg]);

    // 2b) Prepare to collect the assistant's streaming response
    let assistantReply = "";
    const onChunk = (chunk: string) => {
      assistantReply += chunk;
      // We keep re-rendering the partial assistant response 
      setMessages((prev) => {
        // Replace the last assistant message or add a new one
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          // If an assistant message is already there, update it
          return [...prev.slice(0, -1), { ...last, content: assistantReply }];
        } else {
          // Otherwise, create a new assistant message
          return [...prev, { role: "assistant", content: assistantReply }];
        }
      });
    };

    // 2c) Stream the assistant’s reply
    try {
      await fetchStreamedContent(currentUserInput, onChunk);
    } catch (err) {
      console.error("Error generating chatbot response:", err);
    } finally {
      setCurrentUserInput("");
      setChatbotLoading(false);
    }
  }

  // Copy the entire article
  function handleCopyArticle() {
    if (!article) return;
    navigator.clipboard.writeText(article).catch(console.error);
  }

  // Copy a chat message
  function copyMessage(content: string) {
    if (!content) return;
    navigator.clipboard.writeText(content).catch(console.error);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-6">
      {/* Logo */}
      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
        <PenBox className="w-12 h-12 text-white" />
      </div>

      {/* Brand name */}
      <h1 className="text-5xl font-bold text-white mb-4">Artico</h1>

      {/* User Topic + Generate Button */}
      <div className="flex items-center gap-2 w-full max-w-xl">
        <Input
          placeholder="Write your topic..."
          className="h-12 bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500 rounded-xl shadow-lg focus-visible:ring-primary w-full"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={handleGenerateArticle}
          disabled={articleLoading}
          className="px-4 h-12 text-white bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
        >
          {articleLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Tagline */}
      <p className="text-zinc-300 text-lg mt-2">
        Transform your ideas into engaging articles
      </p>

      {/* Article Container */}
      {article && (
        <div className="relative w-full max-w-xl mt-6 p-4 border border-zinc-700 bg-zinc-900/20 rounded-lg shadow-lg">
          <button
            onClick={handleCopyArticle}
            className="absolute top-2 right-2 text-zinc-400 hover:text-white"
          >
            <ClipboardCopy className="w-5 h-5" />
          </button>
          <div className="text-zinc-300 whitespace-pre-wrap">{article}</div>
        </div>
      )}

      {/* Chatbot Section (appears after article is generated) */}
      {showChatbot && (
        <div className="w-full max-w-xl mt-8 flex flex-col gap-4">
          {/* Conversation Display */}
          {messages.length > 0 && (
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`relative p-4 border border-zinc-700 bg-zinc-900/20 rounded-lg shadow-lg ${
                    m.role === "user" ? "self-end" : "self-start"
                  }`}
                >
                  <button
                    onClick={() => copyMessage(m.content)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                  </button>
                  <div className="text-zinc-300 whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chatbot Input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              className="h-10 bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500 rounded-xl shadow-lg focus-visible:ring-primary flex-1"
              value={currentUserInput}
              onChange={(e) => setCurrentUserInput(e.target.value)}
            />
            <button
              onClick={handleChatSend}
              disabled={chatbotLoading}
              className="px-3 h-10 text-white bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors inline-flex items-center gap-1"
            >
              {chatbotLoading ? "Sending..." : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}