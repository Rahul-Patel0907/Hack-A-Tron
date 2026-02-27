import React from 'react';
import { ListTodo, Copy, User } from 'lucide-react';

interface TicketsTabProps {
    intelligenceData: any;
}

export function TicketsTab({ intelligenceData }: TicketsTabProps) {
    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col pt-2">
            <div className="flex flex-col mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <ListTodo className="w-6 h-6 text-indigo-400" /> Sprint & Jira Tickets
                </h2>
                <p className="text-gray-400 text-sm">One-click copy paste formatted action items for your sprint board.</p>
            </div>
            <div className="space-y-4">
                {intelligenceData?.action_items && intelligenceData.action_items.length > 0 ? (
                    intelligenceData.action_items.map((item: any, i: number) => {
                        const ticketText = `Task: ${item.task || 'N/A'}
Assignee: ${item.owner || 'Unassigned'}
Deadline: ${item.deadline || 'None'}
Context: ${item.risk_reason || 'N/A'}`;

                        return (
                            <div key={i} className="flex flex-col bg-indigo-950/10 border border-indigo-500/20 p-5 rounded-2xl shadow-lg group hover:border-indigo-500/40 transition-colors">
                                <div className="flex justify-between items-start mb-3 gap-4">
                                    <h3 className="font-bold text-gray-200 text-lg">{item.task}</h3>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(ticketText);
                                            const el = document.getElementById(`copy-tick-${i}`);
                                            if (el) {
                                                el.innerText = "Copied!";
                                                setTimeout(() => { el.innerText = "Copy Issue"; }, 2000);
                                            }
                                        }}
                                        className="flex shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg text-xs font-bold transition-all"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span id={`copy-tick-${i}`}>Copy Issue</span>
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-black/40 px-2 py-1 rounded border border-white/5">
                                        <User className="w-3 h-3 text-gray-500" /> {item.owner || "Unassigned"}
                                    </span>
                                </div>

                                <pre className="text-xs text-gray-400 bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap font-sans mt-auto">
                                    {ticketText}
                                </pre>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-black/20 border border-white/5 p-8 rounded-2xl text-center text-gray-500">
                        No actionable items were detected in this meeting to convert into tickets.
                    </div>
                )}
            </div>
        </div>
    );
}
