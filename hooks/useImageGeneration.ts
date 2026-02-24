import { useContext } from "react";
import {
  ImageGenerationContext,
  ImageGenerationContextType,
} from "@/context/image-generation";

export const useImageGeneration = (): ImageGenerationContextType => {
  const context = useContext(ImageGenerationContext);
  if (!context) {
    throw new Error(
      "useImageGeneration must be used within an ImageGenerationProvider"
    );
  }
  return context;
};
