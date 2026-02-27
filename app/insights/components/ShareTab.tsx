import React from 'react';
import { Mail } from 'lucide-react';

interface ShareTabProps {
    handleShareToOutlook: () => void;
}

export function ShareTab({ handleShareToOutlook }: ShareTabProps) {
    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center rounded-full mb-8 border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.2)] group hover:scale-105 transition-transform duration-500">
                <Mail className="w-10 h-10 text-orange-400 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Share Meeting Report</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Click below to instantly generate a comprehensive PDF containing the full transcript, summaries, and action items, and optionally attach it to an outgoing Outlook email draft.
            </p>
            <button
                onClick={handleShareToOutlook}
                className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-3">
                    Generate & Email via Outlook
                </span>
                <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
            <p className="text-xs text-gray-500 mt-6 max-w-xs font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/5">Note: Your PDF will download automatically. You must <strong className="text-gray-300">manually attach</strong> the downloaded file to the resulting email window.</p>
        </div>
    );
}
