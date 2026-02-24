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
      <Icon className="h-10 w-10 text-primary" />
      <span className="text-xs text-muted-foreground mt-1 cursor-pointer transition-colors hover:text-foreground">{text}</span>
    </div>
  </Link>
);

export default function TopNav() {

  return (
    <div className="flex items-center justify-center p-4 border-b border-border backdrop-blur-md z-50 sticky top-0 gap-8">
      <div className="flex items-end overflow-x-auto space-x-4 md:space-x-10">
        <div className="flex flex-col items-center cursor-pointer">
          <Link href="/">
            <Image
              src="/logos/logo.svg"
              alt="ai image generator logo"
              width={40}
              height={40}
            />
          </Link>
          <span className="text-xs text-muted-foreground mt-1 cursor-pointer hidden sm:inline-block transition-colors hover:text-foreground">
            AI Image Generator
          </span>
        </div>

        {/* //if login in, use IconWithText */}
        <SignedIn>
          <IconWithText
            href="/dashboard"
            icon={LaptopMinimal}
            text="Dashboard"
          />
        </SignedIn>

        <IconWithText href="/chat" icon={Bot} text="Chat" />

        <SignedIn>
          <div className="flex flex-col items-center cursor-pointer">
            <Link href="/buy-credits">
              <Credits />
            </Link>
            <span className="text-xs text-muted-foreground mt-1 cursor-pointer transition-colors hover:text-foreground">
              Credits
            </span>
          </div>
        </SignedIn>

        <div className="flex flex-col items-center cursor-pointer">
          <SignedOut>
            <SignInButton>
              <LogIn className="h-10 w-10 text-primary cursor-pointer"></LogIn>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="text-xs text-muted-foreground mt-1 cursor-pointer">
              <UserButton />
            </div>
          </SignedIn>
          <span className="text-xs text-muted-foreground mt-1 cursor-pointer transition-colors hover:text-foreground">
            Account
          </span>
        </div>
        <div className="flex flex-col items-center cursor-pointer">
          <ModeToggle />
          <span className="text-xs text-muted-foreground mt-1 cursor-pointer transition-colors hover:text-foreground">
            Theme
          </span>
        </div>
      </div>
    </div>
  );
}
