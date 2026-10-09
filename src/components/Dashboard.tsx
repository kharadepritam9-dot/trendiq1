import React from 'react';
import { 
  Users, 
  Eye, 
  Film, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  Zap, 
  Target, 
  BarChart3, 
  Award 
} from 'lucide-react';
import { InstagramAccount } from '../types';

interface DashboardProps {
  account: InstagramAccount;
  onViewTrends: () => void;
  onViewOpportunities: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  account, 
  onViewTrends, 
  onViewOpportunities 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Banner: Status & Quick Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Intelligence Dashboard: @{account.username}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Fresh Analysis
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-0.5">
              126 posts analyzed • Google Trends Snapshot • 4 scored opportunities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewTrends}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Google Trends</span>
          </button>
          <button
            onClick={onViewOpportunities}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>View Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Dominant Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Followers */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Followers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              18,420
            </div>
            <div className="mt-1.5 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+840 organic this month</span>
            </div>
          </div>
        </div>

        {/* 2. Average Reel Views */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Avg Reel Views</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              14.2K
            </div>
            <div className="mt-1.5 text-xs text-neutral-400 font-medium">
              Peak: 89.4K • 21.4s avg watch time
            </div>
          </div>
        </div>

        {/* 3. Best Content Format */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Best Format</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Film className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Talking Head Reels
            </div>
            <div className="mt-1.5 text-xs text-indigo-400 font-medium">
              3.4× higher shares vs montages
            </div>
          </div>
        </div>

        {/* 4. Top Performing Topic */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Top Topic</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              High-Protein Desk Meals
            </div>
            <div className="mt-1.5 text-xs text-emerald-400 font-medium">
              24.6K views/post median
            </div>
          </div>
        </div>
      </div>

      {/* Main Dominant Insight */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-neutral-900 to-neutral-950 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Key Content Insight
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              “Talking-head reels with text hooks generate 3.4× more shares.”
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed pt-1">
              Text-hook overlays within the first 1.8 seconds boost watch time to 74% compared to standard workout b-roll.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={onViewOpportunities}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>View Ranked Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Supporting Analytics: Pillar Comparison & Next Recommended Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Pillars */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Pillar Performance (126 Posts)
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              RANKED BY VIEWS
            </span>
          </div>

          <div className="space-y-3.5">
            {account.pillars.map((pillar, idx) => {
              const maxViews = 25000;
              const percent = Math.min(100, Math.round((pillar.avgViews / maxViews) * 100));

              return (
                <div key={pillar.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-200">
                      {idx + 1}. {pillar.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                        {pillar.engagement}% eng
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {(pillar.avgViews / 1000).toFixed(1)}K views
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' 
                          : idx === 1 
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500' 
                          : 'bg-neutral-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Recommended Action */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">Next Recommended Action</span>
              <span className="text-xs text-neutral-400 font-mono">HIGH PRIORITY</span>
            </div>
            <h4 className="text-lg font-bold text-white leading-snug">
              2-Ingredient Flatbread Recipe
            </h4>
            <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
              Pair Ananya's high-protein recipe audience with the <strong className="text-white">+340% Breakout</strong> Google Trends signal.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                Peak Window:
              </span>
              <span className="text-neutral-200 font-semibold">{account.demographics.peakActiveTime}</span>
            </div>

            <button
              onClick={onViewOpportunities}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Open Opportunity #1 (Score: 95)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
