import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Zap
} from 'lucide-react';
import { Opportunity } from '../types';

interface CustomIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOpportunity: (opp: Opportunity) => void;
}

export const CustomIdeaModal: React.FC<CustomIdeaModalProps> = ({
  isOpen,
  onClose,
  onAddOpportunity,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!isOpen) return null;

  const sampleQuickTopics = [
    '3 Quick Desk Stretches for Tight Hip Flexors',
    'High-Protein Greek Yogurt Mug Cake in Microwave',
    'Walking 10K Steps Without Going Outside',
    'Contrast Showers for Sore Legs',
  ];

  const handleEvaluate = async (topicToEvaluate?: string) => {
    const topic = topicToEvaluate || topicInput;
    if (!topic.trim()) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/analyze-custom-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      if (data.success && data.opportunity) {
        const raw = data.opportunity;
        const newOpp: Opportunity = {
          id: `opp-custom-${Date.now()}`,
          title: raw.title || `The ${topic} Protocol for Desk Workers`,
          opportunityScore: raw.opportunityScore || 85,
          shortReason: raw.shortReason || `Strong search velocity for "${topic}" intersecting with Ananya's highest-saving educational format.`,
          badge: raw.badge || 'Top Opportunity Match',
          matchedCategory: 'Custom Trend',
          whyBreakdown: raw.whyBreakdown || {
            nicheFit: `Directly matches Ananya’s desk-worker fitness audience.`,
            historicalContentFit: `Similar mobility and health content produces above-average saves.`,
            trendRelevance: `${topic} search interest is rising on Google Trends.`,
            contentGap: `Few creators address this practical desk routine angle.`,
            audienceRelevance: `Solves a direct daily hurdle for busy professionals.`,
          },
          scoreMetrics: raw.scoreMetrics || {
            viralityPotential: 88,
            historicalAffinity: 86,
            productionEase: 92,
            retentionEstimate: 87,
            competitionLevel: 'Low',
          },
          generatedContent: {
            hook: {
              primary: `If you have been struggling with ${topic}, here is the honest science nobody tells you.`,
              visualHook: `Ananya holds up a visual demonstration while looking directly into the camera.`,
              textOverlay: `THE TRUTH ABOUT ${topic.toUpperCase()} ⚡`,
              alternativeHooks: [
                `Stop doing ${topic} the hard way.`,
                `The 30-second ${topic} rule for desk workers.`,
              ],
            },
            script: {
              estimatedDuration: '35 seconds',
              audioVibe: 'Crisp, punchy lofi with clean voiceover',
              sections: [
                {
                  timestamp: '00:00 - 00:04',
                  scene: 'Hook',
                  visualAction: 'Ananya addresses camera with direct eye contact.',
                  spokenAudio: `If you have been wondering if ${topic} actually works for desk workers, here is the answer.`,
                  onScreenText: `DOES ${topic.toUpperCase()} WORK?`,
                },
                {
                  timestamp: '00:05 - 00:18',
                  scene: 'The Problem & Mistake',
                  visualAction: 'Demonstrating common mistake.',
                  spokenAudio: `Most people overcomplicate this. Here is the realistic protocol that takes under 5 minutes.`,
                  onScreenText: `THE REAL PROTOCOL (5 MINS)`,
                },
                {
                  timestamp: '00:19 - 00:28',
                  scene: 'Solution',
                  visualAction: 'Step-by-step breakdown on screen.',
                  spokenAudio: `Do this consistently at 3 PM when fatigue hits. You will feel an immediate difference in energy.`,
                  onScreenText: `CONSISTENCY RULE`,
                },
                {
                  timestamp: '00:29 - 00:35',
                  scene: 'CTA',
                  visualAction: 'Point to comment section with friendly smile.',
                  spokenAudio: `Comment "${topic.split(' ')[0].toUpperCase()}" below and I will DM you my complete cheatsheet for free.`,
                  onScreenText: `Comment for the free guide 📩`,
                },
              ],
            },
            caption: `The honest truth about ${topic} for busy people who sit at a desk all day 💻👇\n\nMost fitness advice assumes you have 2 hours a day. Here is the 5-minute protocol that works for real life.\n\nDrop a comment below with "${topic.split(' ')[0].toUpperCase()}" and I will send you the breakdown in your DMs!\n\nSave this for later 📌`,
            cta: {
              action: 'Comment Keyword Automation',
              commentKeyword: topic.split(' ')[0].toUpperCase(),
              pinnedCommentPrompt: `Pinned: "Drop '${topic.split(' ')[0].toUpperCase()}' below and I'll send you the complete step-by-step PDF! 👇"`,
            },
            hashtags: ['#FitnessWithAnanya', '#DeskWorkerHealth', '#FatLossTips', '#MobilityRoutine'],
            creatorTips: [
              'Shoot with bright contrast lighting to make the hook jump out in Explore.',
              'Keep the opening 2 seconds under 8 words.',
            ],
          },
        };

        onAddOpportunity(newOpp);
        onClose();
      }
    } catch (err) {
      console.error('Failed to analyze custom topic:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Evaluate Custom Trend Topic</h3>
              <p className="text-xs text-neutral-400">Score any topic against @fitnesswithananya's data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Enter any fitness trend, recipe, or workout concept:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 10-minute desk walking workout, Sourdough protein toast..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEvaluate();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => handleEvaluate()}
                disabled={isEvaluating || !topicInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Score Topic</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Quick Suggestions to Test:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuickTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopicInput(topic);
                    handleEvaluate(topic);
                  }}
                  disabled={isEvaluating}
                  className="text-xs px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer text-left"
                >
                  + {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-neutral-300 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            TrendIQ calculates an Opportunity Score (0–100), validates the 5 pillars, and prepares a ready-to-record Reel package.
          </p>
        </div>
      </div>
    </div>
  );
};
