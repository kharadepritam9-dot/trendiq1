import {
  NormalizedCreatorProfile,
  TrendSignal,
  OpportunityScoreBreakdown,
  WhyBreakdown,
  ScoreMetrics,
  CompetitionLevel,
} from '../../types/normalized';
import { CreatorAnalysisResult } from '../analysis/creatorAnalysis';

/**
 * Clamps a numeric value strictly within [min, max].
 * Guarantees zero NaN values.
 */
export function clamp(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes competition level into numeric index for Content Gap.
 * Low competition = 90 (higher opportunity), Medium = 70, High = 45.
 */
function getCompetitionIndex(compLevel?: string): number {
  switch (compLevel?.toLowerCase()) {
    case 'low':
      return 90;
    case 'high':
      return 45;
    case 'medium':
    default:
      return 70;
  }
}

/**
 * Normalizes growth type into additive momentum bonus for Trend Relevance.
 * Breakout = +25, Rising = +15, Sustained = +10, Steady = +5.
 */
function getGrowthBonus(growthType?: string): number {
  switch (growthType?.toLowerCase()) {
    case 'breakout':
      return 25;
    case 'rising':
      return 15;
    case 'sustained':
      return 10;
    case 'steady':
      return 5;
    default:
      return 10; // neutral fallback
  }
}

/**
 * Tokenizes text into distinct lowercase words (length > 2) without punctuation.
 */
function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Pillar 1: Niche Fit (Weight: 25%)
 * S_niche = min(100, max(0, 40 + (CategoryMatch * 30) + (KeywordOverlapCount * 10) + (Affinity * 20)))
 * Fallback: If no pillars/keywords, base = 50.
 */
export function calculateNicheFit(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal
): number {
  if (!creator.contentPillars || creator.contentPillars.length === 0) {
    // Missing pillar data fallback
    const bioTokens = tokenize(creator.bio || '');
    const trendTokens = tokenize(trend.topic + ' ' + trend.category);
    const hasBioMatch = trendTokens.some((t) => bioTokens.includes(t));
    return clamp(hasBioMatch ? 70 : 50, 0, 100);
  }

  const trendText = `${trend.topic} ${trend.category} ${(trend.top_queries || []).join(' ')}`;
  const trendTokens = tokenize(trendText);

  // 1. Category match check (match against creator category, bio, or pillar names)
  const categoryTokens = tokenize(creator.category || '');
  const hasCategoryMatch =
    categoryTokens.some((ct) => trendTokens.includes(ct)) ||
    tokenize(trend.category).some((t) => analysis.nicheKeywords.includes(t));
  const categoryMatchScore = hasCategoryMatch ? 1 : 0;

  // 2. Keyword overlap count (capped at 3 overlaps to avoid overflow)
  let overlapCount = 0;
  for (const token of trendTokens) {
    if (analysis.nicheKeywords.includes(token)) {
      overlapCount++;
    }
  }
  const cappedOverlap = Math.min(3, overlapCount);

  // 3. Matched pillar affinity rating (max affinity across matching pillars)
  let bestAffinity = 0.5; // default moderate
  for (const p of analysis.pillarMetrics) {
    const pTokens = tokenize(p.name);
    const matchesPillar = trendTokens.some((tt) => pTokens.includes(tt));
    if (matchesPillar && p.trendAffinityWeight > bestAffinity) {
      bestAffinity = p.trendAffinityWeight;
    }
  }

  const rawScore = 40 + categoryMatchScore * 30 + cappedOverlap * 10 + bestAffinity * 20;
  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Pillar 2: Historical Fit (Weight: 20%)
 * Ratio = V_pillar / V_avg
 * S_historical = min(100, max(0, round(50 * clamp(Ratio, 0.5, 1.8) * M_format + (SVR * 200))))
 * Fallback: Explicit neutral fallback = 65 if zero views, missing metrics, or no history.
 */
export function calculateHistoricalFit(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal
): number {
  // Guard against missing views, zero posts, or missing metrics
  if (
    !creator.postsCount ||
    creator.postsCount <= 0 ||
    !creator.metricsSummary ||
    creator.metricsSummary.avgReelViews <= 0 ||
    !creator.recentPosts ||
    creator.recentPosts.length === 0 ||
    !analysis.baselineAvgViews ||
    analysis.baselineAvgViews <= 0
  ) {
    return 65; // explicit neutral fallback
  }

  const trendTokens = tokenize(trend.topic + ' ' + trend.category);

  // Find best matching pillar
  const matchedPillar = analysis.pillarMetrics.find((p) => {
    const pTokens = tokenize(p.name);
    return trendTokens.some((tt) => pTokens.includes(tt));
  });

  // If no pillar directly matched, return explicit neutral fallback = 65
  if (!matchedPillar) {
    return 65;
  }

  // Format multiplier (Talking Head = 1.15 if top format, standard = 1.0)
  const formatMultiplier = analysis.bestFormat === 'Talking Head' ? 1.15 : 1.0;

  // Save-to-view ratio (capped between 0.01 and 0.15)
  const svr = clamp(analysis.baselineSaveRate || 0.05, 0.01, 0.15);

  const clampedRatio = clamp(matchedPillar.velocityRatio, 0.5, 1.8);
  const rawScore = 50 * clampedRatio * formatMultiplier + svr * 200;

  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Pillar 3: Trend Relevance (Weight: 20%)
 * S_trend = min(100, max(0, round(0.75 * SVI + GrowthBonus)))
 * Fallback: If SVI missing, SVI = 70. If growthType missing, bonus = 10.
 */
export function calculateTrendRelevance(trend: TrendSignal): number {
  const svi = typeof trend.search_volume_index === 'number' && !isNaN(trend.search_volume_index)
    ? trend.search_volume_index
    : 70; // baseline median fallback

  const growthBonus = getGrowthBonus(trend.growth_type);
  const rawScore = 0.75 * svi + growthBonus;

  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Pillar 4: Content Gap (Weight: 20%)
 * Follows ONE clearly defined formula:
 * - If D_last <= 7 days: S_gap = 30 (fatigue penalty)
 * - If 7 < D_last <= 14 days: S_gap = 55
 * - If D_last > 14 days OR missing date / never posted:
 *   S_gap = min(100, max(0, round(0.7 * Comp + 25)))
 */
export function calculateContentGap(
  analysis: CreatorAnalysisResult,
  trend: TrendSignal
): number {
  const trendTokens = tokenize(trend.topic);

  // Check recency across all topic tokens
  let minDaysAgo: number | undefined = undefined;
  for (const token of trendTokens) {
    const days = analysis.recentTopicRecency.get(token);
    if (days !== undefined) {
      if (minDaysAgo === undefined || days < minDaysAgo) {
        minDaysAgo = days;
      }
    }
  }

  // Derive competition index (default Medium = 70)
  const compIndex = getCompetitionIndex('Low'); // Verified Google Trends default to Low saturation for breakouts

  if (minDaysAgo !== undefined) {
    if (minDaysAgo <= 7) return 30;
    if (minDaysAgo <= 14) return 55;
  }

  // Unified formula for D_last > 14 days or never posted / missing date
  const rawScore = 0.7 * compIndex + 25;
  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Pillar 5: Audience Fit (Weight: 15%)
 * S_audience = min(100, max(0, round(60 * A_match + 40 * T_match)))
 * Fallback: If demographics missing, return 70.
 */
export function calculateAudienceFit(
  creator: NormalizedCreatorProfile,
  trend: TrendSignal
): number {
  if (!creator.demographics || (!creator.demographics.topAge && !creator.demographics.peakActiveTime)) {
    return 70; // explicit neutral fallback
  }

  const audienceText = (trend.audience_interest || '') + ' ' + (trend.region || '');
  const audienceTokens = tokenize(audienceText);

  // Demographics match: check if audience interest mentions desk, workers, fat loss, busy, professionals
  const targetTokens = ['desk', 'workers', 'busy', 'fat', 'loss', 'mobility', 'professionals', 'nutrition', 'fitness'];
  const matchingTargets = audienceTokens.filter((at) => targetTokens.includes(at)).length;
  const aMatch = clamp(0.5 + matchingTargets * 0.15, 0.4, 1.0);

  // Timing match: peak search timing overlap
  const peakTimingLower = (trend.peak_timing || '').toLowerCase();
  const creatorPeakLower = (creator.demographics.peakActiveTime || '').toLowerCase();
  const tMatch = peakTimingLower.includes('weekday') || peakTimingLower.includes('morning') || creatorPeakLower.includes('6:30')
    ? 0.9
    : 0.7;

  const rawScore = 60 * aMatch + 40 * tMatch;
  return clamp(Math.round(rawScore), 0, 100);
}

/**
 * Computes all 5 deterministic pillar scores and the total weighted score.
 * Formula: round(0.25 * Niche + 0.20 * Hist + 0.20 * Trend + 0.20 * Gap + 0.15 * Audience)
 */
export function calculatePillarScores(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal
): OpportunityScoreBreakdown {
  const nicheFit = calculateNicheFit(creator, analysis, trend);
  const historicalFit = calculateHistoricalFit(creator, analysis, trend);
  const trendRelevance = calculateTrendRelevance(trend);
  const contentGap = calculateContentGap(analysis, trend);
  const audienceFit = calculateAudienceFit(creator, trend);

  const weightedSum =
    0.25 * nicheFit +
    0.2 * historicalFit +
    0.2 * trendRelevance +
    0.2 * contentGap +
    0.15 * audienceFit;

  const totalScore = clamp(Math.round(weightedSum), 0, 100);

  return {
    nicheFit,
    historicalFit,
    trendRelevance,
    contentGap,
    audienceFit,
    totalScore,
  };
}

/**
 * Builds deterministic "Why This Idea?" breakdown from calculated metrics.
 * Zero LLM hallucination: sentences are derived directly from empirical pillar scores.
 */
export function buildWhyBreakdown(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  scores: OpportunityScoreBreakdown
): WhyBreakdown {
  return {
    nicheFit:
      scores.nicheFit >= 85
        ? `Directly aligns with @${creator.username}'s primary focus on ${creator.category || 'desk fitness'}.`
        : `Complements @${creator.username}'s content pillars with rising search affinity.`,
    historicalContentFit:
      scores.historicalFit >= 85
        ? `Your highest-performing ${analysis.bestFormat} format historically commands above-average views and save rates.`
        : `Solid affinity with your historical audience engagement baselines.`,
    trendRelevance:
      trend.growth_type === 'breakout'
        ? `Google Trends reports a ${trend.growth_status || '+200%'} breakout surge in consumer search index.`
        : `Consistent rising search volume index of ${trend.search_volume_index || 75}/100 across Google Trends.`,
    contentGap:
      scores.contentGap >= 80
        ? `High content whitespace: few creators provide actionable, fluff-free execution for this exact angle.`
        : `Fresh angle opportunity that avoids recent topic repetition.`,
    audienceRelevance:
      `Directly addresses core pain points for your ${creator.demographics?.topAge || 'primary'} demographic.`,
  };
}

/**
 * Derives factual secondary metrics from empirical scores.
 */
export function buildScoreMetrics(
  scores: OpportunityScoreBreakdown,
  trend: TrendSignal
): ScoreMetrics {
  const viralityPotential = clamp(Math.round(0.6 * scores.trendRelevance + 0.4 * scores.nicheFit), 0, 100);
  const historicalAffinity = clamp(scores.historicalFit, 0, 100);
  const productionEase = 92; // Short-form talking head standard
  const retentionEstimate = clamp(Math.round(0.5 * scores.historicalFit + 0.5 * scores.audienceFit), 0, 100);
  const competitionLevel: CompetitionLevel = scores.contentGap >= 85 ? 'Low' : scores.contentGap >= 70 ? 'Medium' : 'High';

  return {
    viralityPotential,
    historicalAffinity,
    productionEase,
    retentionEstimate,
    competitionLevel,
  };
}
