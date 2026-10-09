import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Plus
} from 'lucide-react';
import { Opportunity } from '../types';

interface ContentOpportunitiesProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onOpenCustomIdeaModal: () => void;
}

export const ContentOpportunities: React.FC<ContentOpportunitiesProps> = ({
  opportunities,
  onSelectOpportunity,
  onOpenCustomIdeaModal,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-neutral-900 to-neutral-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ranked Content Opportunities
          </h1>
          <p className="text-sm text-neutral-300 mt-1">
            “What should I post next — and why?” Ranked 0–100 by algorithmic opportunity score.
          </p>
        </div>

        <button
          onClick={onOpenCustomIdeaModal}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>Evaluate New Topic</span>
        </button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            onClick={() => onSelectOpportunity(opp)}
            className="p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-indigo-500/60 transition-all cursor-pointer group shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Dominant Score + Title */}
              <div className="flex items-start gap-6 flex-1">
                {/* Dominant Score Box */}
                <div className="shrink-0 text-center">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-indigo-950 to-neutral-950 border border-indigo-500/40 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-300 leading-none">
                      {opp.opportunityScore}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mt-1">
                      Opportunity Score
                    </span>
                  </div>
                </div>

                {/* Title and Why This Idea Points */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {opp.badge}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      • {opp.matchedCategory}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  {/* Why this idea - Clean 5 checkmarks as requested */}
                  <div className="pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                      Why this idea?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Strong niche fit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Proven historical format</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Rising trend signal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Clear content gap</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Strong audience relevance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Primary CTA "Generate Content" */}
              <div className="shrink-0 flex items-center lg:flex-col justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOpportunity(opp);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Content</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
