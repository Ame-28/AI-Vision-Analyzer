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
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">

      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            AI Vision Analyzer
          </h1>

          <div className="flex items-center space-x-4">
            {!isSignedIn ? (
              <button
                onClick={() => setShowSignIn(true)}
                className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-full shadow hover:scale-105 transition"
              >
                {getNavbarButtonText()}
              </button>
            ) : (
              <>
                <button
                  onClick={goToAnalyzer}
                  className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full shadow hover:scale-105 transition"
                >
                  {getNavbarButtonText()}
                </button>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Analyze Your Images{" "}
            <span className="text-indigo-600 dark:text-indigo-400">with AI</span>
          </h2>

          <p className="text-lg md:text-xl mb-10 text-gray-700 dark:text-gray-300">
            Upload images and get <strong>fast, accurate AI-powered insights</strong>.
          </p>

          <button
            onClick={goToAnalyzer}
            className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition uppercase tracking-wide"
          >
            {getHeroButtonText()}
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-extrabold text-center mb-16">
            Key Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-md hover:shadow-xl transform hover:-translate-y-2 transition relative"
              >
                <div className="absolute -top-6 left-6 w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg">
                  <feature.icon className="w-6 h-6" />
                </div>

                <h4 className="text-2xl font-bold mb-3 mt-6 text-indigo-600 dark:text-indigo-400">
                  {feature.title}
                </h4>

                <p className="text-gray-700 dark:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-extrabold mb-16">
            Pricing Plans
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* FREE */}
            <div className="p-10 rounded-3xl bg-white dark:bg-gray-800 shadow-lg">
              <h4 className="text-3xl font-bold mb-4 text-blue-600">Free</h4>

              <ul className="mb-6 space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  1 analysis per session
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Basic AI analysis
                </li>
              </ul>

              <span className="text-4xl font-extrabold">$0</span>
              <p className="text-gray-500 mb-6">per month</p>

              <button
                onClick={goToAnalyzer}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full"
              >
                {getHeroButtonText()}
              </button>
            </div>

            {/* PREMIUM */}
            <div className="p-10 rounded-3xl bg-purple-100 dark:bg-purple-900 shadow-lg">
              <h4 className="text-3xl font-bold mb-4 text-purple-600">Premium</h4>

              <ul className="mb-6 space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Unlimited analyses
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Advanced descriptions
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>

              <span className="text-4xl font-extrabold">$5</span>
              <p className="text-gray-500 mb-6">per month</p>

              <button
                onClick={goToAnalyzer}
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-full"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGN IN MODAL */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4"
            >
              ✕
            </button>

            <SignIn routing="hash" signUpUrl="/sign-up" />
          </div>
        </div>
      )}
    </div>
  );
}
