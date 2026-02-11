"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton, SignIn } from "@clerk/nextjs";
import { CheckCircleIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function AnalyzePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [usage, setUsage] = useState({
    analyses_used: 0,
    limit: 1 as number | "unlimited",
    tier: "free",
  });

  // Fetch usage stats when user loads the page
  useEffect(() => {
    if (isSignedIn && user) {
      fetchUsage();
    }
  }, [isSignedIn, user]);

  const fetchUsage = async () => {
    try {
      // For this specific setup, we pass the email as the token to match the backend list
      const identifier = user?.primaryEmailAddress?.emailAddress || "guest";
      const res = await fetch("/api/usage", {
        headers: { Authorization: `Bearer ${identifier}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error("Error fetching usage:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);

    try {
      const identifier = user.primaryEmailAddress?.emailAddress || "guest";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/analyze`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${identifier}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      setAnalysis(data.analysis);
      setUsage({
        analyses_used: data.analyses_used,
        limit: data.limit,
        tier: data.tier,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <SignIn routing="hash" />
      </div>
    );
  }

  const isLimitReached = usage.tier === "free" && usage.analyses_used >= (usage.limit as number);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold italic">VISION<span className="text-indigo-600">AI</span></h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Usage Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 uppercase">Account Status</p>
            <p className={`text-lg font-bold ${usage.tier === 'premium' ? 'text-purple-500' : 'text-indigo-500'}`}>
              {usage.tier.toUpperCase()} {usage.tier === 'premium' ? '★' : ''}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 uppercase">Analyses Used</p>
            <p className="text-lg font-bold">
              {usage.analyses_used} / {usage.limit === "unlimited" ? "∞" : usage.limit}
            </p>
          </div>
        </div>

        {/* Upload Box */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
          <label className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isLimitReached ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudArrowUpIcon className="w-12 h-12 mb-4 text-indigo-500" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} disabled={isLimitReached} />
          </label>

          {preview && (
            <div className="mt-6 flex flex-col items-center">
              <img src={preview} alt="Preview" className="max-h-64 rounded-xl mb-4 shadow-md" />
              <button
                onClick={handleAnalyze}
                disabled={loading || isLimitReached}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Analyze Now"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {analysis && (
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                <h3 className="font-bold text-lg">Analysis Result</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}