import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
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
  Volume2,
  Zap,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Opportunity, GeneratedContent } from '../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onRegenerateWithGemini: (opportunity: Opportunity) => Promise<GeneratedContent | null>;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onRegenerateWithGemini,
}) => {
  const [activeTab, setActiveTab] = useState<'why' | 'generate'>('why');
  const [currentContent, setCurrentContent] = useState<GeneratedContent>(opportunity.generatedContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const updated = await onRegenerateWithGemini(opportunity);
      if (updated) {
        setCurrentContent(updated);
      }
    } catch (err) {
      console.error('Error generating content:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBrief = () => {
    const briefText = `=====================================================
TRENDIQ CONTENT BRIEF
Opportunity: ${opportunity.title}
Opportunity Score: ${opportunity.opportunityScore}/100
Category: ${opportunity.matchedCategory}
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

--- 3. SCRIPT ---
Duration: ${currentContent.script.estimatedDuration}
Audio: ${currentContent.script.audioVibe}

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
=====================================================
`;

    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrendIQ_${opportunity.id}_ContentBrief.txt`;
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
              <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Ready
              </span>
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
              {/* Studio Header Action */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      TrendIQ Content Studio
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Structured Reel package ready to record.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-semibold text-xs border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
                    <span>{isGenerating ? 'Generating...' : 'Regenerate Variation'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(
                      `HOOK:\n${currentContent.hook.primary}\n\nSCRIPT:\n${currentContent.script.sections.map(s => `[${s.timestamp}] ${s.scene}: ${s.spokenAudio}`).join('\n')}\n\nCAPTION:\n${currentContent.caption}\n\nCTA:\n${currentContent.cta.pinnedCommentPrompt}`,
                      'all'
                    )}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {copiedSection === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'all' ? 'Copied All' : 'Copy All'}</span>
                  </button>
                </div>
              </div>

              {/* 1. HOOK */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Hook
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
                    Spoken Hook
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
              </div>

              {/* 2. SCRIPT */}
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

              {/* 3. CAPTION */}
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

              {/* 4. CTA */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      CTA
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
