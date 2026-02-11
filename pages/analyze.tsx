"use client";

import { useState } from "react";
import { useUser, SignIn } from "@clerk/nextjs";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function AnalyzePage() {
  const { isSignedIn, user } = useUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userTier = user?.publicMetadata?.tier || "free";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    if (userTier === "free") {
      alert("Free tier: only 1 analysis per session is allowed.");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult("Analysis complete! AI detected: Cat, Tree, Sun.");
      setIsAnalyzing(false);
    }, 2000);
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">
            Please Sign In
          </h2>
          <SignIn routing="hash" signUpUrl="/sign-up" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-center">AI Image Analyzer</h1>
      <div className="flex flex-col items-center gap-4">
        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full max-w-md text-gray-700 dark:text-gray-200" />
        {previewUrl && <img src={previewUrl} alt="Preview" className="w-64 h-64 object-cover rounded-2xl shadow-lg mt-4" />}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedImage}
          className="mt-4 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Start Analysis"}
        </button>
        {analysisResult && (
          <div className="mt-6 max-w-xl text-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p>{analysisResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
