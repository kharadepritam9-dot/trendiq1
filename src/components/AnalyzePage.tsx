import React from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Users, 
  Film, 
  Eye, 
  Activity, 
  CheckCircle, 
  Layers,
  Info
} from 'lucide-react';
import { InstagramAccount } from '../types';

interface AnalyzePageProps {
  account: InstagramAccount;
  onBack: () => void;
  onStartAnalysis: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ 
  account, 
  onBack, 
  onStartAnalysis 
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Main card */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Banner with Clear "Demo Account — Sample Data" notice */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-neutral-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Demo Account — Sample Data
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Info className="w-4 h-4 text-neutral-400" />
            <span>Prototype Mode • Sample Instagram Data • Google Trends Snapshot</span>
          </div>
        </div>

        {/* Profile Details Header */}
        <div className="p-6 sm:p-8 border-b border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative">
                <img 
                  src={account.avatar} 
                  alt={account.username}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-pink-500 to-purple-600 p-1.5 rounded-full shadow-md">
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {account.username}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    Active Creator
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-300 mt-1">
                  {account.fullName} • <span className="text-indigo-400">{account.category}</span>
                </p>
                <p className="text-sm text-neutral-400 mt-1.5 max-w-xl leading-normal">
                  {account.bio}
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={onStartAnalysis}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start Analysis</span>
              </button>
            </div>
          </div>

          {/* 3 Core Stats Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7 pt-7 border-t border-neutral-800/80">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Followers</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {account.followers.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5">
                +840 this month
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Posts</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {account.postsCount}
              </div>
              <div className="text-xs text-neutral-400 font-medium mt-0.5">
                84 Reels • 42 Carousels
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Average Reel Views</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {(account.avgReelViews / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-neutral-400 font-medium mt-0.5">
                Peak: {(account.topReelViews / 1000).toFixed(1)}K views
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <Activity className="w-4 h-4 text-violet-400" />
                <span>Engagement Rate</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {account.avgEngagementRate}%
              </div>
              <div className="text-xs text-indigo-400 font-medium mt-0.5">
                Above benchmark
              </div>
            </div>
          </div>
        </div>

        {/* Content Performance Sample Breakdown */}
        <div className="p-6 sm:p-8 bg-neutral-950/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Sample Content Performance (Last 30 Days)
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              4 Selected Reels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {account.recentPosts.map((post) => (
              <div 
                key={post.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                      {post.format}
                    </span>
                    <span className="text-neutral-400">{post.date}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-200 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Views</span>
                    <span className="font-bold text-white">{(post.views / 1000).toFixed(1)}K</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Saves</span>
                    <span className="font-bold text-emerald-400">{post.saves.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick confirmation note */}
          <div className="mt-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-sm text-neutral-300">
                Ready to cross-reference with <strong className="text-white">Google Trends Snapshot</strong> across Nutrition, Mobility, Cardio, and Supplements.
              </p>
            </div>
            <button
              onClick={onStartAnalysis}
              className="shrink-0 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Analyze Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
