"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

    // Constants for validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    useEffect(() => {
        if (isLoaded && user) {
            const storedUsage = (user.unsafeMetadata.usageCount as number) || 0;
            const storedTier = (user.unsafeMetadata.tier as string) || "Free";
            setUsage(storedUsage);
            setTier(storedTier);
            fetchUsage();
          
        }
    }, [isLoaded, user]);

    const isLimitReached = tier === "Free" && usage >= limit;

    const handleUpgrade = () => {
        const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
        if (stripeUrl) window.location.href = stripeUrl;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        
        if (selectedFile) {
            // Check Format
            if (!ALLOWED_FORMATS.includes(selectedFile.type)) {
                setFeedback("**Unsupported Format:** Please use JPG, PNG, or WebP.");
                setFile(null);
                setPreview(null);
                return;
            }

            // Check Size
            if (selectedFile.size > MAX_FILE_SIZE) {
                setFeedback("**File Too Large:** Maximum size is 5MB. Please choose a smaller image.");
                setFile(null);
                setPreview(null);
                return;
            }

            // If valid
            setFeedback("");
            setFile(selectedFile);
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
            // Updated fetch with user headers
            const res = await fetch(url, { 
                method: "POST", 
                body: formData,
                headers: {
                    "X-User-Id": user.id,
                    "X-User-Tier": tier 
                }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setFeedback(data.feedback); 
                const newUsage = usage + 1;
                setUsage(newUsage);
                await user.update({ unsafeMetadata: { ...user.unsafeMetadata, usageCount: newUsage } });
            } else { 
                // Specific error handling for status codes
                if (res.status === 413) {
                    setFeedback("⚠️**Error:** File is too large for the server (Max 5MB).");
                } else if (res.status === 429) {
                    setFeedback("**Limit Reached:** Please upgrade to Premium for more scans.");
                } else {
                    setFeedback(`**Error:** ${data.detail || "Server failed."}`); 
                }
            }
        } catch (err) { 
            setFeedback("**Connection Error:** Check if the backend is running."); 
        } finally { 
            setLoading(false); 
        }
    };
    const fetchUsage = async () => {
      if (!user) return;
  
      // Use the same URL logic as handleUpload
      const url = process.env.NODE_ENV === "development" 
          ? "http://127.0.0.1:8000/api/usage" 
          : "/api/usage";
  
      try {
          const response = await fetch(url, {
              method: "GET",
              headers: {
                  "X-User-Id": user.id,
                  "X-User-Tier": tier || "Free"
              }
          });
  
          const data = await response.json();
          if (response.ok) {
              setUsage(data.analyses_used); 
          }
      } catch (err) {
          console.error("Failed to sync usage with backend:", err);
      }
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
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full max-w-[1400px] mx-auto min-h-[700px]">
            {/* LEFT SIDE: CONTROLS */}
            <div className="w-full lg:w-[400px] flex flex-col shrink-0 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Member Tier</p>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                {tier} {tier === "Premium" ? "💎" : "✨"}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Usage Tracker</p>
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono font-bold text-white">
                                {tier === "Premium" ? "∞" : `${usage} / ${limit}`}
                            </span>
                        </div>
                    </div>
                    {tier === "Free" && (
                        <>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
                                <div className="bg-indigo-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                     style={{ width: `${(usage / limit) * 100}%` }} />
                            </div>
                            {isLimitReached && (
                                <button onClick={handleUpgrade} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 animate-pulse">
                                    🚀 Upgrade to Premium
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex-1 flex flex-col relative">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Input Source</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accept: .jpg, .jpeg, .png, .webp | Max size: 5MB</p>
                    </div>
                    <div className="flex-1 flex flex-col space-y-6">
                        <label className={`relative flex-1 flex flex-col items-center justify-center w-full border border-dashed rounded-[2.5rem] transition-all cursor-pointer overflow-hidden ${isLimitReached ? "opacity-20 grayscale" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/50"}`}>
                            {preview ? (
                                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Drop Media File</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isLimitReached} accept="image/*" />
                        </label>
                        <button onClick={handleUpload} disabled={loading || !file || isLimitReached} className="w-full py-5 bg-white text-black hover:bg-indigo-500 hover:text-white font-black rounded-[1.5rem] shadow-2xl active:scale-95 disabled:opacity-10 uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3">
                            {loading ? "Initializing..." : "Run Analysis"}
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-8">
                         <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{file ? file.name.slice(0, 20) : "No Source Loaded"}</p>
                        {file && !loading && (
                            <button onClick={() => {setFile(null); setPreview(null); setFeedback("");}} className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-red-500">
                                [ Clear ]
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: RESULTS */}
            <div className="flex-1 min-h-0">
                <div className="bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-3xl relative">
                    <div className="px-10 py-8 border-b border-white/10 bg-white/[0.02] flex justify-between items-center shrink-0">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 block mb-1">Telemetry</span>
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Analysis Report</h3>
                        </div>
                        {feedback && !loading && (
                            <button onClick={downloadAnalysis} className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95">Download TXT</button>
                        )}
                    </div>
                    <div className="p-10 flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6">
                                <div className="flex gap-3">
                                    <div className="w-2 h-8 bg-indigo-500 animate-bounce"></div>
                                    <div className="w-2 h-8 bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-8 bg-indigo-300 animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Processing Neural Nets...</p>
                            </div>
                        ) : feedback ? (
                            <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-p:text-gray-400 prose-p:text-sm prose-strong:text-white">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{feedback}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <div className="w-20 h-20 mb-6 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                                </div>
                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Awaiting Input</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Deploy image for intelligent vision processing.</p>
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
        <main className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-indigo-500 overflow-x-hidden">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <header className="fixed top-0 w-full bg-black/40 backdrop-blur-3xl z-50 border-b border-white/5 h-20">
                <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center h-full">
                    <div className="flex items-center gap-8">
                        <button onClick={() => router.push('/')} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </div>
                            Exit Workspace
                        </button>
                        <h1 className="hidden md:block text-2xl font-black tracking-tighter text-white uppercase italic"> AI Vision <span className="text-indigo-500">Analyzer</span></h1>
                    </div>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-white/10" } }} />
                </div>
            </header>

            <div className="pt-32 pb-20 px-10 relative z-10">
                <Protect fallback={<div className="text-center h-[60vh] flex items-center justify-center font-black uppercase text-6xl italic text-white/5">Access Denied</div>}>
                    <ImageAnalyzerContent />
                </Protect>
            </div>
        </main>
    );
}