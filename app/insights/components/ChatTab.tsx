import React, { RefObject } from 'react';
import { Bot, User, Send } from 'lucide-react';

interface ChatTabProps {
    chatMessages: { role: 'user' | 'bot', text: string }[];
    chatScrollRef: RefObject<HTMLDivElement | null>;
    isChatProcessing: boolean;
    chatInput: string;
    setChatInput: (val: string) => void;
    handleSendMessage: () => void;
}

export function ChatTab({
    chatMessages,
    chatScrollRef,
    isChatProcessing,
    chatInput,
    setChatInput,
    handleSendMessage
}: ChatTabProps) {
    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] rounded-2xl border border-white/10 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Chat Header */}
            <div className="bg-emerald-500/10 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-tight">MeetMiner AI Assistant</h3>
                    <p className="text-xs text-emerald-400/80 font-medium tracking-wide">Ready to answer questions about this meeting</p>
                </div>
            </div>

            {/* Messages Container */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-[#0a0a0f] to-black/80">
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1a1a24] text-gray-200 border border-white/5 rounded-tl-none font-sans whitespace-pre-wrap'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isChatProcessing && (
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-[#1a1a24] text-gray-400 border border-white/5 rounded-tl-none flex gap-2">
                            <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input Box */}
            <div className="p-4 bg-black/40 border-t border-white/10">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage()
                        }}
                        disabled={isChatProcessing}
                        placeholder="Ask something like 'What were the action items for Emma?'"
                        className="w-full bg-[#111116] border border-white/10 focus:border-emerald-500/50 rounded-xl px-5 py-3.5 pr-14 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isChatProcessing || !chatInput.trim()}
                        className="absolute right-2 p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-3 font-medium tracking-wide">AI can make mistakes. Verify important information with the raw transcript.</p>
            </div>
        </div>
    );
}
