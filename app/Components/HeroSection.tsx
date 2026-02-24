import { Play, UploadCloud, Users, Sparkles, ShieldCheck, FileText, Video as VideoIcon } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                {/* Left: Copy */}
                <div className="flex flex-col gap-6 z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Transcription & Summarization</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
                        Turn Meetings into<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 font-extrabold pb-2 inline-block">Insights & Summaries.</span>
                    </h1>

                    <p className="text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed">
                        Upload your video calls and let our AI instantly generate accurate transcripts and smart summaries in <span className="text-white font-semibold flex-inline">English</span> & <span className="text-white font-semibold">Hinglish</span>. Stop taking notes and start participating.
                    </p>

                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <Link href="/upload" className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] group">
                                <FileText className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                Start Transcribing
                            </Link>
                            <button className="flex items-center gap-2 px-8 py-4 rounded-full glass hover:bg-white/10 text-white font-medium text-lg transition-all border border-white/10">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 font-medium ml-2">Supports English & Hinglish · Fast processing · Export Summaries</p>
                    </div>
                </div>

                {/* Right: The "Wow" Visual (Mockup) */}
                <div className="relative z-10 perspective-[1000px] w-full max-w-2xl mx-auto lg:ml-auto">
                    <div className="relative rounded-2xl glass p-2 overflow-hidden shadow-2xl border border-white/10 bg-black/40 rotate-[1deg] hover:rotate-0 transition-transform duration-700">

                        {/* App Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                <FileText className="w-3 h-3" /> meeting_sync.mp4.transcript.json
                            </div>
                        </div>

                        {/* Two-pane layout for Video and Transcript */}
                        <div className="grid grid-cols-5 gap-2 p-1 min-h-[300px]">

                            {/* Left Pane - Video Player */}
                            <div className="col-span-2 relative rounded-lg bg-gray-900 border border-white/10 overflow-hidden flex flex-col">
                                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-[10px] text-white z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> REC
                                </div>
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" alt="Video frame" className="w-full h-full object-cover opacity-80" />

                                {/* Scanning overlay on video */}
                                <div className="absolute inset-0 pointer-events-none z-10">
                                    <div className="w-full h-[2px] bg-blue-400/60 shadow-[0_0_10px_#60a5fa]" style={{ animation: "scan 3s linear infinite" }}></div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-10">
                                    <div className="flex items-center gap-2">
                                        <Play className="w-3 h-3 text-white fill-white" />
                                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-blue-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane - Transcription */}
                            <div className="col-span-3 relative rounded-lg bg-black/60 border border-white/5 p-3 overflow-hidden flex flex-col gap-3 font-mono text-sm max-h-[300px]">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs text-gray-400 font-sans tracking-wide">LIVE TRANSCRIPT</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">Hinglish</span>
                                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">JSON</span>
                                    </div>
                                </div>

                                {/* Transcripts Lines */}
                                <div className="flex flex-col gap-4 mt-2">
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                            <span className="text-[10px] text-purple-300 font-bold">S1</span>
                                        </div>
                                        <span className="text-gray-300 text-xs leading-relaxed">
                                            Next week ke naye feature rollout ka timeline review karte hain.
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                                            <span className="text-[10px] text-blue-300 font-bold">S2</span>
                                        </div>
                                        <span className="text-gray-300 text-xs leading-relaxed">
                                            Kya UI components ready honge? QA ke liye thoda extra time chahiye hoga.
                                        </span>
                                    </div>

                                    {/* Typing effect line */}
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                            <span className="text-[10px] text-purple-300 font-bold">S1</span>
                                        </div>
                                        <span className="text-gray-100 text-xs leading-relaxed block">
                                            Haan, wo essentially complete hain. Hum bas fi<span className="w-1.5 h-3 bg-blue-400 inline-block align-middle ml-0.5 animate-pulse"></span>
                                        </span>
                                    </div>
                                </div>

                                {/* Processing indicator */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex items-end justify-end p-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 backdrop-blur-md">
                                        <Sparkles className="w-2 h-2 animate-pulse" /> Generating...
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
