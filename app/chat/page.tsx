"use client";

/**
 * CHAT PAGE (Client Component)
 * ---------------------------------------------------------------
 * Responsibilities:
 * - Display chat UI
 * - Send user input to API route /api/chat
 * - Render messages (user + bot)
 * - Handle loading state
 * - Catch and display backend errors
 *
 * This file NEVER talks to AI providers directly.
 * All AI logic flows:
 * UI → API Route → Controller → Service → Provider
 */

import React, {
  useEffect,
  useRef,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  // -----------------------------
  // UI States
  // -----------------------------
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);

  const lastRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // Auto-scroll on new messages
  // -----------------------------
  useEffect(() => {
    lastRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // -----------------------------
  // Handle Message Submit
  // -----------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    // Push the user's message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      // -----------------------------------------------------
      // 🔥 Send to your API route (NOT directly to service)
      // -----------------------------------------------------
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          provider: "gemini", // or "openai"
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Chat failed");
      }

      const botReply = data.data.reply ?? "No response";

      // Add bot response to UI
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err: any) {
      console.error("CHAT UI ERROR:", err);

      // Show REAL backend error message
      const errorMessage = err?.message || "Unexpected error";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------
  // UI RENDER
  // -----------------------------------------------------
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Chat with AI Assistant
      </h1>

      {/* CHAT BOX */}
      <div className="chat-box mb-4 max-h-96 overflow-y-auto border rounded-2xl p-4 bg-white shadow-sm space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* LOADING BUBBLE */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-none animate-pulse">
              Typing…
            </div>
          </div>
        )}

        <div ref={lastRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Type your message..."
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isLoading) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
