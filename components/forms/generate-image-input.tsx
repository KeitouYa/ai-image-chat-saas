"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useImage } from "@/context/image";
import { Loader2Icon } from "lucide-react";

export function GenerateImageInput() {
  const { generateImage, imagePrompt, setImagePrompt, loading } = useImage();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        generateImage();
      }}
    >
      <div className="mb-5 flex space-x-2">
        <Input
          placeholder="Enter a prompt..."
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          className="p-6 lg:p-8 text-lg lg:text-2xl"
        />
        <Button
          onClick={generateImage}
          disabled={loading}
          className="p-6 lg:p-8 text-lg lg:text-2xl 
          min-w-[200px] flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2Icon className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <> Generate Image</>
          )}
        </Button>
      </div>
    </form>
  );
}
