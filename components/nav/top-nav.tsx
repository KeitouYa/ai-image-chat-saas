import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { LogIn, LaptopMinimal, Icon, LucideIcon, Bot } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { currentUser } from "@clerk/nextjs/server";
import ModeToggle from "./mode-toggle";
import Credits from "./credits";

interface IconWithTextProps {
  href: string;
  icon: LucideIcon;
  text: string;
}

//Update the IconWithText component to include cursor-pointer
const IconWithText: React.FC<IconWithTextProps> = ({
  href,
  icon: Icon,
  text,
}) => (
  <Link href={href}>
    <div className="flex flex-col items-center cursor-pointer">
      <Icon className="h-10 w-10 text-[#6a6acd]" />
      <span className="text-xs text-gray-500 mt-1 cursor-pointer">{text}</span>
    </div>
  </Link>
);

export default async function TopNav() {
  const user = await currentUser();

  return (
    <div className="flex items-center justify-center p-5 shadow space-x-10">
      <div className="flex items-center overflow-x-auto space-x-4 md:space-x-10">
        <div className="flex flex-col items-center cursor-pointer">
          <Link href="/">
            <Image
              src="/logos/logo.svg"
              alt="ai image generator logo"
              width={50}
              height={50}
            />
          </Link>
          <span className="text-xs text-gray-500 mt-1 cursor-pointer hidden sm:inline-block">
            AI Image Generator
          </span>
        </div>

        {/* //if login in, use IconWithText */}
        {user && (
          <IconWithText
            href="/dashboard"
            icon={LaptopMinimal}
            text="Dashboard"
          />
        )}

        <IconWithText href="/chat" icon={Bot} text="Chat" />

        {user && (
          <div className="flex flex-col items-center cursor-pointer">
            <Link href="/buy-credits">
              <Credits />
            </Link>
            <span className="text-xs text-gray-500 mt-1 cursor-pointer">
              Credits
            </span>
          </div>
        )}

        <div className="flex flex-col items-center cursor-pointer">
          <SignedOut>
            <SignInButton>
              <LogIn className="h-10 w-10 text-[#6a5acd] cursor-pointer"></LogIn>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="text-xs text-gray-500 mt-1 cursor-pointer">
              <UserButton />
            </div>
          </SignedIn>
          <span className="text-xs text-gray-500 mt-1 cursor-pointer">
            Account
          </span>
        </div>
        <div className="flex flex-col items-center cursor-pointer">
          <ModeToggle />
          <span className="text-xs text-gray-500 mt-1 cursor-pointer">
            Theme
          </span>
        </div>
      </div>
    </div>
  );
}
