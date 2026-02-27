"use client";

import React, { useState, useEffect } from 'react';
import { History, X, ArrowLeft, FileText, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PastSummary {
    id: string;
    fileName: string;
    timestamp: number;
    summary: string;
    fullData?: any;
}

export default function PastSummaries() {
    const router = useRouter();
    const [history, setHistory] = useState<PastSummary[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<PastSummary | null>(null);

    useEffect(() => {
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
    }, [isOpen]);

    const handleViewHistoryDetails = (item: PastSummary) => {
        if (!item.fullData) {
            setSelectedHistoryItem(item);
            return;
        }
        localStorage.setItem('meetingInsights', JSON.stringify(item.fullData));
        localStorage.setItem('videoName', item.fileName);
        localStorage.removeItem('videoObjectUrl');
        setIsOpen(false);
        router.push('/insights');
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-full border shadow-lg ${history.length > 0 ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' : 'text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/10 border-white/10'}`}>
                <History className="w-4 h-4" /> Past Summaries
                <span className={`${history.length > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'} text-[10px] px-1.5 py-0.5 rounded ml-1 font-bold`}>{history.length}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 pb-8 px-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#0f0f15] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-emerald-400" /> Recent Summaries (Last 24h)</h2>
                            <button onClick={() => { setIsOpen(false); setSelectedHistoryItem(null); }} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
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
        </>
    );
}
