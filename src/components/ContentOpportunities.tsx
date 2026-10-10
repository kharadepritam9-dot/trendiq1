import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Plus,
  Sliders,
  RotateCcw,
  TrendingUp,
  Target,
  Film,
  Layers,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { 
  Opportunity, 
  TrendSignal, 
  ScoringInputOverrides, 
  CompetitionLevel, 
  GrowthType 
} from '../types';
import { getDemoProfile } from '../lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../lib/analysis/creatorAnalysis';
import { generateRankedOpportunities } from '../lib/opportunities/rankedPipeline';
import fallbackTrendsData from '../../trends.json';

interface ContentOpportunitiesProps {
  opportunities: Opportunity[];
  trends?: TrendSignal[];
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onOpenCustomIdeaModal: () => void;
}

export const ContentOpportunities: React.FC<ContentOpportunitiesProps> = ({
  opportunities: initialOpportunities,
  trends: passedTrends,
  onSelectOpportunity,
  onOpenCustomIdeaModal,
}) => {
  // Playground state
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(true);
  const [overridesMap, setOverridesMap] = useState<Record<string, ScoringInputOverrides>>({});

  // Active creator profile and trends
  const profile = useMemo(() => getDemoProfile(), []);
  const analysis = useMemo(() => analyzeCreatorProfile(profile), [profile]);
  const activeTrends: TrendSignal[] = useMemo(() => {
    if (passedTrends && passedTrends.length > 0) return passedTrends;
    return (fallbackTrendsData.trends as unknown as TrendSignal[]) || [];
  }, [passedTrends]);

  // Deterministically ranked opportunities (with active overrides applied)
  const rankedOpportunities: Opportunity[] = useMemo(() => {
    const opps = generateRankedOpportunities(profile, analysis, activeTrends, overridesMap);
    if (opps.length > 0) return opps;
    return initialOpportunities;
  }, [profile, analysis, activeTrends, overridesMap, initialOpportunities]);

  // Selected candidate to tune in the playground
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(() => {
    // Default to trend-3 ("Wall Slide", currently Rank #2) to demonstrate ranking shift to #1
    const wallSlide = activeTrends.find((t) => t.id === 'trend-3');
    return wallSlide ? 'trend-3' : (activeTrends[0]?.id || 'trend-1');
  });

  const activeCandidateTrend = activeTrends.find((t) => t.id === selectedCandidateId) || activeTrends[0];
  const activeCandidateOpp = rankedOpportunities.find((o) => o.trendId === selectedCandidateId || o.id === selectedCandidateId);
  const currentOverrides = overridesMap[selectedCandidateId] || {};

  // Original baseline values for the selected candidate
  const originalValues = useMemo(() => {
    if (!activeCandidateTrend) return { svi: 75, growthType: 'steady' as GrowthType, comp: 'Medium' as CompetitionLevel, recency: 30, niche: 70, aud: 70 };
    
    // Topic recency in baseline
    let minDaysAgo = 30;
    const tokens = activeCandidateTrend.topic.toLowerCase().split(/\s+/);
    for (const token of tokens) {
      const d = analysis.recentTopicRecency.get(token);
      if (d !== undefined && d < minDaysAgo) {
        minDaysAgo = d;
      }
    }

    return {
      svi: activeCandidateTrend.search_volume_index || 70,
      growthType: activeCandidateTrend.growth_type || 'steady',
      comp: activeCandidateTrend.competition_level || 'Medium',
      recency: minDaysAgo,
      niche: activeCandidateOpp?.originalScore !== undefined ? (activeCandidateOpp.scoreBreakdown?.nicheFit ?? 70) : 70,
      aud: activeCandidateOpp?.originalScore !== undefined ? (activeCandidateOpp.scoreBreakdown?.audienceFit ?? 70) : 70,
    };
  }, [activeCandidateTrend, analysis, activeCandidateOpp]);

  // Handle playground input adjustments
  const handleUpdateOverride = <K extends keyof ScoringInputOverrides>(field: K, value: ScoringInputOverrides[K]) => {
    setOverridesMap((prev) => {
      const candidateOverrides: ScoringInputOverrides = { ...(prev[selectedCandidateId] || {}) };
      (candidateOverrides as any)[field] = value;
      return {
        ...prev,
        [selectedCandidateId]: candidateOverrides,
      };
    });
  };

  // Reset simulation overrides for all candidates
  const handleResetSimulation = () => {
    setOverridesMap({});
  };

  const isSimulationActive = Object.keys(overridesMap).length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-neutral-900 to-neutral-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Deterministic Decision Engine
            </span>
            <span className="text-xs text-neutral-400">
              • Weights: Niche 25% | Hist 25% | Trend 20% | Gap 15% | Aud 15%
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ranked Content Opportunities
          </h1>
          <p className="text-sm text-neutral-300 mt-1">
            “What should I post next — and why?” Ranked 0–100 with transparent 5-factor mathematical evidence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPlaygroundOpen((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
              isPlaygroundOpen
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>{isPlaygroundOpen ? 'Hide Playground' : 'Test Scoring Inputs'}</span>
            {isPlaygroundOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenCustomIdeaModal}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Evaluate New Topic</span>
          </button>
        </div>
      </div>

      {/* 4. MENTOR DEMONSTRATION MODE: DECISION ENGINE PLAYGROUND */}
      {isPlaygroundOpen && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-indigo-500/40 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Decision Engine Playground (Mentor Demonstration Mode)
                </h2>
                {isSimulationActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Simulation Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Tweak scoring inputs in real-time. The deterministic TypeScript engine instantly recalculates factor scores, total score, and candidate ranks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSimulationActive && (
                <button
                  onClick={handleResetSimulation}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reset to Original</span>
                </button>
              )}
            </div>
          </div>

          {/* Candidate Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-neutral-950/70 p-4 rounded-xl border border-neutral-800/80">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Select Opportunity Candidate To Simulate:
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                {activeTrends.map((t) => {
                  const opp = rankedOpportunities.find((o) => o.trendId === t.id);
                  const isModified = Boolean(overridesMap[t.id]);
                  return (
                    <option key={t.id} value={t.id}>
                      #{opp?.currentRank ?? '?'} [{opp?.opportunityScore ?? '?'}/100] {t.topic} {isModified ? '(Simulation Modified)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Candidate Impact Preview Card */}
            {activeCandidateOpp && (
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-neutral-400 font-sans font-bold text-[11px] uppercase tracking-wider">
                  <span>Simulation Impact</span>
                  <span className={activeCandidateOpp.isSimulationModified ? 'text-amber-400' : 'text-neutral-500'}>
                    {activeCandidateOpp.isSimulationModified ? 'Modified' : 'Baseline'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-white font-bold pt-1">
                  <span>Score: {activeCandidateOpp.opportunityScore} / 100</span>
                  {activeCandidateOpp.originalScore !== undefined && (
                    <span className={`text-xs ${
                      activeCandidateOpp.opportunityScore > activeCandidateOpp.originalScore
                        ? 'text-emerald-400'
                        : activeCandidateOpp.opportunityScore < activeCandidateOpp.originalScore
                        ? 'text-rose-400'
                        : 'text-neutral-400'
                    }`}>
                      {activeCandidateOpp.opportunityScore >= activeCandidateOpp.originalScore
                        ? `+${activeCandidateOpp.opportunityScore - activeCandidateOpp.originalScore}`
                        : `${activeCandidateOpp.opportunityScore - activeCandidateOpp.originalScore}`} pts (was {activeCandidateOpp.originalScore})
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Rank: #{activeCandidateOpp.currentRank}</span>
                  {activeCandidateOpp.originalRank !== undefined && activeCandidateOpp.originalRank !== activeCandidateOpp.currentRank && (
                    <span className="text-emerald-400 font-bold">
                      {activeCandidateOpp.currentRank < activeCandidateOpp.originalRank ? '▲' : '▼'} was Rank #{activeCandidateOpp.originalRank}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Simulation Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Control 1: Trend Search Volume Index */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trend Search Index (SVI)</span>
                </div>
                <span className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
                  {currentOverrides.searchVolumeIndex ?? originalValues.svi} / 100
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Original SVI: <span className="text-neutral-300 font-mono">{originalValues.svi}</span>
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={currentOverrides.searchVolumeIndex ?? originalValues.svi}
                onChange={(e) => handleUpdateOverride('searchVolumeIndex', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-neutral-400">Growth Momentum:</span>
                <select
                  value={currentOverrides.growthType ?? originalValues.growthType}
                  onChange={(e) => handleUpdateOverride('growthType', e.target.value as GrowthType)}
                  className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="breakout">Breakout (+25 pts)</option>
                  <option value="rising">Rising (+15 pts)</option>
                  <option value="sustained">Sustained (+10 pts)</option>
                  <option value="steady">Steady (+5 pts)</option>
                </select>
              </div>
            </div>

            {/* Control 2: Market Competition Level */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Market Competition Level</span>
                </div>
                <span className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
                  {currentOverrides.competitionLevel ?? originalValues.comp}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Original: <span className="text-neutral-300 font-mono">{activeCandidateTrend?.competition_level || 'Data unavailable (Neutral Medium fallback)'}</span>
              </p>
              <select
                value={currentOverrides.competitionLevel ?? originalValues.comp}
                onChange={(e) => handleUpdateOverride('competitionLevel', e.target.value as CompetitionLevel)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Low">Low Competition (90 index -&gt; 88 pts whitespace)</option>
                <option value="Medium">Medium Competition (70 index -&gt; 74 pts baseline)</option>
                <option value="High">High Competition (45 index -&gt; 57 pts saturated)</option>
              </select>
              <p className="text-[10px] text-neutral-500">
                Formula: S_gap = 0.7 × CompetitionIndex + 25 (when unposted &gt; 14 days)
              </p>
            </div>

            {/* Control 3: Topic Recency / Fatigue */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Film className="w-3.5 h-3.5" />
                  <span>Topic Recency (Days Ago)</span>
                </div>
                <span className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
                  {currentOverrides.daysSinceLastCovered ?? originalValues.recency} days
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Original recency: <span className="text-neutral-300 font-mono">{originalValues.recency} days ago</span>
                {originalValues.recency <= 7 && <span className="text-amber-400 font-bold ml-1">(Fatigue penalty active!)</span>}
              </p>
              <input
                type="range"
                min={0}
                max={60}
                value={currentOverrides.daysSinceLastCovered ?? originalValues.recency}
                onChange={(e) => handleUpdateOverride('daysSinceLastCovered', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500 flex justify-between">
                <span>0-7d: Penalty (30)</span>
                <span>8-14d: Mod (55)</span>
                <span>&gt;14d: Fresh (74-88)</span>
              </div>
            </div>

            {/* Control 4: Niche Fit Override */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>Niche Match (25% Weight)</span>
                </div>
                <span className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
                  {currentOverrides.nicheMatchScore ?? originalValues.niche} / 100
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Original: <span className="text-neutral-300 font-mono">{originalValues.niche}/100</span>
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={currentOverrides.nicheMatchScore ?? originalValues.niche}
                onChange={(e) => handleUpdateOverride('nicheMatchScore', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500 flex justify-between">
                <span>Low Match (40)</span>
                <span>Pillar Align (70)</span>
                <span>Core Direct (100)</span>
              </div>
            </div>

            {/* Control 5: Audience Relevance Override */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>Audience Relevance (15% Weight)</span>
                </div>
                <span className="font-mono text-white bg-neutral-800 px-2 py-0.5 rounded">
                  {currentOverrides.audienceFitScore ?? originalValues.aud} / 100
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Original: <span className="text-neutral-300 font-mono">{originalValues.aud}/100</span>
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={currentOverrides.audienceFitScore ?? originalValues.aud}
                onChange={(e) => handleUpdateOverride('audienceFitScore', Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="text-[10px] text-neutral-500 flex justify-between">
                <span>Partial (50)</span>
                <span>Interest Align (75)</span>
                <span>Peak Match (100)</span>
              </div>
            </div>

            {/* Simulation Instructions Tip */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-indigo-500/20 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mentor Challenge Test Scenario:</span>
                </span>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Try moving Wall Slide's recency from <strong>3 days</strong> to <strong>30 days</strong> and competition to <strong>Low</strong>. Notice how its score jumps from 86 to 95 and it overtakes Rank #1 as the new <strong>Top Pick</strong>!
                </p>
              </div>
              <div className="text-[10px] text-neutral-500 mt-2 font-mono">
                Isolated sandbox: Creator dataset remains unmodified.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities List: Descending order, Top Pick at #1, Explainable 5 Factors */}
      <div className="space-y-4">
        {rankedOpportunities.map((opp, index) => {
          const f = opp.explanation?.factors;
          const isTopPick = index === 0;

          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className={`p-6 sm:p-7 rounded-2xl bg-neutral-900/90 border transition-all cursor-pointer group shadow-lg ${
                opp.isSimulationModified
                  ? 'border-indigo-500/60 shadow-indigo-500/10 hover:border-indigo-400'
                  : 'border-neutral-800 hover:border-indigo-500/60 hover:shadow-indigo-500/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left: Dominant Score + Title + 5 Explainable Factors */}
                <div className="flex items-start gap-6 flex-1">
                  {/* Dominant Score Box */}
                  <div className="shrink-0 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-950 to-neutral-950 border border-indigo-500/40 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-300 leading-none">
                        {opp.opportunityScore}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                        Score
                      </span>

                      {/* Rank tag in score box */}
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-mono font-bold text-neutral-400">
                        #{index + 1}
                      </span>

                      {/* Simulation badge inside score box */}
                      {opp.isSimulationModified && opp.originalScore !== undefined && (
                        <div className="text-[9px] font-mono text-amber-300 font-bold bg-amber-500/20 px-1 rounded mt-0.5">
                          was {opp.originalScore}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title, Badges, and 5-Factor Explainability Breakdown */}
                  <div className="space-y-3.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isTopPick
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black'
                          : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {isTopPick ? 'Top Pick' : opp.badge}
                      </span>

                      <span className="text-xs text-neutral-400 font-medium">
                        • {opp.matchedCategory}
                      </span>

                      {opp.isSimulationModified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <span>Simulation Modified</span>
                          {opp.originalRank !== undefined && opp.originalRank !== opp.currentRank && (
                            <span className="font-mono text-emerald-400 font-bold">
                              ({opp.currentRank < opp.originalRank ? '▲' : '▼'} was #{opp.originalRank})
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {opp.title}
                    </h3>

                    {/* 5-FACTOR FACTUAL EVIDENCE (Replaces generic checkmarks with empirical data) */}
                    {f ? (
                      <div className="pt-1 space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                          <span>5-Factor Deterministic Evidence</span>
                          <span className="text-neutral-500 font-normal lowercase font-mono">
                            formula: contribution = factor score × weight
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                          {/* 1. Niche Fit (25%) */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-indigo-400 text-[11px] flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  <span>Niche (25%)</span>
                                </span>
                                <span className="font-mono text-white text-[11px]">{f.nicheFit.score}/100</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{f.nicheFit.reason}</p>
                            </div>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono border-t border-neutral-800/60 pt-1 font-bold">
                              +{f.nicheFit.weightedContribution} pts
                            </div>
                          </div>

                          {/* 2. Historical Performance (25%) */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-violet-400 text-[11px] flex items-center gap-1">
                                  <Film className="w-3 h-3" />
                                  <span>Historical (25%)</span>
                                </span>
                                <span className="font-mono text-white text-[11px]">{f.historicalFit.score}/100</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{f.historicalFit.reason}</p>
                            </div>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono border-t border-neutral-800/60 pt-1 font-bold">
                              +{f.historicalFit.weightedContribution} pts
                            </div>
                          </div>

                          {/* 3. Trend Momentum (20%) */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-amber-400 text-[11px] flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Momentum (20%)</span>
                                </span>
                                <span className="font-mono text-white text-[11px]">{f.trendRelevance.score}/100</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{f.trendRelevance.reason}</p>
                            </div>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono border-t border-neutral-800/60 pt-1 font-bold">
                              +{f.trendRelevance.weightedContribution} pts
                            </div>
                          </div>

                          {/* 4. Content Gap (15%) */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  <span>Gap (15%)</span>
                                </span>
                                <span className="font-mono text-white text-[11px]">{f.contentGap.score}/100</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{f.contentGap.reason}</p>
                            </div>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono border-t border-neutral-800/60 pt-1 font-bold">
                              +{f.contentGap.weightedContribution} pts
                            </div>
                          </div>

                          {/* 5. Audience Relevance (15%) */}
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-pink-400 text-[11px] flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>Audience (15%)</span>
                                </span>
                                <span className="font-mono text-white text-[11px]">{f.audienceFit.score}/100</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">{f.audienceFit.reason}</p>
                            </div>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono border-t border-neutral-800/60 pt-1 font-bold">
                              +{f.audienceFit.weightedContribution} pts
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">
                        {opp.shortReason}
                      </p>
                    )}
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
          );
        })}
      </div>
    </div>
  );
};
