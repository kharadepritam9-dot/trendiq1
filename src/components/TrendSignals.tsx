import React, { useState } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Sparkles, 
  Search, 
  ArrowRight
} from 'lucide-react';
import { TrendSignal, Opportunity } from '../types';

interface TrendSignalsProps {
  trends: TrendSignal[];
  opportunities: Opportunity[];
  onSelectOpportunityByTrend: (trendId: string) => void;
  onOpenCustomIdeaModal: () => void;
}

export const TrendSignals: React.FC<TrendSignalsProps> = ({
  trends,
  opportunities,
  onSelectOpportunityByTrend,
  onOpenCustomIdeaModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(trends.map((t) => t.category)))];

  const filteredTrends = trends.filter((trend) => {
    const matchesCategory = selectedCategory === 'All' || trend.category === selectedCategory;
    const matchesSearch = trend.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trend.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trend.top_queries.some(q => q.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Header with Source Attribution */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Google Trends Snapshot
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Snapshot
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-normal">
            Search volume and breakout curves reflecting consumer search interest before it saturates Instagram feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCustomIdeaModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Test Custom Trend Topic</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trend topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrends.map((trend) => {
          const matchedOpportunity = opportunities.find((o) => o.trendId === trend.id);
          const isBreakout = trend.growth_type === 'breakout';

          return (
            <div
              key={trend.id}
              className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700">
                    {trend.category}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isBreakout
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {trend.growth_status}
                  </span>
                </div>

                {/* Topic Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {trend.topic}
                </h3>

                {/* Trend Score */}
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-400 font-medium">Trend Score</span>
                    <span className="font-extrabold text-amber-400 font-mono text-sm">
                      {trend.trend_score}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${trend.trend_score}%` }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-neutral-400" />
                      Region:
                    </span>
                    <span className="text-neutral-200 font-medium">{trend.region}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      Source:
                    </span>
                    <span className="text-neutral-200 font-semibold">{trend.source}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      Snapshot Date:
                    </span>
                    <span className="text-neutral-200 font-mono">{trend.snapshot_date}</span>
                  </div>
                </div>

                {/* Top queries snippet */}
                <div className="mt-4 pt-3 border-t border-neutral-800/70">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                    Related Search Queries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trend.top_queries.slice(0, 2).map((query, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        "{query}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-4 border-t border-neutral-800">
                {matchedOpportunity ? (
                  <button
                    onClick={() => onSelectOpportunityByTrend(trend.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Opportunity (Score: {matchedOpportunity.opportunityScore})</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/60 text-center">
                    <span className="text-xs text-neutral-400">
                      Secondary trend signal
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
