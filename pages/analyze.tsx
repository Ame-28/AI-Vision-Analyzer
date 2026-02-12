"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Protect, UserButton, useUser } from '@clerk/nextjs';

function ImageAnalyzerContent() {
    const { user, isLoaded } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string>(""); 
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState<number>(0);
    const [tier, setTier] = useState<string>("Free");
    const limit = 1;

    useEffect(() => {
        if (isLoaded && user) {
            const storedUsage = (user.unsafeMetadata.usageCount as number) || 0;
            const storedTier = (user.unsafeMetadata.tier as string) || "Free";
            setUsage(storedUsage);
            setTier(storedTier);
        }
    }, [isLoaded, user]);

    const isLimitReached = tier === "Free" && usage >= limit;

    const handleUpgrade = async () => {
        if (!user) return;
        try {
            await user.update({ unsafeMetadata: { ...user.unsafeMetadata, tier: "Premium" } });
            setTier("Premium");
        } catch (err) { console.error("Upgrade failed", err); }
    };

    const handleResetToFree = async () => {
        if (!user) return;
        try {
            await user.update({
                unsafeMetadata: { ...user.unsafeMetadata, tier: "Free", usageCount: 0 }
            });
            setTier("Free");
            setUsage(0);
            alert("Account reset to Free tier!");
        } catch (err) { console.error("Reset failed", err); }
    };

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
        if (!file || isLimitReached || !user) return;
        setLoading(true);
        setFeedback(""); 
        const formData = new FormData();
        formData.append("file", file);
        const url = process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/api/analyze" : "/api/analyze";
        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) {
                setFeedback(data.feedback); 
                const newUsage = usage + 1;
                setUsage(newUsage);
                await user.update({ unsafeMetadata: { ...user.unsafeMetadata, usageCount: newUsage } });
            } else { setFeedback(`**Error:** ${data.detail || "Server failed."}`); }
        } catch (err) { setFeedback("**Connection Error:** Check backend."); }
        finally { setLoading(false); }
    };

    const downloadAnalysis = () => {
        if (!feedback) return;
        const element = document.createElement("a");
        const cleanText = feedback.replace(/[#*`]/g, "");
        const fileBlob = new Blob([cleanText], { type: 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = `analysis-${new Date().getTime()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        /* UNIVERSAL WRAPPER: Responsive Height based on Viewport */
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto lg:h-[75vh] items-stretch px-4 lg:px-6">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col w-full lg:w-[45%] gap-6">
                
                {/* SUBSCRIPTION PANEL */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-[2.5rem] p-6 shadow-2xl border border-white/20 dark:border-gray-700 flex flex-col justify-center min-h-[140px]">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500/80 mb-1">Status</p>
                            <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
                                {tier} {tier === "Premium" ? "💎" : "✨"}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Credits</p>
                            <div className="bg-indigo-600 dark:bg-indigo-500 px-4 py-1 rounded-full inline-block shadow-lg shadow-indigo-500/20">
                                {tier === "Premium" ? (
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Unlimited</span>
                                ) : (
                                    <p className="text-sm font-black text-white font-mono">{usage} / {limit}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {tier === "Free" && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-700" style={{ width: `${(usage / limit) * 100}%` }} />
                        </div>
                    )}
                    {isLimitReached && (
                        <button onClick={handleUpgrade} className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-transform">
                            Upgrade to Premium
                        </button>
                    )}
                </div>

                {/* UPLOAD PANEL */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-white/20 dark:border-gray-700 flex-1 flex flex-col min-h-[450px] lg:min-h-0">
                    <div className="mb-8 text-center shrink-0">
                        <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none mb-2">Upload Your Image</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-80">JPG, PNG, WEBP • Max 5MB</p>
                    </div>

                    <div className="flex-1 flex flex-col space-y-6">
                        <label className={`group relative flex-1 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-[2rem] transition-all cursor-pointer overflow-hidden ${isLimitReached ? "opacity-40 grayscale pointer-events-none" : "bg-white/40 dark:bg-gray-900/40 border-indigo-100 hover:border-indigo-500"}`}>
                            {preview ? <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" /> : (
                                <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                    <div className="text-6xl mb-4 drop-shadow-2xl">🖼️</div>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Drop file here</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{file ? file.name : "Ready for Input"}</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isLimitReached} accept="image/*" />
                        </label>

                        <button onClick={handleUpload} disabled={loading || !file || isLimitReached} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 active:scale-[0.97] disabled:opacity-30 uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            {loading ? "Analyzing..." : "Analyze Now"}
                        </button>
                    </div>

                    <div className="flex justify-between items-center mt-8 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">
                        <button onClick={handleResetToFree}>System Reset</button>
                        {file && <button onClick={() => {setFile(null); setPreview(null); setFeedback("");}} className="text-red-500">[ Clear ]</button>}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (ANALYSIS) */}
            <div className="w-full lg:w-[55%] h-full min-h-[500px] lg:min-h-0">
                <div className="bg-gray-900 dark:bg-gray-950 rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-white/5 overflow-hidden">
                    <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 block mb-1">Engine Output</span>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Analysis Results</h3>
                        </div>
                        {feedback && !loading && (
                            <button onClick={downloadAnalysis} className="text-[10px] font-black uppercase tracking-widest bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl">
                                DOWNLOAD TXT
                            </button>
                        )}
                    </div>

                    <div className="p-10 lg:p-14 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                <div className="flex gap-3">
                                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
                                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping [animation-delay:0.2s]"></div>
                                    <div className="w-4 h-4 bg-pink-500 rounded-full animate-ping [animation-delay:0.4s]"></div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Decoding Visual Data</p>
                            </div>
                        ) : feedback ? (
                            <div className="prose prose-invert prose-indigo max-w-none 
                                prose-p:text-gray-400 prose-p:leading-relaxed prose-p:text-lg
                                prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                                prose-strong:text-indigo-400 prose-hr:border-white/10">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{feedback}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                                <div className="text-8xl mb-6 grayscale">📡</div>
                                <h4 className="text-2xl font-black text-white uppercase mb-2">Awaiting Data</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feed the AI an image to start</p>
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
        <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            {/* AMBIENT BACKGROUND GLOWS */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <header className="fixed top-0 w-full bg-black/40 backdrop-blur-3xl z-50 border-b border-white/5 h-20">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center h-full">
                    <div className="flex items-center gap-8">
                        <button onClick={() => router.back()} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all">
                            <div className="p-2.5 rounded-full border border-white/10 group-hover:border-white/40 transition-all">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </div>
                            Back
                        </button>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                            Vision <span className="text-indigo-500">Analyzer</span>
                        </h1>
                    </div>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-white/10" } }} />
                </div>
            </header>
            
            <div className="flex-1 flex items-center justify-center pt-24 lg:pt-20 pb-12 overflow-y-auto lg:overflow-hidden">
                <Protect fallback={<div className="font-black uppercase text-6xl tracking-tighter opacity-10">Protected</div>}>
                    <ImageAnalyzerContent />
                </Protect>
            </div>
        </main>
    );
}