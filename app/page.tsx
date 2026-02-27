import React from 'react';
import { ScanFace } from 'lucide-react';
import HeroSection from './Components/HeroSection';
import PastSummaries from './Components/PastSummaries';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden antialiased selection:bg-purple-500/30">

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold tracking-tight text-white">Meet<span className="text-blue-400">Miner</span></span>
          </div>
          <div className="flex items-center gap-4">
            <PastSummaries />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

    </div>
  );
}