"use client";
import React from "react";
import { Coins } from "lucide-react";
import { useImage } from "@/context/image";

export default function Credits() {
  const [total, setTotal] = React.useState(0);
  const { credits } = useImage(); // 等价于后面的写法： const credits = useImage().credits;

  const displayCredits = credits > 99 ? "99+" : credits.toString();
  const badgeColor = credits < 10 ? "bg-red-500" : "bg-green-500";

  return (
    <div className="relative inline-block">
      <Coins className="h-8 w-8 text-[#6a5acd]" />
      <span
        className={`absolute -top-1 -right-2 ${badgeColor} text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1`}
      >
        {displayCredits}
      </span>
    </div>
  );
}
