import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Compass, 
  Zap, 
  ShieldCheck, 
  BarChart2, 
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-amber-500/10 blur-[130px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-10 w-[350px] h-[350px] bg-indigo-500/10 blur-[120px] -z-10 pointer-events-none rounded-full" />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 w-full">
        {/* Prototype Disclosure Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-neutral-200">Prototype Mode • Sample Instagram Data • Google Trends Snapshot</span>
          </div>
        </div>

        {/* Brand & Main Tagline */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            TrendIQ Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Instagram Data Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
              Your Next Best Content.
            </span>
          </h1>

          {/* Immediate reinforcement of core question */}
          <div className="inline-block px-4 py-2 rounded-xl bg-neutral-900/90 border border-indigo-500/30 text-indigo-200 text-base sm:text-lg font-bold tracking-tight">
            “What should I post next — and why?”
          </div>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered intelligence that analyzes creator performance data, pairs it with Google Trends snapshots, and generates production-ready Reels.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all duration-200 flex items-center justify-center gap-3 group active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Analyze My Content</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Demo Account • Instant Walkthrough</span>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars: Clean and Scannable */}
        <div className="mt-12 max-w-4xl mx-auto p-6 sm:p-7 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-neutral-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                The Core Creator Dilemma Solved
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Opportunity Score + Reason Differentiator
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-base text-neutral-100">1. Account Data</h3>
              <p className="text-sm text-neutral-400 mt-1 leading-normal">
                Analyzes 126 posts, watch-time drops, and format win rates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2.5">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-semibold text-base text-neutral-100">2. Trends Snapshot</h3>
              <p className="text-sm text-neutral-400 mt-1 leading-normal">
                Cross-references high-velocity Google Trends signals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2.5">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-base text-neutral-100">3. Opportunity Score</h3>
              <p className="text-sm text-neutral-400 mt-1 leading-normal">
                Ranks ideas 0–100 with clear 5-pillar validation.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Teaser Card: FitnessWithAnanya */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div 
            onClick={onStart}
            className="group cursor-pointer rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-indigo-500/50 transition-all shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80" 
                  alt="FitnessWithAnanya avatar"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                      FitnessWithAnanya
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Demo Account
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    18,420 followers • 126 posts • 14.2K average Reel views
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-neutral-400 block">Identified Opportunities</span>
                  <span className="text-sm font-bold text-emerald-400">4 Scored Ideas Ready</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-neutral-800 group-hover:bg-indigo-600 text-xs font-semibold text-white flex items-center gap-1.5 transition-all">
                  <span>Start Analysis</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-5 text-center text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TrendIQ Prototype</span>
          <span>Prototype Mode • Sample Instagram Data • Google Trends Snapshot</span>
        </div>
      </footer>
    </div>
  );
};
