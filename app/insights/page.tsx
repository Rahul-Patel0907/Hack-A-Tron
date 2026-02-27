"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Copy, Download, ChevronDown, MessageSquare, ListTree, AlignLeft, Settings, Sparkles, Check, X, ShieldAlert, Target, HeartPulse, Activity, BarChart2, Search, Send, Bot, User, Mail, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import PastSummaries from '../Components/PastSummaries';
import { ShareTab } from './components/ShareTab';
import { TicketsTab } from './components/TicketsTab';
import { IntelligenceTab } from './components/IntelligenceTab';
import { ChatTab } from './components/ChatTab';
import { SummaryTab } from './components/SummaryTab';
import { NotesTab } from './components/NotesTab';

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
    const [activeTab, setActiveTab] = useState<'transcript' | 'chapters' | 'notes'>('transcript');
    const [notesData, setNotesData] = useState<{ id: string, text: string, timecode: number }[]>([]);
    const [rightView, setRightView] = useState<'summary' | 'intelligence' | 'chat' | 'share' | 'tickets'>('summary');
    const [intelligenceData, setIntelligenceData] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [nameMap, setNameMap] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
    const [isTranscriptDownloadDropdownOpen, setIsTranscriptDownloadDropdownOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Chat states
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: "Hello! I'm your AI Meeting Assistant. Ask me anything about what was discussed in this meeting." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatProcessing, setIsChatProcessing] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userText = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsChatProcessing(true);

        const contextText = `Summary:\n${summaryData}\n\nTranscript:\n${transcriptData.map(t => `${t.speaker}: ${t.text}`).join('\n')}`;

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userText, context: contextText }),
            });
            const data = await response.json();
            if (data.answer) {
                setChatMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Make sure the backend is running." }]);
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI backend." }]);
        }
        setIsChatProcessing(false);
    };

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
        setIsTranscriptDownloadDropdownOpen(false);
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
        setIsTranscriptDownloadDropdownOpen(false);
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(16);
        let titleStr = '';
        let filename = '';

        if (activeTab === 'transcript') {
            if (!transcriptData.length) return;
            titleStr = "Transcript";
            filename = videoName.replace(/\.[^/.]+$/, "") + "_transcript.pdf";
        } else {
            if (!chaptersData.length) return;
            titleStr = "Chapters";
            filename = videoName.replace(/\.[^/.]+$/, "") + "_chapters.pdf";
        }

        doc.text(titleStr, 15, yPos);
        yPos += 15;

        doc.setFontSize(11);

        const addTextWithWrap = (text: string, x: number, lineSpacing: number = 7) => {
            const lines = doc.splitTextToSize(text, 180);
            lines.forEach((line: string) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, x, yPos);
                yPos += lineSpacing;
            });
        };

        if (activeTab === 'transcript') {
            transcriptData.forEach(t => {
                const prefix = `${t.speaker} [${formatTime(t.start)}]: `;
                addTextWithWrap(`${prefix}${t.text}`, 15);
                yPos += 3; // add a little extra spacing between speakers
            });
        } else {
            chaptersData.forEach(c => {
                doc.setFontSize(12);
                addTextWithWrap(`${c.headline} [${formatTime(c.start)}]`, 15);

                doc.setFontSize(11);
                addTextWithWrap(c.summary, 15);
                yPos += 5;
            });
        }

        doc.save(filename);
        setIsTranscriptDownloadDropdownOpen(false);
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
        setIsDownloadDropdownOpen(false);
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
        setIsDownloadDropdownOpen(false);
    };

    const handleSummaryDownloadPdf = () => {
        const content = getSummaryContent();
        if (!content) return;

        const doc = new jsPDF();
        const lines = doc.splitTextToSize(content, 180); // wrap text for A4 page width
        let yPos = 20;

        doc.setFontSize(16);
        doc.text("Meeting Summary", 15, yPos);
        yPos += 15;

        doc.setFontSize(11);
        lines.forEach((line: string) => {
            if (yPos > 280) { // new page if text goes off margin
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 15, yPos);
            yPos += 7;
        });

        doc.save(videoName.replace(/\.[^/.]+$/, "") + "_summary.pdf");
        setIsDownloadDropdownOpen(false);
    };

    const handleShareToOutlook = () => {
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(22);
        doc.text("Meeting Intelligence Report", 15, yPos);
        yPos += 12;

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`File: ${videoName.replace(/\.[^/.]+$/, "")}`, 15, yPos);
        yPos += 15;
        doc.setTextColor(0);

        const addTextWithWrap = (text: string, x: number, lineSpacing: number = 7) => {
            const lines = doc.splitTextToSize(text, 180);
            lines.forEach((line: string) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, x, yPos);
                yPos += lineSpacing;
            });
        };

        // 1. Summary
        if (summaryData) {
            doc.setFontSize(16);
            doc.text("1. Overall Summary", 15, yPos);
            yPos += 10;
            doc.setFontSize(11);
            addTextWithWrap(summaryData, 15);
            yPos += 10;
        }

        // 2. Speaker Summary
        if (summaryDataSpeakers) {
            doc.setFontSize(16);
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.text("2. Summary by Speaker", 15, yPos);
            yPos += 10;
            doc.setFontSize(11);
            addTextWithWrap(summaryDataSpeakers, 15);
            yPos += 10;
        }

        // 3. Action Items (if any)
        if (intelligenceData?.action_items && intelligenceData.action_items.length > 0) {
            doc.setFontSize(16);
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.text("3. Action Items", 15, yPos);
            yPos += 10;
            doc.setFontSize(11);
            intelligenceData.action_items.forEach((item: any) => {
                addTextWithWrap(`• Task: ${item.task} (Owner: ${item.owner || 'Unassigned'}) [${item.risk_level || 'Medium'} Risk]`, 15);
                yPos += 2;
            });
            yPos += 10;
        }

        // 4. Transcript
        if (transcriptData && transcriptData.length > 0) {
            doc.setFontSize(16);
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.text("4. Full Transcript", 15, yPos);
            yPos += 10;
            doc.setFontSize(10);
            transcriptData.forEach(t => {
                const prefix = `${t.speaker} [${formatTime(t.start)}]: `;
                addTextWithWrap(`${prefix}${t.text}`, 15, 6);
                yPos += 3;
            });
        }

        const filename = videoName.replace(/\.[^/.]+$/, "") + "_Full_Report.pdf";
        doc.save(filename);

        const subject = encodeURIComponent(`Meeting Report: ${videoName.replace(/\.[^/.]+$/, "")}`);
        const body = encodeURIComponent(`Hi Team,\n\nPlease find attached the complete meeting intelligence report containing the transcripts, summaries, and action items for "${videoName.replace(/\.[^/.]+$/, "")}".\n\nEnsure to attach the automatically downloaded PDF ("${filename}") before sending.\n\nBest Regards,\nAI Meeting Assistant`);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
            speaker: nameMap[t.speaker] && nameMap[t.speaker].trim() !== '' ? nameMap[t.speaker] : t.speaker,
            text: replaceNamesInText(t.text, nameMap)
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

        const storedNotes = localStorage.getItem('meetingNotes');
        if (storedNotes) {
            try {
                setNotesData(JSON.parse(storedNotes));
            } catch (error) {
                console.error("Error parsing stored notes", error);
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('meetingNotes', JSON.stringify(notesData));
        }
    }, [notesData, isLoading]);

    return (
        <div className="h-screen overflow-hidden bg-[#0a0a0f] text-gray-200 antialiased selection:bg-blue-500/30 font-sans flex flex-col">
            {/* Top Navigation */}
            <nav className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between z-50 sticky top-0 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-4 flex-1">
                    <Link href="/upload" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2 max-w-xl truncate">
                        {videoName.replace(/\.mp4$/i, '')}
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 flex-shrink-0">.mp4</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <PastSummaries />
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
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg shrink-0 overflow-x-auto no-scrollbar">
                                <button onClick={() => setActiveTab('transcript')} className={`text-sm font-medium transition-colors px-4 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'transcript' ? 'text-white shadow bg-white/10' : 'text-gray-500 hover:text-white'}`}>Transcript</button>
                                <button onClick={() => setActiveTab('chapters')} className={`text-sm font-medium transition-colors px-4 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'chapters' ? 'text-white shadow bg-white/10' : 'text-gray-500 hover:text-white'}`}>Chapters</button>
                                <button onClick={() => setActiveTab('notes')} className={`text-sm font-medium transition-colors px-4 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'notes' ? 'text-white shadow bg-white/10' : 'text-gray-500 hover:text-white'}`}>Notes</button>
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
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTranscriptDownloadDropdownOpen(!isTranscriptDownloadDropdownOpen)}
                                        className="flex bg-black/40 rounded items-center border border-white/10 overflow-hidden hover:bg-white/10 transition-colors px-3 py-1.5 text-gray-400 group"
                                    >
                                        <Download className="w-4 h-4 group-hover:text-white transition-colors" />
                                    </button>

                                    {isTranscriptDownloadDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-32 bg-[#1a1a24] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={handleDownloadTxt}
                                                    className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                                                >
                                                    Download TXT
                                                </button>
                                                <button
                                                    onClick={handleDownloadDocx}
                                                    className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                                                >
                                                    Download DOCX
                                                </button>
                                                <button
                                                    onClick={handleDownloadPdf}
                                                    className="text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                                >
                                                    Download PDF
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                            ) : activeTab === 'notes' ? (
                                <NotesTab
                                    notes={notesData}
                                    setNotes={setNotesData}
                                    videoRef={videoRef}
                                    formatTime={formatTime}
                                    handleJumpToTime={handleJumpToTime}
                                />
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
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
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
                        <button
                            onClick={() => setRightView('chat')}
                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${rightView === 'chat' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                            <MessageSquare className="w-4 h-4" /> Chatbot
                        </button>
                        <button
                            onClick={() => setRightView('share')}
                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${rightView === 'share' ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                            <Mail className="w-4 h-4" /> Share
                        </button>
                        <button
                            onClick={() => setRightView('tickets')}
                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${rightView === 'tickets' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'}`}>
                            <ListTodo className="w-4 h-4" /> Tickets
                        </button>
                    </div>

                    {/* Summary Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 pb-4 custom-scrollbar relative bg-gradient-to-b from-transparent to-[#050508]/50">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Loading insights...</p>
                            </div>
                        ) : rightView === 'share' ? (
                            <ShareTab handleShareToOutlook={handleShareToOutlook} />
                        ) : rightView === 'tickets' ? (
                            <TicketsTab intelligenceData={intelligenceData} />
                        ) : rightView === 'intelligence' ? (
                            <IntelligenceTab intelligenceData={intelligenceData} formatTime={formatTime} />
                        ) : rightView === 'chat' ? (
                            <ChatTab
                                chatMessages={chatMessages}
                                chatScrollRef={chatScrollRef}
                                isChatProcessing={isChatProcessing}
                                chatInput={chatInput}
                                setChatInput={setChatInput}
                                handleSendMessage={handleSendMessage}
                            />
                        ) : (
                            <SummaryTab
                                summaryLang={summaryLang}
                                speakerLang={speakerLang}
                                summaryData={summaryData}
                                summaryDataHi={summaryDataHi}
                                summaryDataSpeakers={summaryDataSpeakers}
                                summaryDataSpeakersHi={summaryDataSpeakersHi}
                                setSummaryLang={setSummaryLang}
                                setSpeakerLang={setSpeakerLang}
                                isDownloadDropdownOpen={isDownloadDropdownOpen}
                                setIsDownloadDropdownOpen={setIsDownloadDropdownOpen}
                                handleSummaryDownloadTxt={handleSummaryDownloadTxt}
                                handleSummaryDownloadDocx={handleSummaryDownloadDocx}
                                handleSummaryDownloadPdf={handleSummaryDownloadPdf}
                            />
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
            )
            }

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
