import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

interface Note {
    id: string;
    text: string;
    timecode: number;
}

interface NotesTabProps {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    formatTime: (ms?: number) => string;
    handleJumpToTime: (ms?: number) => void;
}

export function NotesTab({ notes, setNotes, videoRef, formatTime, handleJumpToTime }: NotesTabProps) {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        // Get current video time in ms
        const currentTimecode = videoRef.current ? videoRef.current.currentTime * 1000 : 0;

        const note: Note = {
            id: Date.now().toString(),
            text: newNote,
            timecode: currentTimecode
        };

        setNotes([...notes, note].sort((a, b) => a.timecode - b.timecode));
        setNewNote('');
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 pb-20">
            <div className="mb-6 flex gap-2">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a note... it will be timestamped automatically."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 resize-none min-h-[60px]"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddNote();
                        }
                    }}
                />
                <button
                    onClick={handleAddNote}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors flex items-center justify-center self-start shadow-lg hover:shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note.id} className="group relative bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <button
                                    onClick={() => handleJumpToTime(note.timecode)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors shrink-0"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(note.timecode)}
                                </button>

                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all absolute right-4 top-4 bg-black/50 p-1 rounded-md"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{note.text}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 mt-10 p-6 bg-black/20 rounded-xl border border-white/5 border-dashed">
                        <p>No notes yet.</p>
                        <p className="text-xs mt-2">Add a note above to quickly timestamp and save your thoughts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
