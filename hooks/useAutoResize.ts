import { useEffect, RefObject } from "react";

export function useAutoResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight: number = 200
) {
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Shrink to auto first so scrollHeight reflects real content height
    el.style.height = "auto";

    // Set to content height, capped at maxHeight
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;

    // Show scrollbar only when content exceeds maxHeight
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [textareaRef, value, maxHeight]);
}
