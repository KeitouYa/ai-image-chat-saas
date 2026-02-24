import { useContext } from "react";
import { CreditsContext, CreditsContextType } from "@/context/credits";

export const useCredits = (): CreditsContextType => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
