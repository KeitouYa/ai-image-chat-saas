"use client";
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="link"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9 rounded-full"
    >
      {theme === "light" ? (
        <Moon className="h-8 w-8 text-[#6a5acd]" />
      ) : (
        <Sun className="h-8 w-8 text-[#6a5acd]" />
      )}
    </Button>
  );
}
