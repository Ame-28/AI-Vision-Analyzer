"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export function useLandingLogic() {
  const { isSignedIn, user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  const userTier = user?.publicMetadata?.tier || "free";

  // Navbar button text
  const getNavbarButtonText = () => {
    if (!isSignedIn) return "Sign In";
    return "Go to Analyzer";
  };

  // Hero + Free pricing button text
  const getHeroButtonText = () => {
    if (!isSignedIn) return "Get Started";
    return "Start Analysis";
  };

  // MAIN NAVIGATION LOGIC
  const goToAnalyzer = () => {
    if (!isSignedIn) {
      setShowSignIn(true);
      return;
    }

    // ✅ both free & premium go to analyze page
    window.location.href = "/analyze";
  };

  return {
    isSignedIn,
    userTier,
    showSignIn,
    setShowSignIn,
    goToAnalyzer,
    getNavbarButtonText,
    getHeroButtonText,
  };
}
