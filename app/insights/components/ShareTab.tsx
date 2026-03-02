import React, { useState } from 'react';
import { Mail, MessageSquare, Check } from 'lucide-react';

interface ShareTabProps {
    handleShareToOutlook: () => void;
    handleShareToTeams: () => Promise<void> | void;
}

export function ShareTab({ handleShareToOutlook, handleShareToTeams }: ShareTabProps) {
    const [isCopied, setIsCopied] = useState(false);

    const onTeamsClick = async () => {
        await handleShareToTeams();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 4000);
    };

    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8">
            <div className="flex gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center rounded-full border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.2)] group hover:scale-105 transition-transform duration-500">
                    <MessageSquare className="w-8 h-8 text-indigo-400 group-hover:drop-shadow-[0_0_15px_rgba(79,70,229,0.8)] transition-all" />
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center rounded-full border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.2)] group hover:scale-105 transition-transform duration-500">
                    <Mail className="w-8 h-8 text-orange-400 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Share Meeting Report</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Instantly distribute meeting summaries and action items directly to Microsoft Teams or attach the full PDF report via Outlook.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                    onClick={onTeamsClick}
                    className={`group relative w-full sm:w-auto px-6 py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 overflow-hidden ${isCopied
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105'
                            : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1'
                        }`}
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {isCopied ? (
                            <><Check className="w-5 h-5 animate-in zoom-in duration-300" /> Copied to Clipboard!</>
                        ) : (
                            <><MessageSquare className="w-5 h-5" /> Teams Summary</>
                        )}
                    </span>
                    {!isCopied && <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                </button>

                <button
                    onClick={handleShareToOutlook}
                    className="group relative w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <Mail className="w-5 h-5" /> Outlook PDF
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-6 max-w-sm font-medium bg-white/5 px-4 py-3 rounded-lg border border-white/5 leading-relaxed">
                <strong className="text-white">Note:</strong> Teams will open a link to paste the formatted text directly into a channel. Outlook requires <strong className="text-gray-300">manually attaching</strong> the automatically downloaded PDF.
            </p>
        </div>
    );
}
