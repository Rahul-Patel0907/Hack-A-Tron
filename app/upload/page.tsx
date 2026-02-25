"use client";

import React, { useState } from 'react';
import { ScanFace, UploadCloud, FileVideo, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const startUpload = async (file: File) => {
        setUploadedFile(file);
        setUploading(true);
        setProgress(0);

        // Simulate progress while waiting for backend
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + 5;
                return next >= 90 ? 90 : next;
            });
        }, 500);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/process-video', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Backend processing failed');
            }

            const data = await response.json();

            // Save the data to be used by the /insights page
            localStorage.setItem('meetingInsights', JSON.stringify(data));
            localStorage.setItem('videoName', file.name);
            localStorage.setItem('videoObjectUrl', URL.createObjectURL(file));

            clearInterval(interval);
            setProgress(100);
            setTimeout(() => setUploading(false), 500); // Give it a moment to show 100%
        } catch (error) {
            console.error('Error during processing:', error);
            alert('An error occurred. Make sure your local Python API is running.');
            clearInterval(interval);
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'video/mp4' || file.name.endsWith('.mp4')) {
                startUpload(file);
            } else {
                alert("Please upload an MP4 video file.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            startUpload(e.target.files[0]);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden antialiased selection:bg-blue-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ScanFace className="w-6 h-6 text-blue-400" />
                        <span className="text-xl font-bold tracking-tight text-white">Meet<span className="text-blue-400">Miner</span></span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Upload your Meeting
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Drop your MP4 recording here. We'll generate a transcript and summary in English and Hinglish instantly.
                    </p>
                </div>

                <div
                    className={`glass border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-white/10 hover:border-blue-500/50 bg-black/20'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploading || progress === 100 ? (
                        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
                            {progress === 100 ? (
                                <CheckCircle className="w-16 h-16 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                            ) : (
                                <div className="w-48 h-48 mb-2 flex items-center justify-center -mt-6">
                                    <DotLottieReact
                                        src="/animation.lottie"
                                        loop
                                        autoplay
                                    />
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-white mb-2">
                                {progress === 100 ? 'Upload Complete' : 'Uploading...'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto truncate w-full">
                                {uploadedFile?.name || 'meeting_recording.mp4'}
                            </p>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full" style={{ animation: "scan 2s linear infinite" }}></div>
                                </div>
                            </div>

                            <div className="text-sm font-bold text-blue-400 mb-8">
                                {progress}%
                            </div>

                            {progress === 100 && (
                                <Link
                                    href="/insights"
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Extract Insights
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="w-24 h-24 rounded-full bg-white/5 mb-8 flex items-center justify-center shadow-2xl border border-white/10 relative group cursor-pointer overflow-hidden transition-all hover:bg-white/10">
                                <UploadCloud className="w-10 h-10 text-blue-400 relative z-10 group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Drag & Drop your video</h3>
                            <p className="text-gray-400 mb-10 text-lg">MP4 formats only, up to 500MB</p>

                            <label className="cursor-pointer group">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/mp4"
                                    onChange={handleFileChange}
                                />
                                <div className="px-8 py-4 rounded-full bg-white/10 text-white font-medium group-hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 shadow-xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <FileVideo className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                                    Browse Files
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
