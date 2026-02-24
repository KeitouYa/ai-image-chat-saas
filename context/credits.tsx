"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  checkCreditRecordDb,
  getUserCreditsFromDb,
} from "@/src/services/payment.service";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

// --- Context Type (exported for hooks/useCredits.ts) ---
export interface CreditsContextType {
  credits: number;
  getUserCredits: () => Promise<void>;
}

export const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

// --- Provider ---
export const CreditsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [credits, setCredits] = useState(0);
  const { isSignedIn } = useUser();

  // useCallback: stable reference, only rebuilt when isSignedIn changes
  const getUserCredits = useCallback(async () => {
    if (!isSignedIn) return;

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
  }, [isSignedIn]);

  // Single useEffect: ensure record exists THEN fetch credits (fixes race condition)
  useEffect(() => {
    if (!isSignedIn) return;

    const initCredits = async () => {
      await checkCreditRecordDb();
      await getUserCredits();
    };

    initCredits();
  }, [isSignedIn, getUserCredits]);

  return (
    <CreditsContext.Provider value={{ credits, getUserCredits }}>
      {children}
    </CreditsContext.Provider>
  );
};

// Hook moved to hooks/useCredits.ts
