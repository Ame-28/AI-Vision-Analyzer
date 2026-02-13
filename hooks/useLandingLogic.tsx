// "use client";

// import { useState } from "react";
// import { useUser } from "@clerk/nextjs";

// export function useLandingLogic() {
//   const { isSignedIn, user } = useUser();
//   const [showSignIn, setShowSignIn] = useState(false);

//   const userTier = user?.publicMetadata?.tier || "free";

//   // Navbar button text
//   const getNavbarButtonText = () => {
//     if (!isSignedIn) return "Sign In";
//     return "Go to Analyzer";
//   };

//   // Hero + Free pricing button text
//   const getHeroButtonText = () => {
//     if (!isSignedIn) return "Get Started";
//     return "Start Analysis";
//   };

//   // MAIN NAVIGATION LOGIC
//   const goToAnalyzer = () => {
//     if (!isSignedIn) {
//       setShowSignIn(true);
//       return;
//     }

//     // ✅ both free & premium go to analyze page
//     window.location.href = "/analyze";
//   };

//   return {
//     isSignedIn,
//     userTier,
//     showSignIn,
//     setShowSignIn,
//     goToAnalyzer,
//     getNavbarButtonText,
//     getHeroButtonText,
//   };
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export const useLandingLogic = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  // Pull the tier from unsafeMetadata (synced with Stripe redirect)
  const userTier = user?.unsafeMetadata?.tier || "free";

  const goToAnalyzer = () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // Use window.location.href to ensure a clean session refresh
      window.location.href = "/analyze";
    } else {
      setShowSignIn(true);
    }
  };

  const getNavbarButtonText = () => {
    if (!isLoaded) return "Loading...";
    return isSignedIn ? "Go to Analyzer" : "Sign In";
  };

  const getHeroButtonText = () => {
    if (!isLoaded) return "Initializing...";
    return isSignedIn ? "Open Analyzer" : "Try for Free";
  };

  return {
    isSignedIn,
    isLoaded,
    userTier,      // Make sure this is exported
    showSignIn,
    setShowSignIn,
    goToAnalyzer,
    getNavbarButtonText,
    getHeroButtonText,
  };
};