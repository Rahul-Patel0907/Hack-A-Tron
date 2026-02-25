"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Copy, Download, ChevronDown, MessageSquare, ListTree, AlignLeft, Settings, Sparkles, Check, X, ShieldAlert, Target, HeartPulse, Activity, BarChart2, Search } from 'lucide-react';
import Link from 'next/link';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function InsightsPage() {
    const [summaryLang, setSummaryLang] = useState<'EN' | 'HI' | 'SPEAKER'>('EN');
    const [speakerLang, setSpeakerLang] = useState<'E' | 'H'>('E');
    const [transcriptData, setTranscriptData] = useState<{ speaker: string; text: string; start?: number; end?: number }[]>([]);
    const [chaptersData, setChaptersData] = useState<{ headline: string; summary: string; start: number; end: number }[]>([]);
    const [summaryData, setSummaryData] = useState<string>('');
    const [summaryDataHi, setSummaryDataHi] = useState<string>('');
    const [summaryDataSpeakers, setSummaryDataSpeakers] = useState<string>('');
    const [summaryDataSpeakersHi, setSummaryDataSpeakersHi] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoName, setVideoName] = useState<string>('Meeting Recording.mp4');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'transcript' | 'chapters'>('transcript');
    const [rightView, setRightView] = useState<'summary' | 'intelligence'>('summary');
    const [intelligenceData, setIntelligenceData] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [nameMap, setNameMap] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleJumpToTime = (ms?: number) => {
        if (ms === undefined || !videoRef.current) return;
        videoRef.current.currentTime = ms / 1000;
        videoRef.current.play();
    };

    const handleComingSoon = () => alert("This feature will be available in V2!");

    const handleDownloadTxt = () => {
        let textStr = '';
        let filename = '';
        if (activeTab === 'transcript') {
            if (!transcriptData.length) return;
            textStr = transcriptData.map(t => `${t.speaker} [${formatTime(t.start)}]: ${t.text}`).join('\n\n');
            filename = videoName.replace(/\.[^/.]+$/, "") + "_transcript.txt";
        } else {
            if (!chaptersData.length) return;
            textStr = chaptersData.map(c => `${c.headline} [${formatTime(c.start)}]\n${c.summary}`).join('\n\n');
            filename = videoName.replace(/\.[^/.]+$/, "") + "_chapters.txt";
        }
        const blob = new Blob([textStr], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadDocx = async () => {
        let children: any[] = [];
        let filename = '';

        if (activeTab === 'transcript') {
            if (!transcriptData.length) return;
            children = transcriptData.map(t => new Paragraph({
                children: [
                    new TextRun({ text: `${t.speaker} [${formatTime(t.start)}]: `, bold: true }),
                    new TextRun({ text: t.text })
                ]
            }));
            filename = videoName.replace(/\.[^/.]+$/, "") + "_transcript.docx";
        } else {
            if (!chaptersData.length) return;
            chaptersData.forEach(c => {
                children.push(new Paragraph({
                    children: [new TextRun({ text: `${c.headline} [${formatTime(c.start)}]`, bold: true })]
                }));
                children.push(new Paragraph({
                    children: [new TextRun({ text: c.summary })]
                }));
                children.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // empty space
            });
            filename = videoName.replace(/\.[^/.]+$/, "") + "_chapters.docx";
        }

        const doc = new Document({
            sections: [{ properties: {}, children: children }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
    };

    const getSummaryContent = () => {
        let content = '';
        if (summaryLang === 'EN') content = summaryData;
        if (summaryLang === 'HI') content = summaryDataHi;
        if (summaryLang === 'SPEAKER') {
            content = speakerLang === 'E' ? summaryDataSpeakers : summaryDataSpeakersHi;
        }
        return content;
    };

    const handleSummaryDownloadTxt = () => {
        const content = getSummaryContent();
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = videoName.replace(/\.[^/.]+$/, "") + "_summary.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSummaryDownloadDocx = async () => {
        const content = getSummaryContent();
        if (!content) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: content.split('\n').map(line => new Paragraph({
                    children: [new TextRun({ text: line })]
                }))
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, videoName.replace(/\.[^/.]+$/, "") + "_summary.docx");
    };

    const handleOpenSettings = () => {
        const uniqueSpeakers = Array.from(new Set(transcriptData.map(t => t.speaker)));
        const initialMap: Record<string, string> = {};
        uniqueSpeakers.forEach(s => { initialMap[s] = s; });
        setNameMap(initialMap);
        setIsSettingsModalOpen(true);
    };

    const handleSaveSettings = () => {
        const replaceNamesInText = (text: string, map: Record<string, string>) => {
            let newText = text;
            for (const [oldName, newName] of Object.entries(map)) {
                if (oldName !== newName && newName.trim() !== '') {
                    const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escapedOldName, 'g');
                    newText = newText.replace(regex, newName);
                }
            }
            return newText;
        };

        const newTranscript = transcriptData.map(t => ({
            ...t,
            speaker: nameMap[t.speaker] && nameMap[t.speaker].trim() !== '' ? nameMap[t.speaker] : t.speaker
        }));

        const newChapters = chaptersData.map(c => ({
            ...c,
            summary: replaceNamesInText(c.summary, nameMap)
        }));

        const newSummary = replaceNamesInText(summaryData, nameMap);
        const newSummaryHi = replaceNamesInText(summaryDataHi, nameMap);
        const newSummarySpeakers = replaceNamesInText(summaryDataSpeakers, nameMap);
        const newSummarySpeakersHi = replaceNamesInText(summaryDataSpeakersHi, nameMap);

        // Deep copy intelligence data to replace names within it safely
        let newIntelligence = null;
        if (intelligenceData) {
            newIntelligence = JSON.parse(JSON.stringify(intelligenceData));

            // Replace names in missed signals array
            if (newIntelligence.missed_signals) {
                newIntelligence.missed_signals = newIntelligence.missed_signals.map((s: string) => replaceNamesInText(s, nameMap));
            }

            // Replace names in health strengths/weaknesses
            if (newIntelligence.health) {
                if (newIntelligence.health.strengths) {
                    newIntelligence.health.strengths = newIntelligence.health.strengths.map((s: string) => replaceNamesInText(s, nameMap));
                }
                if (newIntelligence.health.weaknesses) {
                    newIntelligence.health.weaknesses = newIntelligence.health.weaknesses.map((w: string) => replaceNamesInText(w, nameMap));
                }
            }

            // Replace names in action items tasks and owners
            if (newIntelligence.action_items) {
                newIntelligence.action_items = newIntelligence.action_items.map((item: any) => ({
                    ...item,
                    task: item.task ? replaceNamesInText(item.task, nameMap) : item.task,
                    owner: item.owner ? replaceNamesInText(item.owner, nameMap) : item.owner
                }));
            }

            // Replace names in speaker metrics
            if (newIntelligence.speaker_metrics && newIntelligence.speaker_metrics.speakers) {
                newIntelligence.speaker_metrics.speakers = newIntelligence.speaker_metrics.speakers.map((spk: any) => ({
                    ...spk,
                    name: replaceNamesInText(spk.name, nameMap)
                }));
            }
        }

        setTranscriptData(newTranscript);
        setChaptersData(newChapters);
        setSummaryData(newSummary);
        setSummaryDataHi(newSummaryHi);
        setSummaryDataSpeakers(newSummarySpeakers);
        setSummaryDataSpeakersHi(newSummarySpeakersHi);
        setIntelligenceData(newIntelligence);

        const storedData = localStorage.getItem('meetingInsights');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                parsedData.transcript = newTranscript;
                parsedData.chapters = newChapters;
                parsedData.summary = newSummary;
                parsedData.summary_hi = newSummaryHi;
                parsedData.summary_speakers = newSummarySpeakers;
                parsedData.summary_speakers_hi = newSummarySpeakersHi;
                parsedData.meeting_intelligence = newIntelligence;
                localStorage.setItem('meetingInsights', JSON.stringify(parsedData));
            } catch (error) {
                console.error("Error updating local storage", error);
            }
        }
        setIsSettingsModalOpen(false);
    };

    const handleCopy = () => {
        if (!transcriptData.length) return;
        const textStr = transcriptData.map(t => `${t.speaker}: ${t.text}`).join('\n\n');
        navigator.clipboard.writeText(textStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (ms?: number) => {
        if (ms === undefined) return "--:--";
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        // Split text on highlight term, include term in parts array
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-blue-500/40 text-blue-100 rounded px-0.5 font-medium">{part}</mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    useEffect(() => {
        const storedData = localStorage.getItem('meetingInsights');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                setTranscriptData(parsedData.transcript || []);
                setChaptersData(parsedData.chapters || []);
                setSummaryData(parsedData.summary || '');
                setSummaryDataHi(parsedData.summary_hi || '');
                setSummaryDataSpeakers(parsedData.summary_speakers || '');
                setSummaryDataSpeakersHi(parsedData.summary_speakers_hi || '');
                setIntelligenceData(parsedData.meeting_intelligence || null);
            } catch (error) {
                console.error("Error parsing stored data", error);
            }
        }

        const storedVideoUrl = localStorage.getItem('videoObjectUrl');
        if (storedVideoUrl) setVideoUrl(storedVideoUrl);

        const storedVideoName = localStorage.getItem('videoName');
        if (storedVideoName) setVideoName(storedVideoName);

        setIsLoading(false);
    }, []);

    return (
        <div className="h-screen overflow-hidden bg-[#0a0a0f] text-gray-200 antialiased selection:bg-blue-500/30 font-sans flex flex-col">
            {/* Top Navigation */}
            <nav className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between z-50 sticky top-0 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <Link href="/upload" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2 max-w-xl truncate">
                        {videoName.replace(/\.mp4$/i, '')}
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 flex-shrink-0">.mp4</span>
                    </h1>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">

                {/* Left Side: Video & Transcript */}
                <div className="w-full lg:w-1/2 flex flex-col border-r border-white/10 bg-black/20 overflow-y-auto custom-scrollbar relative">

                    {/* Real Video Player */}
                    <div className="relative aspect-video bg-black flex-shrink-0 flex items-center justify-center overflow-hidden border-b border-white/10">
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                className="w-full h-full outline-none"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <Play className="w-12 h-12 opacity-50" />
                                <p>No video available</p>
                            </div>
                        )}
                    </div>

                    {/* Transcript Section */}
                    <div className="flex flex-col bg-[#0f0f15]">
                        {/* Tabs & Search */}
                        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40 sticky top-0 z-10 backdrop-blur-md gap-4">
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg shrink-0">
                                <button onClick={() => setActiveTab('transcript')} className={`text-sm font-medium transition-colors px-4 py-1.5 rounded-md ${activeTab === 'transcript' ? 'text-white shadow bg-white/10' : 'text-gray-500 hover:text-white'}`}>Transcript</button>
                                <button onClick={() => setActiveTab('chapters')} className={`text-sm font-medium transition-colors px-4 py-1.5 rounded-md ${activeTab === 'chapters' ? 'text-white shadow bg-white/10' : 'text-gray-500 hover:text-white'}`}>Chapters</button>
                            </div>

                            {activeTab === 'transcript' && (
                                <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-gray-400 ml-auto shrink-0">
                                <span title="Copy Text" className="flex">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy onClick={handleCopy} className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />}
                                </span>
                                <div className="flex bg-black/40 rounded items-center border border-white/10 overflow-hidden">
                                    <span className="px-2 py-1 border-r border-white/10">
                                        <Download className="w-3.5 h-3.5" />
                                    </span>
                                    <button onClick={handleDownloadTxt} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10" title="Download TXT">TXT</button>
                                    <button onClick={handleDownloadDocx} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Download DOCX">DOCX</button>
                                </div>
                                <span title="Edit Speakers" className="flex">
                                    <Settings onClick={handleOpenSettings} className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                                </span>
                            </div>
                        </div>

                        {/* Transcript / Chapters Content */}
                        <div className="p-4 space-y-6 scroll-smooth">
                            {isLoading ? (
                                <p className="text-gray-500 text-center mt-10">Loading data...</p>
                            ) : activeTab === 'transcript' ? (
                                (searchQuery ? transcriptData.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()) || item.speaker.toLowerCase().includes(searchQuery.toLowerCase())) : transcriptData).length > 0 ? (
                                    (searchQuery ? transcriptData.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()) || item.speaker.toLowerCase().includes(searchQuery.toLowerCase())) : transcriptData).map((item, index) => (
                                        <div key={index} className="group flex gap-4 pr-2">
                                            <button onClick={() => handleJumpToTime(item.start)} className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline w-12 flex-shrink-0 pt-0.5 select-none text-left cursor-pointer">{formatTime(item.start)}</button>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-300 leading-relaxed group-hover:bg-white/5 p-2 rounded -mt-2 -ml-2 transition-colors cursor-text">
                                                    <span className="font-semibold text-blue-300 block mb-1">{highlightText(item.speaker, searchQuery)}</span>
                                                    {highlightText(item.text, searchQuery)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center mt-10">No transcript matches found.</p>
                                )
                            ) : (
                                chaptersData.length > 0 ? (
                                    chaptersData.map((chapter, index) => (
                                        <div key={index} className="group flex gap-4 pr-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors border border-transparent hover:border-white/5" onClick={() => handleJumpToTime(chapter.start)}>
                                            <span className="text-xs font-medium text-purple-400 hover:text-purple-300 hover:underline w-12 flex-shrink-0 pt-0.5 select-none text-left">{formatTime(chapter.start)}</span>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-200 mb-1">{chapter.headline}</h4>
                                                <p className="text-sm text-gray-400 leading-relaxed">
                                                    {chapter.summary}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center mt-10">No chapters generated.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary & Insights */}
                <div className="w-full lg:w-1/2 flex flex-col bg-[#050508] relative">
                    {/* Top Controls */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setRightView('summary')}
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${rightView === 'summary' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                                <AlignLeft className="w-4 h-4" /> Summary
                            </button>
                            <button
                                onClick={() => setRightView('intelligence')}
                                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${rightView === 'intelligence' ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                                <Activity className="w-4 h-4" /> Intelligence
                            </button>

                            {rightView === 'summary' && (
                                <div className="ml-2 flex bg-black/40 rounded items-center border border-white/10 overflow-hidden">
                                    <span className="px-2 py-1 border-r border-white/10">
                                        <Download className="w-3.5 h-3.5 text-gray-400" />
                                    </span>
                                    <button onClick={handleSummaryDownloadTxt} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10" title="Download TXT">TXT</button>
                                    <button onClick={handleSummaryDownloadDocx} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Download DOCX">DOCX</button>
                                </div>
                            )}
                        </div>

                        {rightView === 'summary' && (
                            <div className="flex items-center gap-3">
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shadow-inner">
                                    <button
                                        onClick={() => setSummaryLang('EN')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'EN' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        title="English Summary"
                                    >
                                        ENG
                                    </button>
                                    <button
                                        onClick={() => setSummaryLang('HI')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'HI' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        title="Hinglish Summary"
                                    >
                                        HING
                                    </button>
                                    <button
                                        onClick={() => setSummaryLang('SPEAKER')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${summaryLang === 'SPEAKER' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        title="Speaker-wise Summary"
                                    >
                                        BY SPEAKER
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 pb-4 custom-scrollbar relative bg-gradient-to-b from-transparent to-[#050508]/50">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Loading insights...</p>
                            </div>
                        ) : rightView === 'intelligence' ? (
                            <div className="animate-in fade-in duration-300 flex flex-col gap-6">
                                {intelligenceData ? (
                                    <>
                                        {/* Health Score */}
                                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-lg">
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-2"><HeartPulse className="text-purple-400 w-6 h-6" /> Meeting Health Score</h3>
                                                <div className="flex flex-col md:flex-row gap-6 mt-4 text-sm">
                                                    <div>
                                                        <span className="text-green-400 font-bold mb-2 flex items-center gap-1"><Check className="w-4 h-4" /> Strengths</span>
                                                        <ul className="text-gray-300 space-y-2 list-none">
                                                            {intelligenceData.health?.strengths?.map((s: string, i: number) => <li key={i} className="flex gap-2"><span>+</span>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-red-400 font-bold mb-2 flex items-center gap-1"><X className="w-4 h-4" /> Weaknesses</span>
                                                        <ul className="text-gray-300 space-y-2 list-none">
                                                            {intelligenceData.health?.weaknesses?.map((w: string, i: number) => <li key={i} className="flex gap-2"><span>-</span>{w}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 w-28 h-28 ml-6 rounded-full border-4 border-purple-500/30 items-center justify-center relative shadow-[0_0_40px_rgba(168,85,247,0.3)] bg-black/60">
                                                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">{intelligenceData.health?.score}</span>
                                                <span className="text-gray-500 absolute bottom-4 text-xs font-bold">/ 10</span>
                                            </div>
                                        </div>

                                        {/* Missed Signals */}
                                        <div className="bg-orange-950/20 border border-orange-500/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-orange-400 mb-4 relative z-10"><ShieldAlert className="w-5 h-5" /> Missed Signals</h3>
                                            <ul className="space-y-3 relative z-10">
                                                {intelligenceData.missed_signals?.map((signal: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm text-gray-200 bg-black/40 p-3.5 rounded-xl border border-white/5">
                                                        <span className="text-orange-500 shrink-0 text-base">⚠️</span> {signal}
                                                    </li>
                                                ))}
                                                {(!intelligenceData.missed_signals || intelligenceData.missed_signals.length === 0) && (
                                                    <p className="text-gray-500 text-sm">No missed signals detected.</p>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Smart Action Items */}
                                        <div className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400 mb-4 relative z-10"><Target className="w-5 h-5" /> Smart Action Items</h3>
                                            <div className="space-y-3 relative z-10">
                                                {intelligenceData.action_items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex flex-col gap-2.5 text-sm bg-black/40 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="font-semibold text-gray-100 text-base">{item.task}</div>
                                                            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md shrink-0 border tracking-wider ${item.risk_level?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                                item.risk_level?.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                                                                    'bg-green-500/10 text-green-400 border-green-500/30'
                                                                }`}>{item.risk_level} RISK</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs mt-1">
                                                            <span className="text-gray-300 flex items-center gap-1.5"><strong className="text-gray-500 bg-black/50 px-1.5 py-0.5 rounded">Owner</strong> {item.owner || "Unassigned"}</span>
                                                            <span className="text-gray-300 flex items-center gap-1.5"><strong className="text-gray-500 bg-black/50 px-1.5 py-0.5 rounded">Deadline</strong> {item.deadline || "None"}</span>
                                                        </div>
                                                        {item.risk_reason && (
                                                            <div className="text-xs text-gray-400 mt-2 bg-black/20 p-2 rounded border border-white/5">
                                                                <strong className="text-gray-500">Risk Context:</strong> {item.risk_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {(!intelligenceData.action_items || intelligenceData.action_items.length === 0) && (
                                                    <p className="text-gray-500 text-sm">No action items detected.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Speaker Analytics */}
                                        {intelligenceData.speaker_metrics?.speakers && intelligenceData.speaker_metrics.speakers.length > 0 && (
                                            <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                                                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400 mb-4 relative z-10"><BarChart2 className="w-5 h-5" /> Speaker Analytics</h3>

                                                <div className="space-y-4 relative z-10">
                                                    {intelligenceData.speaker_metrics.speakers.map((spk: any, i: number) => (
                                                        <div key={i} className="flex flex-col gap-1 text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-semibold text-gray-100">{spk.name}</span>
                                                                <span className="text-emerald-400 font-bold">{spk.percentage}%</span>
                                                            </div>
                                                            {/* Progress Bar */}
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${spk.percentage}%` }}></div>
                                                            </div>

                                                            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                                                <span className="flex items-center gap-1.5"><strong className="text-gray-500 bg-black/50 px-1.5 py-0.5 rounded">Total Time</strong> {formatTime(spk.total_time)}</span>
                                                                <span className="flex items-center gap-1.5"><strong className="text-gray-500 bg-black/50 px-1.5 py-0.5 rounded">Longest Monologue</strong> {formatTime(spk.longest_monologue)}</span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-white/5">
                                                        <span className="text-gray-400">Detected Interruptions & Overlaps:</span>
                                                        <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">{intelligenceData.speaker_metrics.interruptions}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                        <Activity className="w-12 h-12 text-gray-600 mb-2" />
                                        <h3 className="text-xl font-bold text-gray-200">No Intelligence Available</h3>
                                        <p className="text-gray-400 max-w-sm">This video was processed before we added the new Advanced Intelligence engine.</p>
                                        <p className="text-sm text-gray-500 mt-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">Please re-upload a video to generate the meeting health score, missed signals, and smart tasks.</p>
                                    </div>
                                )}
                            </div>
                        ) : summaryLang === 'EN' ? (
                            <div className="animate-in fade-in duration-300 h-full flex flex-col">
                                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight flex-shrink-0">Summary of Video Content</h2>
                                <div className="text-[14px] text-gray-300 leading-relaxed bg-white/5 p-6 rounded-xl border border-white/5 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                                    {summaryData || "No summary available."}
                                </div>
                            </div>
                        ) : summaryLang === 'HI' ? (
                            <div className="animate-in fade-in duration-300 h-full flex flex-col">
                                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight border-l-4 border-green-500 pl-3 flex-shrink-0">Video Content ka Summary</h2>
                                <div className="text-[14px] text-gray-300 leading-relaxed bg-green-900/10 p-6 rounded-xl border border-green-500/20 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                                    {summaryDataHi || "Hinglish summary is loading or not available. Re-process video to generate."}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                    <h2 className="text-2xl font-bold text-white tracking-tight border-l-4 border-orange-500 pl-3">Speaker-wise Summary</h2>

                                    {/* Secondary E / H Toggle */}
                                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shadow-inner">
                                        <button
                                            onClick={() => setSpeakerLang('E')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${speakerLang === 'E' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            title="English"
                                        >
                                            E
                                        </button>
                                        <button
                                            onClick={() => setSpeakerLang('H')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${speakerLang === 'H' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            title="Hinglish"
                                        >
                                            H
                                        </button>
                                    </div>
                                </div>
                                <div className="text-[14px] text-gray-300 leading-relaxed bg-orange-900/10 p-6 rounded-xl border border-orange-500/20 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar flex-1">
                                    {speakerLang === 'E' ? (summaryDataSpeakers || "Speaker-wise english summary is loading or not available. Re-process video to generate.") : (summaryDataSpeakersHi || "Speaker-wise hinglish summary is loading or not available. Re-process video to generate.")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111116] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" /> Edit Speaker Names
                            </h3>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar">
                            <p className="text-sm text-gray-400 mb-2">Update the automatically detected speaker names. This will dynamically update your transcript and all AI summaries.</p>
                            {Object.entries(nameMap).map(([oldName, newName], idx) => (
                                <div key={idx} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">{oldName}</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNameMap(prev => ({ ...prev, [oldName]: e.target.value }))}
                                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="Enter person's name..."
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveSettings} className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
