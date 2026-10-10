import {
  NormalizedCreatorProfile,
  TrendSignal,
  Opportunity,
  GeneratedContent,
} from '../../types/normalized';
import { CreatorAnalysisResult } from '../analysis/creatorAnalysis';
import {
  calculatePillarScores,
  buildWhyBreakdown,
  buildScoreMetrics,
} from '../scoring/opportunityScorer';
import { sampleOpportunities } from '../../data/mockData';

/**
 * Maps a trend signal to a creator-specific hook/script starter if pre-curated content is not yet available.
 */
function createStarterContent(
  creator: NormalizedCreatorProfile,
  trend: TrendSignal
): GeneratedContent {
  const topicShort = trend.topic.split('&')[0].trim();

  return {
    hook: {
      primary: `If you sit at a desk and want to try ${topicShort}, here is the honest science you need to know.`,
      visualHook: `Direct eye contact to camera holding relevant demonstration prop.`,
      textOverlay: `${topicShort.toUpperCase()} FOR DESK WORKERS ⚡`,
      alternativeHooks: [
        `The biggest mistake people make with ${topicShort}.`,
        `The 60-second guide to ${topicShort} without overcomplicating it.`,
        `Why this trending ${topicShort} protocol actually works.`,
      ],
    },
    script: {
      estimatedDuration: '35 seconds',
      audioVibe: 'Crisp, upbeat background beat with clear voiceover',
      sections: [
        {
          timestamp: '00:00 - 00:03',
          scene: 'Hook',
          visualAction: 'Direct framing addressing viewer problem.',
          spokenAudio: `If you have seen ${topicShort} trending and wondered if it fits a desk routine, watch this.`,
          onScreenText: `DOES ${topicShort.toUpperCase()} WORK?`,
        },
        {
          timestamp: '00:04 - 00:15',
          scene: 'The Problem & Mistake',
          visualAction: 'Visualizing common error or misunderstanding.',
          spokenAudio: `Most creators complicate this. You do not need extreme routines; here is the practical rule.`,
          onScreenText: 'THE REAL RULE',
        },
        {
          timestamp: '00:16 - 00:28',
          scene: 'Actionable Solution',
          visualAction: 'Demonstrating step-by-step protocol.',
          spokenAudio: `Focus on consistency and timing. Here is the exact checklist to get maximum results.`,
          onScreenText: 'STEP BY STEP CHECKLIST',
        },
        {
          timestamp: '00:29 - 00:35',
          scene: 'Payoff & CTA',
          visualAction: 'Closing result and pointing to comments.',
          spokenAudio: `Save this post and drop your questions below!`,
          onScreenText: 'SAVE THIS POST 📌',
        },
      ],
    },
    caption: `Everything you need to know about ${trend.topic} if you work a 9-to-5 💻\n\nKey takeaways:\n• Practical execution over perfection\n• Fits seamlessly into busy schedules\n\nSave this for your next routine! 📌`,
    cta: {
      action: 'Comment Keyword Automation + Save Trigger',
      commentKeyword: 'GUIDE',
      pinnedCommentPrompt: `Pinned: "Drop any questions on ${topicShort} below and I will reply to each! 👇"`,
    },
    hashtags: [
      `#${trend.category.replace(/[^\w]/g, '')}`,
      '#DeskWorkerFitness',
      '#HealthyHabits',
      '#AnanyaVermaFitness',
    ],
    creatorTips: [
      'Maintain crisp pacing in the first 3 seconds to maximize watch retention.',
      'Use high-contrast text overlay for sound-off viewers.',
    ],
  };
}

/**
 * Generates an appropriate, factual badge based on the highest sub-score.
 */
function deriveBadge(index: number, scores: { trendRelevance: number; historicalFit: number; nicheFit: number }): string {
  if (index === 0) return 'Top Pick';
  if (scores.trendRelevance >= 88) return 'Breakout Trend Match';
  if (scores.historicalFit >= 88) return 'High Engagement Signal';
  if (scores.nicheFit >= 88) return 'Core Pillar Match';
  return 'High Opportunity Match';
}

/**
 * Formats a clean opportunity title tailored to the creator.
 */
function deriveOpportunityTitle(trend: TrendSignal): string {
  // If matching existing curated opportunity, preserve its refined title
  const existing = sampleOpportunities.find((o) => o.trendId === trend.id);
  if (existing) return existing.title;

  return `The Desk-Worker Protocol: ${trend.topic}`;
}

/**
 * Pipeline that takes creator profile, analysis results, and raw trend signals,
 * scores each candidate deterministically, deduplicates candidates,
 * sorts descending by Opportunity Score, and marks #1 as Top Pick.
 */
export function generateRankedOpportunities(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trends: TrendSignal[]
): Opportunity[] {
  if (!trends || trends.length === 0) {
    return [];
  }

  // Deduplicate trend candidates by ID and normalized topic
  const seenIds = new Set<string>();
  const seenTopics = new Set<string>();
  const distinctTrends: TrendSignal[] = [];

  for (const t of trends) {
    const normTopic = t.topic.toLowerCase().trim();
    if (!seenIds.has(t.id) && !seenTopics.has(normTopic)) {
      seenIds.add(t.id);
      seenTopics.add(normTopic);
      distinctTrends.push(t);
    }
  }

  // Score each candidate
  const scoredCandidates: Array<{
    trend: TrendSignal;
    scores: ReturnType<typeof calculatePillarScores>;
  }> = [];

  for (const trend of distinctTrends) {
    const scores = calculatePillarScores(creator, analysis, trend);
    scoredCandidates.push({ trend, scores });
  }

  // Sort strictly descending by totalScore (highest first)
  scoredCandidates.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  // Build ranked opportunities
  const opportunities: Opportunity[] = scoredCandidates.map(({ trend, scores }, idx) => {
    // Check if pre-curated content exists for this trend
    const existing = sampleOpportunities.find((o) => o.trendId === trend.id);
    const generatedContent = existing
      ? existing.generatedContent
      : createStarterContent(creator, trend);

    const whyBreakdown = buildWhyBreakdown(creator, analysis, trend, scores);
    const scoreMetrics = buildScoreMetrics(scores, trend);
    const badge = deriveBadge(idx, scores);
    const title = deriveOpportunityTitle(trend);

    const shortReason =
      trend.growth_type === 'breakout'
        ? `${trend.growth_status || '+200% Breakout'} surge matches your highest-performing ${analysis.bestFormat} format.`
        : `Strong search velocity for "${trend.topic.split('&')[0].trim()}" aligns with your historical save rates.`;

    return {
      id: `opp-${trend.id}`,
      title,
      opportunityScore: scores.totalScore,
      shortReason,
      badge,
      trendId: trend.id,
      matchedCategory: trend.category,
      scoreBreakdown: scores,
      whyBreakdown,
      scoreMetrics,
      generatedContent,
    };
  });

  return opportunities;
}
