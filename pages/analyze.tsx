"use client"

import { useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Protect, UserButton } from '@clerk/nextjs';

function ImageAnalyzerContent() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string>(""); 
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setFeedback(""); 

        const formData = new FormData();
        formData.append("file", file);

        const url = process.env.NODE_ENV === "development" 
            ? "http://127.0.0.1:8000/api/analyze" 
            : "/api/analyze";

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) setFeedback(data.feedback); 
            else setFeedback(`**Error:** ${data.detail || "Server failed."}`);
        } catch (err) {
            setFeedback("**Connection Error:** Check your backend deployment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Input & Preview (Sticky) */}
            <div className="w-full lg:w-5/12 lg:sticky lg:top-24 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Upload Image
                    </h2>
                    
                    <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-200 dark:border-gray-600 rounded-[1.5rem] bg-indigo-50/30 dark:bg-gray-900/50 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden">
                        {preview ? (
                            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 mb-4 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Drop your file here or click to browse</p>
                            </div>
                        )}
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>

                    <button 
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                        {loading ? "Analyzing..." : "Analyze Now"}
                    </button>
                    
                    {file && (
                        <button 
                            onClick={() => {setFile(null); setPreview(null); setFeedback("");}}
                            className="w-full mt-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: AI Response */}
            <div className="w-full lg:w-7/12">
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px]">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Analysis Results</span>
                        {loading && <div className="flex gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-.5s]"></div></div>}
                    </div>
                    
                    <div className="p-8 sm:p-12">
                        {feedback ? (
                            <div className="prose dark:prose-invert max-w-none prose-indigo prose-img:rounded-xl">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {feedback}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <svg className="w-20 h-20 mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                <h3 className="text-2xl font-bold mb-2">Ready for Action</h3>
                                <p className="max-w-xs mx-auto">Upload an image on the left to see the AI magic happen here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AnalyzePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
            <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm z-50 border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">
                            <div className="p-2 rounded-full border border-gray-200 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></div>
                            Back
                        </button>
                        <h1 className="text-xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">AI VISION ANALYZER</h1>
                    </div>
                    <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-indigo-500/20" } }} />
                </div>
            </header>

            <div className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
                <Protect fallback={
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <h2 className="text-5xl font-black mb-4">STOP!</h2>
                        <p className="text-xl text-gray-500 max-w-md">You need to be signed in to access the vision laboratory.</p>
                    </div>
                }>
                    <ImageAnalyzerContent />
                </Protect>
            </div>
        </main>
    );
}