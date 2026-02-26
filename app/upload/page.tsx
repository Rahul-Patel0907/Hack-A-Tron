"use client";

import React, { useState } from 'react';
import { ScanFace, UploadCloud, FileVideo, ArrowLeft, CheckCircle, Sparkles, History, X, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface PastSummary {
    id: string;
    fileName: string;
    timestamp: number;
    summary: string;
    fullData?: any;
}

export default function UploadPage() {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [messageIndex, setMessageIndex] = useState(0);
    const [history, setHistory] = useState<PastSummary[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<PastSummary | null>(null);

    const handleViewHistoryDetails = (item: PastSummary) => {
        if (!item.fullData) {
            // Fallback for summaries already cached without full data
            setSelectedHistoryItem(item);
            return;
        }
        localStorage.setItem('meetingInsights', JSON.stringify(item.fullData));
        localStorage.setItem('videoName', item.fileName);
        localStorage.removeItem('videoObjectUrl'); // Keep empty to prevent large bloat issues
        router.push('/insights');
    };

    const loadingMessages = [
        "Uploading meeting recording...",
        "Transcribing speech with AI magic...",
        "Analyzing meeting health score...",
        "Whoa, this is a long one. Keep holding...",
        "Our GPU servers are sweating right now 🥵",
        "Did you upload a feature film?! 🎥",
        "Bribing the AI to work faster... 💸",
        "Calculating... calculating... calculating...",
        "You should probably grab a coffee ☕",
        "At this point, you could have just sent an email...",
        "Still here! Promise it hasn't crashed... 🤞",
        "Okay, any second now... maybe."
    ];

    React.useEffect(() => {
        // Load history and clear items older than 24 hours
        try {
            const stored = localStorage.getItem('meetingHistory');
            if (stored) {
                let parsed: PastSummary[] = JSON.parse(stored);
                const now = new Date().getTime();
                const oneDayMs = 24 * 60 * 60 * 1000;
                parsed = parsed.filter(item => now - item.timestamp < oneDayMs);
                localStorage.setItem('meetingHistory', JSON.stringify(parsed));
                setHistory(parsed.sort((a, b) => b.timestamp - a.timestamp));
            }
        } catch (error) {
            console.error("Error loading history", error);
        }

        let interval: ReturnType<typeof setInterval>;
        if (uploading && progress < 100) {
            interval = setInterval(() => {
                setMessageIndex(prev => Math.min(prev + 1, loadingMessages.length - 1));
            }, 30000);
        } else {
            setMessageIndex(0);
        }
        return () => clearInterval(interval);
    }, [uploading, progress, loadingMessages.length]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const startUpload = async (file: File) => {
        setUploadedFile(file);
        setUploading(true);
        setProgress(0);

        // Simulate progress while waiting for backend
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 5;
                return next >= 90 ? 90 : next;
            });
        }, 500);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/process-video', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Backend processing failed');
            }

            const data = await response.json();

            // Save the data to be used by the /insights page
            localStorage.setItem('meetingInsights', JSON.stringify(data));
            localStorage.setItem('videoName', file.name);
            localStorage.setItem('videoObjectUrl', URL.createObjectURL(file));

            // Save basic summary to 24-hour history
            if (data.summary) {
                const newHistoryItem: PastSummary = {
                    id: Date.now().toString(),
                    fileName: file.name,
                    timestamp: Date.now(),
                    summary: data.summary,
                    fullData: data
                };
                setHistory(prev => {
                    const updated = [newHistoryItem, ...prev];
                    localStorage.setItem('meetingHistory', JSON.stringify(updated));
                    return updated;
                });
            }

            clearInterval(interval);
            setProgress(100);
            setTimeout(() => setUploading(false), 500); // Give it a moment to show 100%
        } catch (error) {
            console.error('Error during processing:', error);
            alert('An error occurred. Make sure your local Python API is running.');
            clearInterval(interval);
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'video/mp4' || file.name.endsWith('.mp4')) {
                startUpload(file);
            } else {
                alert("Please upload an MP4 video file.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            startUpload(e.target.files[0]);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden antialiased selection:bg-blue-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ScanFace className="w-6 h-6 text-blue-400" />
                        <span className="text-xl font-bold tracking-tight text-white">Meet<span className="text-blue-400">Miner</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsHistoryModalOpen(true)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-full border shadow-lg ${history.length > 0 ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' : 'text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/10 border-white/10'}`}>
                            <History className="w-4 h-4" /> Past Summaries
                            <span className={`${history.length > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'} text-[10px] px-1.5 py-0.5 rounded ml-1 font-bold`}>{history.length}</span>
                        </button>
                        <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Upload your Meeting
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Drop your MP4 recording here. We'll generate a transcript and summary in English and Hinglish instantly.
                    </p>
                </div>

                <div
                    className={`glass border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-white/10 hover:border-blue-500/50 bg-black/20'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploading || progress === 100 ? (
                        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
                            {progress === 100 ? (
                                <CheckCircle className="w-16 h-16 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                            ) : (
                                <div className="w-48 h-48 mb-2 flex items-center justify-center -mt-6">
                                    <DotLottieReact
                                        src="/animation.lottie"
                                        loop
                                        autoplay
                                    />
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-white mb-2 transition-opacity duration-300">
                                {progress === 100 ? 'Analysis Complete! 🎉' : loadingMessages[messageIndex]}
                            </h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto truncate w-full">
                                {uploadedFile?.name || 'meeting_recording.mp4'}
                            </p>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full" style={{ animation: "scan 2s linear infinite" }}></div>
                                </div>
                            </div>

                            <div className="text-sm font-bold text-blue-400 mb-8">
                                {progress}%
                            </div>

                            {progress === 100 && (
                                <Link
                                    href="/insights"
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Extract Insights
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="w-24 h-24 rounded-full bg-white/5 mb-8 flex items-center justify-center shadow-2xl border border-white/10 relative group cursor-pointer overflow-hidden transition-all hover:bg-white/10">
                                <UploadCloud className="w-10 h-10 text-blue-400 relative z-10 group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Drag & Drop your video</h3>
                            <p className="text-gray-400 mb-10 text-lg">MP4 formats only, up to 500MB</p>

                            <label className="cursor-pointer group">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/mp4"
                                    onChange={handleFileChange}
                                />
                                <div className="px-8 py-4 rounded-full bg-white/10 text-white font-medium group-hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 shadow-xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <FileVideo className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                                    Browse Files
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f0f15] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-emerald-400" /> Recent Summaries (Last 24h)</h2>
                            <button onClick={() => { setIsHistoryModalOpen(false); setSelectedHistoryItem(null); }} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-black/20">
                            {selectedHistoryItem ? (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <button onClick={() => setSelectedHistoryItem(null)} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-6 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full w-fit">
                                        <ArrowLeft className="w-4 h-4" /> Back to list
                                    </button>
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        {selectedHistoryItem.fileName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 bg-white/5 w-fit px-2 py-1 rounded">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(selectedHistoryItem.timestamp).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                                        {selectedHistoryItem.summary}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.length === 0 ? (
                                        <p className="text-center text-gray-500 py-10">No recent summaries found.</p>
                                    ) : (
                                        history.map(item => (
                                            <div key={item.id} onClick={() => handleViewHistoryDetails(item)} className="group bg-black/40 border border-white/5 hover:border-emerald-500/30 p-5 rounded-xl cursor-pointer transition-all hover:bg-white/5 shadow-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-emerald-500/70" />
                                                        {item.fileName}
                                                    </h4>
                                                    <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed bg-black/20 p-3 rounded-lg">
                                                    {item.summary}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-xs font-medium">
                                                    <span className="text-emerald-500/70 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                                                        Click to view details &rarr;
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
