"use client";

import React from "react";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { ChatInput } from "@/components/forms/chat-input";

export function GenerateImageInput() {
  const { generateImage, imagePrompt, setImagePrompt, loading } =
    useImageGeneration();

  return (
    <ChatInput
      value={imagePrompt}
      onChange={setImagePrompt}
      onSubmit={() => generateImage()}
      placeholder="Describe the image you want to create..."
      loading={loading}
      size="lg"
      maxHeight={400}
    />
  );
}
