"use client";

import { useEffect, useState, useCallback } from "react";
import { UserButton, SignIn, useUser, useSession, SignedIn, SignedOut } from "@clerk/nextjs";
import { 
  CheckCircleIcon, 
  BoltIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  ClockIcon 
} from "@heroicons/react/24/solid";
import { useLandingLogic } from "../hooks/useLandingLogic";
import Head from 'next/head';

export default function LandingPage() {
  const {
    isSignedIn,
    showSignIn,
    setShowSignIn,
    goToAnalyzer,
    getNavbarButtonText,
    getHeroButtonText,
    userTier, 
  } = useLandingLogic();

  const { user, isLoaded: userLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAccount = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const hasPaid = params.get("payment") === "success";

    if (hasPaid && userLoaded && session && user && userTier !== "Premium") {
      setIsSyncing(true);
      try {
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, tier: "Premium" },
        });
        await new Promise((res) => setTimeout(res, 2000));
        await session.reload();
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.assign("/analyze");
      } catch (err) {
        console.error("Sync Error:", err);
        setIsSyncing(false);
      }
    }
  }, [userLoaded, session, user, userTier]);

  useEffect(() => {
    syncAccount();
  }, [syncAccount]);

  const handleGoUltimate = () => {
    const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
    if (!isSignedIn) { setShowSignIn(true); return; }
    if (stripeUrl) window.location.href = stripeUrl;
  };

  return (
    <div className="min-h-screen font-sans bg-[#0a0a0c] text-white selection:bg-indigo-500 overflow-x-hidden">
      <Head>
        <title>AI Vision Analyzer</title>
      </Head>
      
      {/* BACKGROUNDS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. HEADER / NAVIGATION */}
      <header className="fixed top-0 w-full bg-black/40 backdrop-blur-3xl z-50 border-b border-white/5 h-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center h-full">
          {/* REQUIREMENT: App title "AI Vision Analyzer" */}
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
            AI Vision <span className="text-indigo-500">Analyzer</span>
          </h1>
          
          <div className="flex items-center space-x-6">
            <SignedIn>
              <div className="flex items-center gap-6">
                {/* REQUIREMENT: "Go to Analyzer" button */}
                <button onClick={goToAnalyzer} className="px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                  {isSyncing ? "SYNCING..." : "Go to Analyzer"}
                </button>
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-white/10" } }} />
              </div>
            </SignedIn>
            
            <SignedOut>
              {/* REQUIREMENT: Sign In button */}
              <button onClick={() => setShowSignIn(true)} className="px-6 py-2.5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">
                Sign In
              </button>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        <div className="max-w-4xl">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-4 block">Neural Vision Intelligence</span>
          <h2 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
            Analyze Images <br /> <span className="text-indigo-500">With AI</span>
          </h2>
          <p className="text-lg md:text-xl mb-12 text-gray-400 font-medium max-w-2xl mx-auto uppercase tracking-wide opacity-80">
            Professional grade visual data analysis. Instant. Accurate. Powerful.
          </p>
          <button onClick={goToAnalyzer} className="px-12 py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-indigo-500 transition-all active:scale-95">
            {isSyncing ? "PREPARING..." : "Analyze Your Image"}
          </button>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-4 block">Capabilities</span>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-20">Core Infrastructure</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BoltIcon className="w-6 h-6" />} 
              title="AI Image Analysis" 
              desc="Generate instant AI descriptions for your images with neural accuracy." 
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="w-6 h-6" />} 
              title="Secure & Private" 
              desc="Your images are processed safely and are never stored on our servers." 
            />
            <FeatureCard 
              icon={<ChartBarIcon className="w-6 h-6" />} 
              title="Clean Dashboard" 
              desc="Manage your analysis history with an intuitive, minimalist interface." 
            />
          </div>
        </div>
      </section>

      {/* 4. PRICING TIERS */}
      <section id="pricing" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h4 className="text-5xl font-black uppercase tracking-tighter italic">Membership Plans</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE TIER */}
            <div className="p-12 rounded-[3rem] bg-white/5 border border-white/5 flex flex-col items-center text-center backdrop-blur-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Free Tier</h4>
              <span className="text-7xl font-black mb-6 tracking-tighter italic">$0</span>
              <ul className="mb-10 space-y-4 text-left w-full max-w-[200px]">
                <PricingItem text="1 image analysis" />
                <PricingItem text="Basic AI analysis" />
              </ul>
              <button onClick={goToAnalyzer} className="w-full py-4 bg-white text-gray-900 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-200 transition-all shadow-xl active:scale-95">
                {isSignedIn ? "Open Analyzer" : "Start Free"}
              </button>
            </div>

            {/* PREMIUM TIER */}
            <div className="p-12 rounded-[3rem] bg-indigo-600 border border-indigo-400/20 flex flex-col items-center text-center shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-100 mb-8">Premium Tier 💎</h4>
              <span className="text-7xl font-black mb-6 tracking-tighter italic">$5</span>
              <ul className="mb-10 space-y-4 text-left w-full max-w-[200px]">
                <PricingItem text="Unlimited analyses" isPremium />
                <PricingItem text="Advanced descriptions" isPremium />
              </ul>
              <button
                onClick={userTier === "Premium" ? goToAnalyzer : handleGoUltimate}
                className="w-full py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95"
              >
                {isSyncing ? "SYNCHRONIZING..." : (userTier === "Premium" ? "ENTER ANALYSIS" : "GO PREMIUM")}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-[#111114] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-md relative">
            <button onClick={() => setShowSignIn(false)} className="absolute top-6 right-8 text-gray-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest z-50">
                [ Close ]
            </button>
            <div className="pt-4 overflow-hidden">
                <SignIn routing="hash" appearance={{
                    elements: {
                        card: "bg-transparent shadow-none",
                        headerTitle: "text-white",
                        headerSubtitle: "text-gray-400",
                        formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
                        socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                        formFieldLabel: "text-gray-400",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        footerActionLink: "text-indigo-400 hover:text-indigo-300"
                    }
                }} />
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">© 2026 Developed by Amel K Sunil.</p>
      </footer>
    </div>
  );
}

// Sub-components
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 text-left group hover:bg-white/[0.05] transition-all">
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
        <div className="text-white">{icon}</div>
      </div>
      <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4">{title}</h4>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingItem({ text, isPremium = false }: { text: string, isPremium?: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest ${isPremium ? 'text-white' : 'text-gray-400'}`}>
      <CheckCircleIcon className={`w-4 h-4 ${isPremium ? 'text-indigo-200' : 'text-gray-600'}`} /> {text}
    </li>
  );
}