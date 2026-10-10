import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Film, 
  Target, 
  Users, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  Download,
  Layers,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { Opportunity, GeneratedContent, ContentAngle } from '../types';

interface CreativeAngleOption {
  id: ContentAngle;
  label: string;
  tagline: string;
  icon: string;
}

const CREATIVE_ANGLES: readonly CreativeAngleOption[] = [
  {
    id: 'educational',
    label: 'Educational',
    tagline: 'Evidence-backed, step-by-step tactical rules & numbers',
    icon: '🎓',
  },
  {
    id: 'punchy',
    label: 'Punchy',
    tagline: 'High-tempo pattern interrupt with instant curiosity gap',
    icon: '⚡',
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    tagline: 'Relatable desk-worker struggle & transformation arc',
    icon: '📖',
  },
  {
    id: 'conversational',
    label: 'Conversational',
    tagline: 'Direct, candid peer-to-peer coffee-chat tone',
    icon: '💬',
  },
] as const;

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onGenerateContent: (
    opportunity: Opportunity,
    angle: ContentAngle,
    previousVersions: GeneratedContent[]
  ) => Promise<{ success: boolean; content?: GeneratedContent; error?: string; message?: string }>;
  sessionVersions?: GeneratedContent[];
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onGenerateContent,
  sessionVersions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'why' | 'generate'>('why');
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle>(
    opportunity.selectedAngle || 'educational'
  );
  const [currentContent, setCurrentContent] = useState<GeneratedContent>(
    opportunity.generatedContent
  );
  const [versions, setVersions] = useState<GeneratedContent[]>(sessionVersions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sync state cleanly whenever selected opportunity changes (prevents stale content)
  useEffect(() => {
    setCurrentContent(opportunity.generatedContent);
    setSelectedAngle(opportunity.selectedAngle || 'educational');
    setVersions(sessionVersions.length > 0 ? sessionVersions : (opportunity.contentVersions || []));
    setGenerationError(null);
    setIsGenerating(false);
  }, [opportunity.id, sessionVersions]);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleGenerate = async (angleOverride?: ContentAngle) => {
    const angleToUse = angleOverride || selectedAngle;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await onGenerateContent(opportunity, angleToUse, versions);

      if (result.success && result.content) {
        setCurrentContent(result.content);
        setVersions((prev) => [...prev, result.content!]);
        setSelectedAngle(angleToUse);
      } else {
        setGenerationError(result.message || 'Generation failed. Please try again.');
        // NOTE: previous valid content remains unchanged
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBrief = () => {
    const briefText = `=====================================================
TRENDIQ CONTENT BRIEF
Opportunity: ${opportunity.title}
Opportunity Score: ${opportunity.opportunityScore}/100 (Unchanged)
Category: ${opportunity.matchedCategory}
Creative Angle: ${(currentContent.angle || selectedAngle).toUpperCase()}
Content Status: ${currentContent.isAiGenerated ? `AI-Generated (Version ${currentContent.version || versions.length || 1})` : 'Preloaded Sample Preview'}
Creator: @fitnesswithananya (Ananya Verma)
=====================================================

--- 1. WHY THIS IDEA? (5 PILLARS) ---
1. NICHE FIT: ${opportunity.whyBreakdown.nicheFit}
2. HISTORICAL FIT: ${opportunity.whyBreakdown.historicalContentFit}
3. TREND RELEVANCE: ${opportunity.whyBreakdown.trendRelevance}
4. CONTENT GAP: ${opportunity.whyBreakdown.contentGap}
5. AUDIENCE FIT: ${opportunity.whyBreakdown.audienceRelevance}

--- 2. HOOK ---
Spoken Hook: "${currentContent.hook.primary}"
Text Overlay: "${currentContent.hook.textOverlay}"
Visual Action: ${currentContent.hook.visualHook}

Alternative Hooks:
${(currentContent.hook.alternativeHooks || []).map((h, i) => `  ${i + 1}. ${h}`).join('\n')}

--- 3. SCRIPT ---
Duration: ${currentContent.script.estimatedDuration}
Audio Vibe: ${currentContent.script.audioVibe}

${currentContent.script.sections.map((s) => `[${s.timestamp}] ${s.scene}
Visual: ${s.visualAction}
Spoken: "${s.spokenAudio}"
Text: ${s.onScreenText}
`).join('\n')}

--- 4. CAPTION ---
${currentContent.caption}

--- 5. CTA ---
Action: ${currentContent.cta.action}
Keyword: "${currentContent.cta.commentKeyword}"
Pinned Comment: ${currentContent.cta.pinnedCommentPrompt}

Hashtags: ${currentContent.hashtags.join(' ')}

--- 6. CREATOR PRODUCTION TIPS ---
${(currentContent.creatorTips || []).map((tip, i) => `  ${i + 1}. ${tip}`).join('\n')}
=====================================================
`;

    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrendIQ_${opportunity.id}_${(currentContent.angle || selectedAngle)}_Brief.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-neutral-950/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Score Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-950 via-neutral-950 to-neutral-900 border border-indigo-500/40 flex flex-col items-center justify-center text-center shadow-lg shrink-0">
              <span className="text-2xl sm:text-3xl font-black font-mono text-indigo-300 leading-none">
                {opportunity.opportunityScore}
              </span>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                Score
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {opportunity.badge}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {opportunity.matchedCategory}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                {opportunity.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-neutral-800 bg-neutral-950/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('why')}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'why'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Why This Idea?</span>
            </button>

            <button
              onClick={() => setActiveTab('generate')}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'generate'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Content</span>
              {currentContent.isAiGenerated ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  AI Ready
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  Preview
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleDownloadBrief}
              className="text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Brief</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* TAB 1: WHY THIS IDEA? (5 Pillars) */}
          {activeTab === 'why' && (
            <div className="space-y-6">
              {/* Question Headline Banner */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                    TrendIQ Decision Matrix
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    “What should I post next — and why?”
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    5-pillar mathematical convergence for @fitnesswithananya.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate Content</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* The 5 Pillars: Concise 1-sentence format */}
              <div className="space-y-3">
                {/* Pillar 1: Niche Fit */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                      1. NICHE FIT
                    </span>
                    <p className="text-sm text-neutral-200 mt-0.5 font-medium">
                      {opportunity.whyBreakdown.nicheFit}
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Historical Fit */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Film className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">
                      2. HISTORICAL FIT
                    </span>
                    <p className="text-sm text-neutral-200 mt-0.5 font-medium">
                      {opportunity.whyBreakdown.historicalContentFit}
                    </p>
                  </div>
                </div>

                {/* Pillar 3: Trend Relevance */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      3. TREND RELEVANCE
                    </span>
                    <p className="text-sm text-neutral-200 mt-0.5 font-medium">
                      {opportunity.whyBreakdown.trendRelevance}
                    </p>
                  </div>
                </div>

                {/* Pillar 4: Content Gap */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      4. CONTENT GAP
                    </span>
                    <p className="text-sm text-neutral-200 mt-0.5 font-medium">
                      {opportunity.whyBreakdown.contentGap}
                    </p>
                  </div>
                </div>

                {/* Pillar 5: Audience Fit */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block">
                      5. AUDIENCE FIT
                    </span>
                    <p className="text-sm text-neutral-200 mt-0.5 font-medium">
                      {opportunity.whyBreakdown.audienceRelevance}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Factor Breakdown */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-4">
                  Opportunity Score Factors
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-neutral-400 font-sans">
                      <span>Topic Velocity</span>
                      <span className="text-emerald-400 font-bold">{opportunity.scoreMetrics.viralityPotential}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${opportunity.scoreMetrics.viralityPotential}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-neutral-400 font-sans">
                      <span>Historical Fit</span>
                      <span className="text-indigo-400 font-bold">{opportunity.scoreMetrics.historicalAffinity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${opportunity.scoreMetrics.historicalAffinity}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-neutral-400 font-sans">
                      <span>Production Ease</span>
                      <span className="text-amber-400 font-bold">{opportunity.scoreMetrics.productionEase}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${opportunity.scoreMetrics.productionEase}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-neutral-400 font-sans">
                      <span>Est. Retention</span>
                      <span className="text-violet-400 font-bold">{opportunity.scoreMetrics.retentionEstimate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: `${opportunity.scoreMetrics.retentionEstimate}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENERATE CONTENT (Hook, Script, Caption, CTA) */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
              {/* Creative Angle Selector & Content Source Badge */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Creative Angle
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentContent.isAiGenerated ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>AI Generated • <strong className="capitalize">{currentContent.angle || selectedAngle}</strong> (v{currentContent.version || versions.length || 1})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>Preloaded Sample Template</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Angle Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CREATIVE_ANGLES.map((angle) => {
                    const isSelected = selectedAngle === angle.id;
                    return (
                      <button
                        key={angle.id}
                        type="button"
                        onClick={() => setSelectedAngle(angle.id)}
                        disabled={isGenerating}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-950/50 text-white'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{angle.icon}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-400/20" />
                          )}
                        </div>
                        <div className="mt-1.5 font-bold text-xs capitalize text-white">
                          {angle.label}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                          {angle.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Version History Pill Bar (Same-Topic History) */}
                {versions.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80 flex-wrap">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      History ({versions.length}):
                    </span>
                    {versions.map((ver, idx) => {
                      const isActive =
                        currentContent.version === ver.version &&
                        currentContent.angle === ver.angle &&
                        currentContent.hook.primary === ver.hook.primary;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCurrentContent(ver);
                            if (ver.angle) {
                              setSelectedAngle(ver.angle);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
                          }`}
                        >
                          <span>v{ver.version || idx + 1}</span>
                          <span className="capitalize text-[10px] opacity-75">
                            ({ver.angle || 'prior'})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Alert Banner with Retry Button */}
              {generationError && (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                        Generation Failed
                      </h5>
                      <p className="text-xs text-rose-200/90 mt-0.5 font-medium leading-relaxed">
                        {generationError}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Your previous valid content is preserved below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleGenerate(selectedAngle)}
                      disabled={isGenerating}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={() => setGenerationError(null)}
                      className="p-1.5 text-rose-400 hover:text-white rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Studio Header Action Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      TrendIQ Content Studio
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {currentContent.isAiGenerated
                      ? `AI-generated Reel package for @fitnesswithananya using the "${selectedAngle}" angle.`
                      : 'Sample preview brief. Generate real AI content tailored to your selected angle.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs border border-emerald-500/40 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-amber-200' : 'text-amber-200'}`} />
                    <span>
                      {isGenerating
                        ? 'Generating with Gemini...'
                        : currentContent.isAiGenerated
                        ? `Regenerate Variation (${selectedAngle})`
                        : `Generate with AI (${selectedAngle})`}
                    </span>
                  </button>

                  <button
                    onClick={() => handleCopy(
                      `HOOK:\n${currentContent.hook.primary}\n\nTEXT OVERLAY:\n${currentContent.hook.textOverlay}\n\nVISUAL HOOK:\n${currentContent.hook.visualHook}\n\nSCRIPT:\n${currentContent.script.sections.map(s => `[${s.timestamp}] ${s.scene}: ${s.spokenAudio}`).join('\n')}\n\nCAPTION:\n${currentContent.caption}\n\nCTA:\n${currentContent.cta.pinnedCommentPrompt}\n\nHASHTAGS:\n${currentContent.hashtags.join(' ')}`,
                      'all'
                    )}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {copiedSection === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'all' ? 'Copied All' : 'Copy All'}</span>
                  </button>
                </div>
              </div>

              {/* 1. HOOK SECTION */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Hook ({currentContent.angle || selectedAngle})
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(currentContent.hook.primary, 'hook')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    {copiedSection === 'hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'hook' ? 'Copied' : 'Copy Hook'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Spoken Hook (First 2s)
                  </span>
                  <p className="text-base font-semibold text-white leading-snug">
                    “{currentContent.hook.primary}”
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <span className="text-xs font-bold text-amber-300 uppercase block mb-1">Text Overlay</span>
                    <p className="text-amber-200 font-mono">{currentContent.hook.textOverlay}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <span className="text-xs font-bold text-neutral-400 uppercase block mb-1">Visual Hook</span>
                    <p className="text-neutral-300">{currentContent.hook.visualHook}</p>
                  </div>
                </div>

                {/* Alternative Hooks */}
                {currentContent.hook.alternativeHooks && currentContent.hook.alternativeHooks.length > 0 && (
                  <div className="pt-2 border-t border-neutral-900">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      Alternative Hooks
                    </span>
                    <div className="space-y-1.5">
                      {currentContent.hook.alternativeHooks.map((alt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800/80 text-xs text-neutral-300"
                        >
                          <span>{i + 1}. “{alt}”</span>
                          <button
                            onClick={() => handleCopy(alt, `alt-hook-${i}`)}
                            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 shrink-0 cursor-pointer ml-2"
                          >
                            {copiedSection === `alt-hook-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SCRIPT SECTION */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Script ({currentContent.script.estimatedDuration})
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(
                      currentContent.script.sections.map(s => `[${s.timestamp}] ${s.scene}\nSpoken: "${s.spokenAudio}"\nVisual: ${s.visualAction}\n`).join('\n'),
                      'script'
                    )}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    {copiedSection === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'script' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 text-xs text-neutral-400">
                  <strong className="text-neutral-200">Audio Direction:</strong> {currentContent.script.audioVibe}
                </div>

                <div className="space-y-3">
                  {currentContent.script.sections.map((sec, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          {sec.timestamp}
                        </span>
                        <span className="font-semibold text-neutral-300">
                          {sec.scene}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                          <span className="text-xs font-bold text-neutral-400 block mb-0.5">Visual</span>
                          <p className="text-neutral-300">{sec.visualAction}</p>
                        </div>
                        <div className="md:col-span-2 p-2 rounded bg-neutral-950 border border-neutral-800">
                          <span className="text-xs font-bold text-emerald-400 block mb-0.5">Audio</span>
                          <p className="text-white font-medium">"{sec.spokenAudio}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. CAPTION SECTION */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Caption
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(`${currentContent.caption}\n\n${currentContent.hashtags.join(' ')}`, 'caption')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    {copiedSection === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'caption' ? 'Copied' : 'Copy Caption'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 font-sans text-xs sm:text-sm text-neutral-200 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto">
                  {currentContent.caption}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentContent.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-indigo-300 border border-neutral-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. CTA SECTION */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Call to Action (CTA)
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(currentContent.cta.pinnedCommentPrompt, 'cta')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    {copiedSection === 'cta' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'cta' ? 'Copied' : 'Copy CTA'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-xs text-neutral-400 block mb-1">Trigger Keyword</span>
                    <span className="text-base font-extrabold text-amber-300 font-mono">
                      "{currentContent.cta.commentKeyword}"
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-xs text-neutral-400 block mb-1">Pinned Comment</span>
                    <p className="text-neutral-200 font-medium">
                      {currentContent.cta.pinnedCommentPrompt}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. CREATOR TIPS SECTION */}
              {currentContent.creatorTips && currentContent.creatorTips.length > 0 && (
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Creator Execution Tips
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {currentContent.creatorTips.map((tip, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">
                          {i + 1}
                        </span>
                        <p className="leading-snug">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 px-6 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 hidden sm:block">
            TrendIQ • @fitnesswithananya
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
            >
              Close
            </button>

            {activeTab === 'why' ? (
              <button
                onClick={() => setActiveTab('generate')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <span>Generate Content</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleDownloadBrief}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Brief</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
