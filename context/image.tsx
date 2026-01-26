"use client";

import React, { useEffect, useRef, useState } from "react";
import { generateImageAi } from "@/src/services/image.service";
import {
  checkCreditRecordDb,
  getUserCreditsFromDb,
} from "@/src/services/payment.service";

import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

//context type
interface ImageContextType {
  imagePrompt: string;
  setImagePrompt: (query: string) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  generateImage: () => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  getUserCredits: () => void;
}

export const ImageContext = React.createContext<ImageContextType | undefined>(
  undefined
);

export const ImageProvider = ({ children }: { children: React.ReactNode }) => {
  const [imagePrompt, setImagePrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [credits, setCredits] = React.useState(0);

  const { isSignedIn } = useUser();
  const router = useRouter();

  // Load user credits
  const getUserCredits = async () => {
    // 只有在用户已登录时才获取积分
    if (!isSignedIn) {
      console.log("User not signed in, skipping credit fetch");
      return;
    }

    try {
      const credit = await getUserCreditsFromDb();
      const creditValue = Array.isArray(credit)
        ? credit[0]?.credits ?? 0
        : credit?.credits ?? 0;
      setCredits(creditValue);
    } catch (err) {
      console.error("Failed to get user credits:", err);
      toast.error("Failed to get user credits");
    }
  };

  // Load credits when user signs in
  useEffect(() => {
    getUserCredits();
  }, [isSignedIn]); // 依赖 isSignedIn，当登录状态改变时重新获取

  // Ensure credit record exists
  useEffect(() => {
    if (isSignedIn) {
      checkCreditRecordDb();
    }
  }, [isSignedIn]);

  // Generate image
  const generateImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    //Remove client-side authentication checks and handle them on the server side.
    // if (!isSignedIn) {
    //   toast.error("Please sign in to generate images");
    //   return;
    // }

    // Check if the user has entered a prompt
    if (!imagePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);

    try {
      const { success, _id, credits } = await generateImageAi(imagePrompt);

      if (success) {
        setCredits(credits ?? 0);
        toast.success("🎉 Image generated!");
        router.push(`/dashboard/image/${_id}`);
      } else {
        setCredits(credits ?? 0);
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
    <ImageContext.Provider
      value={{
        imagePrompt,
        setImagePrompt,
        loading,
        setLoading,
        generateImage,
        credits,
        setCredits,
        getUserCredits,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = (): ImageContextType => {
  const context = React.useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};
