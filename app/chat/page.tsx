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

import React, { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/forms/chat-input";

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
  // Handle Message Send
  // -----------------------------
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    // Push the user's message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          provider: "gemini",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Chat failed");
      }

      const botReply = data.data.reply ?? "No response";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err: any) {
      console.error("CHAT UI ERROR:", err);

      const errorMessage = err?.message || "Unexpected error";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Error: ${errorMessage}`,
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
    <div className="flex flex-col h-[calc(100dvh-100px)] max-w-2xl mx-auto p-4 md:p-6 w-full">
      {/* CHAT BOX */}
      <div className="flex-1 overflow-y-auto border border-border rounded-2xl p-6 bg-white/40 backdrop-blur-sm dark:bg-card/80 shadow-sm space-y-4 mb-4">
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
                  ? "bg-primary text-primary-foreground dark:text-white rounded-br-sm shadow-sm"
                  : "bg-muted text-foreground rounded-bl-sm border border-border shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* LOADING BUBBLE */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-2xl rounded-bl-none animate-pulse">
              AI is thinking…
            </div>
          </div>
        )}

        <div ref={lastRef} />
      </div>

      {/* INPUT AREA */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => handleSend()}
        placeholder="Type your message..."
        loading={isLoading}
      />
    </div>
  );
}
