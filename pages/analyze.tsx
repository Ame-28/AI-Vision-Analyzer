"use client"

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Protect, UserButton } from '@clerk/nextjs';

function ImageAnalyzerContent() {
    const [file, setFile] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<string>(""); 
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");

        setLoading(true);
        setFeedback(""); 

        const formData = new FormData();
        formData.append("file", file);

        // --- Use your specific logic for the URL ---
        const url = process.env.NODE_ENV === "development" 
            ? "http://127.0.0.1:8000/api/analyze" 
            : "/api/analyze";

        try {
            const res = await fetch(url, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            
            if (res.ok) {
                setFeedback(data.feedback); 
            } else {
                setFeedback("Error: " + data.detail);
            }
        } catch (err) {
            setFeedback("Could not reach server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    AI Vision Insights
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Upload an image and let AI analyze the details for you
                </p>
            </header>

            <div className="max-w-3xl mx-auto">
                {/* Upload Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input 
                            type="file" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button 
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="w-full sm:w-auto px-8 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {loading ? "Analyzing..." : "Analyze"}
                        </button>
                    </div>
                </div>

                {/* Markdown Feedback Card */}
                <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-95">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-pulse text-indigo-500 font-medium">
                                AI is examining your image...
                            </div>
                        </div>
                    ) : feedback ? (
                        <div className="markdown-content text-gray-700 dark:text-gray-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {feedback}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No analysis yet. Upload an image above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
            {/* Top Right User Menu */}
            <div className="absolute top-4 right-4 z-10">
                <UserButton showName={true} />
            </div>

            <Protect
                fallback={
                    <div className="container mx-auto px-4 py-12 text-center">
                        <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
                        <p className="mb-8 text-gray-600">Please sign in to use the Vision AI.</p>
                    </div>
                }
            >
                <ImageAnalyzerContent />
            </Protect>
        </main>
    );
}