import React from 'react';
import { Download } from 'lucide-react';

interface SummaryTabProps {
    summaryLang: 'EN' | 'HI' | 'SPEAKER';
    speakerLang: 'E' | 'H';
    summaryData: string;
    summaryDataHi: string;
    summaryDataSpeakers: string;
    summaryDataSpeakersHi: string;
    setSummaryLang: (lang: 'EN' | 'HI' | 'SPEAKER') => void;
    setSpeakerLang: (lang: 'E' | 'H') => void;
    isDownloadDropdownOpen: boolean;
    setIsDownloadDropdownOpen: (open: boolean) => void;
    handleSummaryDownloadTxt: () => void;
    handleSummaryDownloadDocx: () => void;
    handleSummaryDownloadPdf: () => void;
}

export function SummaryTab({
    summaryLang,
    speakerLang,
    summaryData,
    summaryDataHi,
    summaryDataSpeakers,
    summaryDataSpeakersHi,
    setSummaryLang,
    setSpeakerLang,
    isDownloadDropdownOpen,
    setIsDownloadDropdownOpen,
    handleSummaryDownloadTxt,
    handleSummaryDownloadDocx,
    handleSummaryDownloadPdf
}: SummaryTabProps) {
    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6 flex-shrink-0 gap-4 w-full">
                <h2 className={`text-xl xl:text-2xl font-bold tracking-tight border-l-4 pl-3 ${summaryLang === 'EN' ? 'text-white border-blue-500' : summaryLang === 'HI' ? 'text-white border-green-500' : 'text-white border-orange-500'} truncate mr-auto`}>
                    {summaryLang === 'EN' ? 'Summary of Video Content' : summaryLang === 'HI' ? 'Video Content ka Summary' : 'Speaker-wise Summary'}
                </h2>

                <div className="flex flex-nowrap items-center gap-3 shrink-0">
                    <div className="relative">
                        <button
                            onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                            className="flex bg-black/40 rounded items-center border border-white/10 overflow-hidden hover:bg-white/10 transition-colors px-3 py-1.5 text-gray-400 group"
                        >
                            <Download className="w-4 h-4 group-hover:text-white transition-colors" />
                        </button>

                        {isDownloadDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-[#1a1a24] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                                <div className="flex flex-col">
                                    <button
                                        onClick={handleSummaryDownloadTxt}
                                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                                    >
                                        Download TXT
                                    </button>
                                    <button
                                        onClick={handleSummaryDownloadDocx}
                                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                                    >
                                        Download DOCX
                                    </button>
                                    <button
                                        onClick={handleSummaryDownloadPdf}
                                        className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shadow-inner">
                        <button onClick={() => setSummaryLang('EN')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'EN' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>ENG</button>
                        <button onClick={() => setSummaryLang('HI')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'HI' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>HING</button>
                        <button onClick={() => setSummaryLang('SPEAKER')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'SPEAKER' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>BY SPEAKER</button>
                    </div>

                    {summaryLang === 'SPEAKER' && (
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shadow-inner">
                            <button onClick={() => setSpeakerLang('E')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${speakerLang === 'E' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>E</button>
                            <button onClick={() => setSpeakerLang('H')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${speakerLang === 'H' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>H</button>
                        </div>
                    )}
                </div>
            </div>

            {summaryLang === 'EN' ? (
                <div className="text-[14px] text-gray-300 leading-relaxed bg-white/5 p-6 rounded-xl border border-white/5 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                    {summaryData || "No summary available."}
                </div>
            ) : summaryLang === 'HI' ? (
                <div className="text-[14px] text-gray-300 leading-relaxed bg-green-900/10 p-6 rounded-xl border border-green-500/20 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                    {summaryDataHi || "Hinglish summary is loading or not available. Re-process video to generate."}
                </div>
            ) : (
                <div className="text-[14px] text-gray-300 leading-relaxed bg-orange-900/10 p-6 rounded-xl border border-orange-500/20 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                    {speakerLang === 'E' ? (summaryDataSpeakers || "Speaker-wise english summary is loading or not available. Re-process video to generate.") : (summaryDataSpeakersHi || "Speaker-wise hinglish summary is loading or not available. Re-process video to generate.")}
                </div>
            )}
        </div>
    );
}
