"use client";

import React, { createContext, useState } from "react";
import { generateImageAi } from "@/src/services/image.service";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";

// --- Context Type (exported for hooks/useImageGeneration.ts) ---
export interface ImageGenerationContextType {
  imagePrompt: string;
  setImagePrompt: (query: string) => void;
  loading: boolean;
  generateImage: () => void;
}

export const ImageGenerationContext = createContext<
  ImageGenerationContextType | undefined
>(undefined);

// --- Provider ---
export const ImageGenerationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [imagePrompt, setImagePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get getUserCredits from CreditsContext to refresh after generation
  const { getUserCredits } = useCredits();

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);

    try {
      const { success, _id } = await generateImageAi(imagePrompt);

      if (success) {
        await getUserCredits();
        toast.success("🎉 Image generated!");
        router.push(`/dashboard/image/${_id}`);
      } else {
        await getUserCredits();
        toast.error("Insufficient credits. Please buy more credits.");
        router.push("/buy-credits");
      }
    } catch (err: any) {
      if (err?.digest === "NEXT_REDIRECT") throw err;
      console.error("Error generating image:", err);
      toast.error("Failed to generate image. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageGenerationContext.Provider
      value={{
        imagePrompt,
        setImagePrompt,
        loading,
        generateImage,
      }}
    >
      {children}
    </ImageGenerationContext.Provider>
  );
};

// Hook moved to hooks/useImageGeneration.ts
