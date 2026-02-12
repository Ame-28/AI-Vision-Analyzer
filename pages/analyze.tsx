"use client"
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Protect, UserButton } from '@clerk/nextjs';

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<string>(""); 
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
        setLoading(true);
        setFeedback(""); 

        const formData = new FormData();
        formData.append("file", file);

        // This allows local testing on Port 8000 but uses the Vercel path in production
        const url = process.env.NODE_ENV === "development" 
            ? "http://127.0.0.1:8000/api/analyze" 
            : "/api/analyze";

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            
            if (res.ok) {
                setFeedback(data.feedback); 
            } else {
                setFeedback("**Error:** " + (data.detail || "Server failed to process image."));
            }
        } catch (err) {
            setFeedback("**Connection Error:** The frontend could not reach the backend. Check Vercel logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">AI Image Analyzer</h1>
                    <UserButton />
                </div>

                <Protect fallback={<p>Please sign in to continue.</p>}>
                    <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                    />
                    <button 
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? "Analyzing..." : "Analyze Image"}
                    </button>

                    <div className="mt-8 p-4 border rounded-lg bg-gray-50 prose">
                        <ReactMarkdown>{feedback || "Results will appear here..."}</ReactMarkdown>
                    </div>
                </Protect>
            </div>
        </main>
    );
}