import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import TopNav from "@/components/layout/top-nav";
import { ClerkProvider } from "@clerk/nextjs";
import { CreditsProvider } from "@/context/credits";
import { ImageGenerationProvider } from "@/context/image-generation";
import { ThemeProvider } from "@/context/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Image Generator",
  description:
    "Generate images with AI for free. Buy credits to generate more images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Provider: Child components can use Clerk and Theme features
    <ClerkProvider>
      {/* ❗ DO NOT hardcode theme here */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Theme must be resolved on the client */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CreditsProvider>
              <ImageGenerationProvider>
                <TopNav />
                {children}
              </ImageGenerationProvider>
            </CreditsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
