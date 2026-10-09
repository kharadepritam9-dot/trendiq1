import React from 'react';
import { Sparkles, TrendingUp, BarChart3, Lightbulb, Compass, ArrowRight } from 'lucide-react';
import { ScreenState } from '../types';

interface NavbarProps {
  currentScreen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  hasAnalyzed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, setScreen, hasAnalyzed }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setScreen('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Trend<span className="text-indigo-400">IQ</span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Prototype
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">Instagram Content Intelligence</p>
          </div>
        </div>

        {/* Navigation / Screen Switcher if analyzed */}
        {hasAnalyzed ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setScreen('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'dashboard'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Intelligence</span> Dashboard
            </button>

            <button
              onClick={() => setScreen('trends')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'trends'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Google</span> Trends
            </button>

            <button
              onClick={() => setScreen('opportunities')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentScreen === 'opportunities' || currentScreen === 'opportunity_detail'
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>Opportunities</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.2 rounded-full font-bold">
                4
              </span>
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Google Trends Snapshot
            </span>
            <span className="text-neutral-600">•</span>
            <span>Sample Instagram Data</span>
          </div>
        )}

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {hasAnalyzed ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-neutral-200">@fitnesswithananya</span>
              <span className="text-xs text-neutral-400 hidden sm:inline">(Demo)</span>
            </div>
          ) : (
            <button
              onClick={() => setScreen('analyze')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Analyze My Content</span>
              <ArrowRight className="w-3 h-3 text-white/70" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
