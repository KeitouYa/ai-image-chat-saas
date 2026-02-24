"use client";

import React, { useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResize } from "@/hooks/useAutoResize";
import { cn } from "@/src/lib/utils";
import { ArrowUp, Loader2Icon, Paperclip } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxHeight?: number;
  size?: "default" | "lg";
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  loading = false,
  maxHeight = 200,
  size = "default",
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoResize(textareaRef, value, maxHeight);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled || loading) return;
    onSubmit();
  }, [value, onSubmit, disabled, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm transition-all bg-white/40 backdrop-blur-sm dark:bg-muted/30",
        "focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {/* Textarea area */}
      <div className="px-3 pt-3">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className={cn(
            "w-full border-0 bg-transparent dark:bg-transparent resize-none shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            size === "lg" ? "p-2 text-lg" : "p-1 text-sm",
          )}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        {/* Left: attachment placeholder */}
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 text-muted-foreground/50 cursor-not-allowed text-xs"
          title="Coming soon"
        >
          <Paperclip className="h-4 w-4" />
          <span className="hidden sm:inline">Attach</span>
        </button>

        {/* Right: send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || loading || !hasContent}
          aria-label="Send message"
          className={cn(
            "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-transform",
            "transform will-change-transform",
            hasContent && !disabled && !loading
              ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md hover:scale-105 active:scale-95"
              : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed",
          )}
        >
          {loading ? (
            <Loader2Icon className="animate-spin h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
