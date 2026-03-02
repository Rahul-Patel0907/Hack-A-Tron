import React from 'react';
import { HeartPulse, Check, X, ShieldAlert, Target, BarChart2, Activity } from 'lucide-react';

interface IntelligenceTabProps {
    intelligenceData: any;
    formatTime: (ms?: number) => string;
}

export function IntelligenceTab({ intelligenceData, formatTime }: IntelligenceTabProps) {
    return (
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

                    {/* Overall Sentiment */}
                    {intelligenceData.sentiment && (
                        <div className={`border p-6 rounded-2xl shadow-lg relative overflow-hidden transition-colors ${intelligenceData.sentiment.overall.toLowerCase() === 'positive' ? 'bg-green-950/20 border-green-500/20' :
                                intelligenceData.sentiment.overall.toLowerCase() === 'negative' ? 'bg-red-950/20 border-red-500/20' :
                                    intelligenceData.sentiment.overall.toLowerCase() === 'tense' ? 'bg-orange-950/20 border-orange-500/20' :
                                        'bg-blue-950/20 border-blue-500/20' // Neutral fallback
                            }`}>
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-4">
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${intelligenceData.sentiment.overall.toLowerCase() === 'positive' ? 'text-green-400' :
                                        intelligenceData.sentiment.overall.toLowerCase() === 'negative' ? 'text-red-400' :
                                            intelligenceData.sentiment.overall.toLowerCase() === 'tense' ? 'text-orange-400' :
                                                'text-blue-400'
                                    }`}>
                                    {intelligenceData.sentiment.overall.toLowerCase() === 'positive' && "😊 "}
                                    {intelligenceData.sentiment.overall.toLowerCase() === 'negative' && "😠 "}
                                    {intelligenceData.sentiment.overall.toLowerCase() === 'tense' && "😬 "}
                                    {(intelligenceData.sentiment.overall.toLowerCase() !== 'positive' && intelligenceData.sentiment.overall.toLowerCase() !== 'negative' && intelligenceData.sentiment.overall.toLowerCase() !== 'tense') && "😐 "}
                                    {intelligenceData.sentiment.overall} Mood
                                </h3>
                                <div className="text-sm text-gray-300 italic max-w-md">"{intelligenceData.sentiment.reasoning}"</div>
                            </div>

                            {intelligenceData.sentiment.speaker_moods && intelligenceData.sentiment.speaker_moods.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                    {intelligenceData.sentiment.speaker_moods.map((sm: any, i: number) => (
                                        <div key={i} className="text-xs bg-black/40 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5 shadow-sm text-gray-300">
                                            <strong className="text-gray-100">{sm.name}:</strong> {sm.mood}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
    );
}
