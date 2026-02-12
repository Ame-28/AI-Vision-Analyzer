"use client";

import { UserButton, SignIn } from "@clerk/nextjs";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { features } from "../data/features";
import { useLandingLogic } from "../hooks/useLandingLogic";

export default function LandingPage() {
  const {
    isSignedIn,
    showSignIn,
    setShowSignIn,
    goToAnalyzer,
    getNavbarButtonText,
    getHeroButtonText,
  } = useLandingLogic();

  return (
    <div className="min-h-screen font-sans bg-[#0a0a0c] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="fixed top-0 w-full bg-black/40 backdrop-blur-3xl z-50 border-b border-white/5 h-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center h-full">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Vision <span className="text-indigo-500">Analyzer</span>
          </h1>

          <div className="flex items-center space-x-6">
            {!isSignedIn ? (
              <button
                onClick={() => setShowSignIn(true)}
                className="px-6 py-2.5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95"
              >
                {getNavbarButtonText()}
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={goToAnalyzer}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  {getNavbarButtonText()}
                </button>
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-white/10" } }} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        <div className="max-w-4xl">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-4 block">Next-Gen Image Intelligence</span>
          <h2 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
            Analyze Images <br />
            <span className="text-indigo-500">With AI</span>
          </h2>

          <p className="text-lg md:text-xl mb-12 text-gray-400 font-medium max-w-2xl mx-auto uppercase tracking-wide leading-relaxed">
            Upload visual data and receive <span className="text-white">instant, high-fidelity</span> insights powered by neural analysis.
          </p>

          <button
            onClick={goToAnalyzer}
            className="px-12 py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all active:scale-95"
          >
            {getHeroButtonText()}
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-4">Capabilities</h3>
            <h4 className="text-5xl font-black uppercase tracking-tighter italic">Core Infrastructure</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-10 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/5 hover:border-indigo-500/50 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>

                <h4 className="text-xl font-black mb-4 uppercase tracking-tight italic">
                  {feature.title}
                </h4>

                <p className="text-gray-400 font-medium leading-relaxed uppercase text-[11px] tracking-widest opacity-70">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-4">Scalability</h3>
            <h4 className="text-5xl font-black uppercase tracking-tighter italic">Select Tier</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="p-12 rounded-[3rem] bg-white/5 border border-white/5 flex flex-col items-center text-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">Standard</h4>
              <span className="text-7xl font-black mb-2 tracking-tighter italic">$0</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-10">Limited Access</p>

              <ul className="mb-12 space-y-4 text-left w-full border-t border-white/5 pt-8">
                <li className="flex items-center text-[11px] font-black uppercase tracking-widest text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-indigo-500 mr-3" />
                  1 analysis per session
                </li>
                <li className="flex items-center text-[11px] font-black uppercase tracking-widest text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-indigo-500 mr-3" />
                  Neural analysis
                </li>
              </ul>

              <button
                onClick={goToAnalyzer}
                className="w-full py-4 bg-white text-gray-900 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-200 transition-all"
              >
                Start Free
              </button>
            </div>

            {/* PREMIUM */}
            <div className="p-12 rounded-[3rem] bg-indigo-600 border border-indigo-400/20 flex flex-col items-center text-center shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
               {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-8">Premium💎</h4>
              <span className="text-7xl font-black mb-2 tracking-tighter italic">$5</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-10">Professional Access</p>

              <ul className="mb-12 space-y-4 text-left w-full border-t border-indigo-400/30 pt-8">
                <li className="flex items-center text-[11px] font-black uppercase tracking-widest text-white">
                  <CheckCircleIcon className="w-5 h-5 text-white mr-3" />
                  Unlimited analyses
                </li>
                <li className="flex items-center text-[11px] font-black uppercase tracking-widest text-white">
                  <CheckCircleIcon className="w-5 h-5 text-white mr-3" />
                  High-fidelity output
                </li>
                <li className="flex items-center text-[11px] font-black uppercase tracking-widest text-white">
                  <CheckCircleIcon className="w-5 h-5 text-white mr-3" />
                  L3 Support
                </li>
              </ul>

              <button
                onClick={goToAnalyzer}
                className="w-full py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl"
              >
                Go Unlimited
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGN IN MODAL */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors font-black"
            >
              [ ESC ]
            </button>
            <div className="pt-4">
               <SignIn routing="hash" signUpUrl="/sign-up" />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">
          © 2026 Developed by Amel K Sunil.
        </p>
      </footer>
    </div>
  );
}