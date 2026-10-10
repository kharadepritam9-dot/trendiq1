import {
  NormalizedCreatorProfile,
  TrendSignal,
  OpportunityScoreBreakdown,
  WhyBreakdown,
  ScoreMetrics,
  CompetitionLevel,
  GrowthType,
  FactorExplanation,
  OpportunityExplanation,
  ScoringWeights,
  ScoringInputOverrides,
} from '../../types/normalized';
import { CreatorAnalysisResult } from '../analysis/creatorAnalysis';

/**
 * Mentor-mandated exact scoring weights.
 * Total = 100% (1.00). Configurable in this clearly named location.
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  nicheFit: 0.25,        // 25% - Niche Fit
  historicalFit: 0.25,   // 25% - Historical Performance
  trendRelevance: 0.20,  // 20% - Trend Momentum
  contentGap: 0.15,      // 15% - Content Gap
  audienceFit: 0.15,     // 15% - Audience Relevance
};

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
export function getCompetitionIndex(compLevel?: string): number {
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
 * Normalizes growth type into additive momentum bonus for Trend Momentum.
 * Breakout = +25, Rising = +15, Sustained = +10, Steady = +5.
 */
export function getGrowthBonus(growthType?: string): number {
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
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Factor 1: Niche Fit (Weight: 25%)
 * S_niche = min(100, max(0, 40 + (CategoryMatch * 30) + (KeywordOverlapCount * 10) + (Affinity * 20)))
 * Fallback: If no pillars/keywords, base = 50.
 */
export function calculateNicheFitDetails(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): { score: number; reason: string; evidence: string; isFallback: boolean } {
  if (overrides?.nicheMatchScore !== undefined) {
    const score = clamp(Math.round(overrides.nicheMatchScore), 0, 100);
    return {
      score,
      reason: `Simulated niche match adjusted to ${score}/100 in Decision Engine Playground.`,
      evidence: `Playground simulation input: Niche Match overridden to ${score}/100.`,
      isFallback: false,
    };
  }

  if (!creator.contentPillars || creator.contentPillars.length === 0) {
    const bioTokens = tokenize(creator.bio || '');
    const trendTokens = tokenize(trend.topic + ' ' + trend.category);
    const hasBioMatch = trendTokens.some((t) => bioTokens.includes(t));
    const score = clamp(hasBioMatch ? 70 : 50, 0, 100);
    return {
      score,
      reason: hasBioMatch
        ? `Keyword match identified in @${creator.username}'s bio (content pillars unavailable).`
        : `Creator profile has no defined content pillars; neutral fallback applied.`,
      evidence: hasBioMatch
        ? `Data fallback: Bio text keyword overlap detected. Neutral fallback score: ${score}/100.`
        : `Data unavailable: Zero content pillars in creator profile. Explicit neutral fallback: 50/100.`,
      isFallback: true,
    };
  }

  const trendText = `${trend.topic} ${trend.category} ${(trend.top_queries || []).join(' ')}`;
  const trendTokens = tokenize(trendText);

  // 1. Category match check
  const categoryTokens = tokenize(creator.category || '');
  const hasCategoryMatch =
    categoryTokens.some((ct) => trendTokens.includes(ct)) ||
    tokenize(trend.category).some((t) => analysis.nicheKeywords.includes(t));
  const categoryMatchScore = hasCategoryMatch ? 1 : 0;

  // 2. Keyword overlap count (capped at 3 overlaps)
  const overlappingKeywords: string[] = [];
  for (const token of trendTokens) {
    if (analysis.nicheKeywords.includes(token) && !overlappingKeywords.includes(token)) {
      overlappingKeywords.push(token);
    }
  }
  const cappedOverlap = Math.min(3, overlappingKeywords.length);

  // 3. Matched pillar affinity rating
  let bestAffinity = 0.5;
  let matchedPillarName = 'None';
  for (const p of analysis.pillarMetrics) {
    const pTokens = tokenize(p.name);
    const matchesPillar = trendTokens.some((tt) => pTokens.includes(tt));
    if (matchesPillar && p.trendAffinityWeight > bestAffinity) {
      bestAffinity = p.trendAffinityWeight;
      matchedPillarName = p.name;
    }
  }

  const rawScore = 40 + categoryMatchScore * 30 + cappedOverlap * 10 + bestAffinity * 20;
  const score = clamp(Math.round(rawScore), 0, 100);

  const reason =
    score >= 85
      ? `Direct alignment with @${creator.username}'s core focus on ${creator.category || 'desk fitness'} and pillar "${matchedPillarName}".`
      : score >= 65
      ? `Strong synergy with @${creator.username}'s content pillars through ${overlappingKeywords.length} overlapping keywords.`
      : `Moderate tangential relevance to @${creator.username}'s overall fitness themes.`;

  const evidence = `Category overlap: ${hasCategoryMatch ? `Matched (${creator.category || 'Creator'} / ${trend.category}) [+30 pts]` : 'None [+0 pts]'}; Keyword matches: ${overlappingKeywords.length > 0 ? `[${overlappingKeywords.slice(0, 3).join(', ')}]` : 'None'} (${cappedOverlap} capped × 10 = +${cappedOverlap * 10} pts); Matched pillar: "${matchedPillarName}" (affinity weight: ${bestAffinity.toFixed(2)} = +${Math.round(bestAffinity * 20)} pts); Base: 40 pts.`;

  return { score, reason, evidence, isFallback: false };
}

export function calculateNicheFit(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): number {
  return calculateNicheFitDetails(creator, analysis, trend, overrides).score;
}

/**
 * Factor 2: Historical Performance / Historical Fit (Weight: 25%)
 * S_historical = min(100, max(0, round(50 * clamp(Ratio, 0.5, 1.8) * M_format + (SVR * 200))))
 * Fallback: Explicit neutral fallback = 65 if zero views, missing metrics, or no history.
 */
export function calculateHistoricalFitDetails(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  _overrides?: ScoringInputOverrides
): { score: number; reason: string; evidence: string; isFallback: boolean } {
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
    return {
      score: 65,
      reason: `Account historical metrics unavailable; applied neutral baseline performance rating.`,
      evidence: `Data unavailable: Zero historical posts or reel views in profile. Explicit neutral fallback: 65/100.`,
      isFallback: true,
    };
  }

  const trendTokens = tokenize(trend.topic + ' ' + trend.category);

  // Find best matching pillar
  const matchedPillar = analysis.pillarMetrics.find((p) => {
    const pTokens = tokenize(p.name);
    return trendTokens.some((tt) => pTokens.includes(tt));
  });

  if (!matchedPillar) {
    return {
      score: 65,
      reason: `No past posts in a matching pillar for "${trend.topic}"; applied neutral historical baseline.`,
      evidence: `Data unavailable: No matching historical content pillar found for topic. Explicit neutral fallback: 65/100.`,
      isFallback: true,
    };
  }

  const formatMultiplier = analysis.bestFormat === 'Talking Head' ? 1.15 : 1.0;
  const svr = clamp(analysis.baselineSaveRate || 0.05, 0.01, 0.15);
  const clampedRatio = clamp(matchedPillar.velocityRatio, 0.5, 1.8);
  const rawScore = 50 * clampedRatio * formatMultiplier + svr * 200;
  const score = clamp(Math.round(rawScore), 0, 100);

  const reason = `Historical pillar "${matchedPillar.name}" averages ${matchedPillar.avgViews.toLocaleString()} views (${matchedPillar.velocityRatio.toFixed(2)}x baseline) with ${(svr * 100).toFixed(1)}% save rate.`;
  const evidence = `Pillar: "${matchedPillar.name}" (${matchedPillar.avgViews.toLocaleString()} avg views vs ${analysis.baselineAvgViews.toLocaleString()} baseline -> ${matchedPillar.velocityRatio.toFixed(2)}x velocity ratio, clamped: ${clampedRatio.toFixed(2)}); Format multiplier: ${formatMultiplier}x (${analysis.bestFormat}); Save-to-view rate: ${(svr * 100).toFixed(2)}% (+${(svr * 200).toFixed(1)} pts). Formula: 50 × ${clampedRatio.toFixed(2)} × ${formatMultiplier} + ${(svr * 200).toFixed(1)} = ${rawScore.toFixed(1)}.`;

  return { score, reason, evidence, isFallback: false };
}

export function calculateHistoricalFit(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): number {
  return calculateHistoricalFitDetails(creator, analysis, trend, overrides).score;
}

/**
 * Factor 3: Trend Momentum / Trend Relevance (Weight: 20%)
 * S_trend = min(100, max(0, round(0.75 * SVI + GrowthBonus)))
 * Fallback: If SVI missing, SVI = 70. If growthType missing, bonus = 10.
 */
export function calculateTrendRelevanceDetails(
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): { score: number; reason: string; evidence: string; isFallback: boolean } {
  const hasOverrideSvi = overrides?.searchVolumeIndex !== undefined;
  const hasMeasuredSvi = typeof trend.search_volume_index === 'number' && !isNaN(trend.search_volume_index);

  const svi = hasOverrideSvi
    ? clamp(overrides!.searchVolumeIndex!, 0, 100)
    : hasMeasuredSvi
    ? trend.search_volume_index
    : 70; // baseline median fallback

  const isFallback = !hasOverrideSvi && !hasMeasuredSvi;

  const growthType: GrowthType = overrides?.growthType || trend.growth_type || 'steady';
  const growthBonus = getGrowthBonus(growthType);
  const rawScore = 0.75 * svi + growthBonus;
  const score = clamp(Math.round(rawScore), 0, 100);

  const reason =
    growthType === 'breakout'
      ? `Google Trends reports a ${trend.growth_status || '+200% Breakout'} surge with high consumer search momentum.`
      : `Consistent search volume index of ${svi}/100 with ${growthType} trend momentum across Google Trends.`;

  const evidence = `${
    isFallback
      ? 'Data unavailable: SVI missing from trend snapshot, neutral fallback SVI=70/100 used'
      : hasOverrideSvi
      ? `Simulation input: Search Volume Index set to ${svi}/100`
      : `Measured Search Volume Index (SVI): ${svi}/100`
  } (0.75 × ${svi} = ${(0.75 * svi).toFixed(1)} pts); Growth trajectory: "${growthType}" (+${growthBonus} pts momentum bonus). Total raw = ${(0.75 * svi + growthBonus).toFixed(1)}.`;

  return { score, reason, evidence, isFallback };
}

export function calculateTrendRelevance(
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): number {
  return calculateTrendRelevanceDetails(trend, overrides).score;
}

/**
 * Factor 4: Content Gap (Weight: 15%)
 * Follows deterministic formula:
 * - If D_last <= 7 days: S_gap = 30 (fatigue penalty)
 * - If 7 < D_last <= 14 days: S_gap = 55
 * - If D_last > 14 days OR never posted:
 *   S_gap = min(100, max(0, round(0.7 * Comp + 25)))
 *
 * NOTE: Does NOT assume Low competition if unmeasured.
 * If competition is not provided, uses explicit neutral fallback (Medium = 70)
 * and labels missing data transparently.
 */
export function calculateContentGapDetails(
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): { score: number; reason: string; evidence: string; isFallback: boolean } {
  const trendTokens = tokenize(trend.topic);

  // 1. Topic recency (days since creator last covered the topic)
  let minDaysAgo: number | undefined = undefined;

  if (overrides?.daysSinceLastCovered !== undefined) {
    minDaysAgo = Math.max(0, Math.round(overrides.daysSinceLastCovered));
  } else {
    for (const token of trendTokens) {
      const days = analysis.recentTopicRecency.get(token);
      if (days !== undefined) {
        if (minDaysAgo === undefined || days < minDaysAgo) {
          minDaysAgo = days;
        }
      }
    }
  }

  // 2. Competition level
  const hasOverrideComp = overrides?.competitionLevel !== undefined;
  const hasMeasuredComp = trend.competition_level !== undefined;

  let compLevel: CompetitionLevel = 'Medium';
  let isCompetitionFallback = false;

  if (hasOverrideComp) {
    compLevel = overrides!.competitionLevel!;
  } else if (hasMeasuredComp) {
    compLevel = trend.competition_level!;
  } else {
    compLevel = 'Medium'; // explicit neutral fallback
    isCompetitionFallback = true;
  }

  const compIndex = getCompetitionIndex(compLevel);

  // Check recency fatigue rules
  if (minDaysAgo !== undefined && minDaysAgo <= 7) {
    const score = 30;
    const reason = `High topic fatigue: covered ${minDaysAgo} day${minDaysAgo === 1 ? '' : 's'} ago; audience saturation penalty applied.`;
    const evidence = `Topic recency: covered ${minDaysAgo} day${minDaysAgo === 1 ? '' : 's'} ago (≤ 7 days fatigue threshold -> fixed score 30/100). ${hasOverrideComp ? `Simulation competition: ${compLevel}.` : hasMeasuredComp ? `Measured competition: ${compLevel}.` : 'Market competition: Data unavailable in snapshot.'}`;
    return { score, reason, evidence, isFallback: false };
  }

  if (minDaysAgo !== undefined && minDaysAgo <= 14) {
    const score = 55;
    const reason = `Moderate topic recency: covered ${minDaysAgo} days ago in recent posts.`;
    const evidence = `Topic recency: covered ${minDaysAgo} days ago (8–14 days repetition threshold -> fixed score 55/100). ${hasOverrideComp ? `Simulation competition: ${compLevel}.` : hasMeasuredComp ? `Measured competition: ${compLevel}.` : 'Market competition: Data unavailable in snapshot.'}`;
    return { score, reason, evidence, isFallback: false };
  }

  // D_last > 14 days or never posted
  const rawScore = 0.7 * compIndex + 25;
  const score = clamp(Math.round(rawScore), 0, 100);

  const recencyLabel = minDaysAgo !== undefined ? `${minDaysAgo} days ago (>14d)` : 'Unposted in analyzed recent posts';

  if (isCompetitionFallback) {
    const reason = `Topic unposted in recent history (>14 days); market competition data unavailable in trend snapshot.`;
    const evidence = `Data unavailable: Market competition not provided in trend snapshot, applied neutral fallback (Medium / 70 index -> ${rawScore.toFixed(1)} pts). Recency: ${recencyLabel}. Formula: 0.7 × 70 + 25 = ${rawScore.toFixed(1)}.`;
    return { score, reason, evidence, isFallback: true };
  }

  const reason = `${compLevel} market competition provides high content gap and whitespace (unposted in 14+ days).`;
  const evidence = `${hasOverrideComp ? 'Simulation input' : 'Measured'}: Competition level "${compLevel}" (index: ${compIndex}); Recency: ${recencyLabel}. Formula: 0.7 × ${compIndex} + 25 = ${rawScore.toFixed(1)}.`;
  return { score, reason, evidence, isFallback: false };
}

export function calculateContentGap(
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): number {
  return calculateContentGapDetails(analysis, trend, overrides).score;
}

/**
 * Factor 5: Audience Relevance / Audience Fit (Weight: 15%)
 * S_audience = min(100, max(0, round(60 * A_match + 40 * T_match)))
 * Fallback: If demographics missing, return 70.
 */
export function calculateAudienceFitDetails(
  creator: NormalizedCreatorProfile,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): { score: number; reason: string; evidence: string; isFallback: boolean } {
  if (overrides?.audienceFitScore !== undefined) {
    const score = clamp(Math.round(overrides.audienceFitScore), 0, 100);
    return {
      score,
      reason: `Simulated audience relevance adjusted to ${score}/100 in Decision Engine Playground.`,
      evidence: `Playground simulation input: Audience relevance overridden to ${score}/100.`,
      isFallback: false,
    };
  }

  if (!creator.demographics || (!creator.demographics.topAge && !creator.demographics.peakActiveTime)) {
    return {
      score: 70,
      reason: `Creator demographic metrics unavailable; neutral audience baseline applied.`,
      evidence: `Data unavailable: Demographics data missing from creator profile. Explicit neutral fallback: 70/100.`,
      isFallback: true,
    };
  }

  const audienceText = (trend.audience_interest || '') + ' ' + (trend.region || '');
  const audienceTokens = tokenize(audienceText);

  // Demographics match: check if audience interest mentions desk, workers, fat loss, busy, professionals
  const targetTokens = ['desk', 'workers', 'busy', 'fat', 'loss', 'mobility', 'professionals', 'nutrition', 'fitness'];
  const matchingTargets: string[] = [];
  for (const at of audienceTokens) {
    if (targetTokens.includes(at) && !matchingTargets.includes(at)) {
      matchingTargets.push(at);
    }
  }

  const aMatch = clamp(0.5 + matchingTargets.length * 0.15, 0.4, 1.0);

  // Timing match: peak search timing overlap
  const peakTimingLower = (trend.peak_timing || '').toLowerCase();
  const creatorPeakLower = (creator.demographics.peakActiveTime || '').toLowerCase();
  const tMatch =
    peakTimingLower.includes('weekday') ||
    peakTimingLower.includes('morning') ||
    creatorPeakLower.includes('6:30')
      ? 0.9
      : 0.7;

  const rawScore = 60 * aMatch + 40 * tMatch;
  const score = clamp(Math.round(rawScore), 0, 100);

  const reason = `Directly addresses core pain points for @${creator.username}'s ${creator.demographics.topAge || 'target'} demographic.`;
  const evidence = `Audience interest keyword matches: ${matchingTargets.length > 0 ? `[${matchingTargets.join(', ')}]` : 'None'} (${matchingTargets.length} matched -> interest factor: ${(aMatch * 100).toFixed(0)}%); Active timing alignment: ${(tMatch * 100).toFixed(0)}% (Peak: "${trend.peak_timing || 'General'}" vs creator peak: "${creator.demographics.peakActiveTime || 'Evening'}"). Formula: 60 × ${aMatch.toFixed(2)} + 40 × ${tMatch.toFixed(2)} = ${rawScore.toFixed(1)}.`;

  return { score, reason, evidence, isFallback: false };
}

export function calculateAudienceFit(
  creator: NormalizedCreatorProfile,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): number {
  return calculateAudienceFitDetails(creator, trend, overrides).score;
}

/**
 * Computes all 5 deterministic pillar scores and the total weighted score.
 * Formula: round(0.25 * Niche + 0.25 * Hist + 0.20 * Trend + 0.15 * Gap + 0.15 * Audience)
 * Rounding is applied ONLY to the final total.
 */
export function calculatePillarScores(
  creator: NormalizedCreatorProfile,
  analysis: CreatorAnalysisResult,
  trend: TrendSignal,
  overrides?: ScoringInputOverrides,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): OpportunityScoreBreakdown {
  const nicheDetails = calculateNicheFitDetails(creator, analysis, trend, overrides);
  const historicalDetails = calculateHistoricalFitDetails(creator, analysis, trend, overrides);
  const trendDetails = calculateTrendRelevanceDetails(trend, overrides);
  const gapDetails = calculateContentGapDetails(analysis, trend, overrides);
  const audienceDetails = calculateAudienceFitDetails(creator, trend, overrides);

  const nicheFit = nicheDetails.score;
  const historicalFit = historicalDetails.score;
  const trendRelevance = trendDetails.score;
  const contentGap = gapDetails.score;
  const audienceFit = audienceDetails.score;

  // Calculate unrounded weighted contributions
  const nicheContribution = Number((nicheFit * weights.nicheFit).toFixed(2));
  const historicalContribution = Number((historicalFit * weights.historicalFit).toFixed(2));
  const trendContribution = Number((trendRelevance * weights.trendRelevance).toFixed(2));
  const gapContribution = Number((contentGap * weights.contentGap).toFixed(2));
  const audienceContribution = Number((audienceFit * weights.audienceFit).toFixed(2));

  // Round ONLY the final total sum
  const weightedSum =
    weights.nicheFit * nicheFit +
    weights.historicalFit * historicalFit +
    weights.trendRelevance * trendRelevance +
    weights.contentGap * contentGap +
    weights.audienceFit * audienceFit;

  const totalScore = clamp(Math.round(weightedSum), 0, 100);

  const explanation: OpportunityExplanation = {
    factors: {
      nicheFit: {
        name: 'Niche Fit',
        score: nicheFit,
        weight: weights.nicheFit,
        weightedContribution: nicheContribution,
        reason: nicheDetails.reason,
        evidence: nicheDetails.evidence,
        isFallback: nicheDetails.isFallback,
      },
      historicalFit: {
        name: 'Historical Performance',
        score: historicalFit,
        weight: weights.historicalFit,
        weightedContribution: historicalContribution,
        reason: historicalDetails.reason,
        evidence: historicalDetails.evidence,
        isFallback: historicalDetails.isFallback,
      },
      trendRelevance: {
        name: 'Trend Momentum',
        score: trendRelevance,
        weight: weights.trendRelevance,
        weightedContribution: trendContribution,
        reason: trendDetails.reason,
        evidence: trendDetails.evidence,
        isFallback: trendDetails.isFallback,
      },
      contentGap: {
        name: 'Content Gap',
        score: contentGap,
        weight: weights.contentGap,
        weightedContribution: gapContribution,
        reason: gapDetails.reason,
        evidence: gapDetails.evidence,
        isFallback: gapDetails.isFallback,
      },
      audienceFit: {
        name: 'Audience Relevance',
        score: audienceFit,
        weight: weights.audienceFit,
        weightedContribution: audienceContribution,
        reason: audienceDetails.reason,
        evidence: audienceDetails.evidence,
        isFallback: audienceDetails.isFallback,
      },
    },
    formula: `Total (${totalScore}) = (Niche ${nicheFit} × ${weights.nicheFit}) + (Hist ${historicalFit} × ${weights.historicalFit}) + (Trend ${trendRelevance} × ${weights.trendRelevance}) + (Gap ${contentGap} × ${weights.contentGap}) + (Aud ${audienceFit} × ${weights.audienceFit})`,
    totalScore,
  };

  return {
    nicheFit,
    historicalFit,
    trendRelevance,
    contentGap,
    audienceFit,
    totalScore,
    explanation,
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
  if (scores.explanation) {
    return {
      nicheFit: scores.explanation.factors.nicheFit.reason,
      historicalContentFit: scores.explanation.factors.historicalFit.reason,
      trendRelevance: scores.explanation.factors.trendRelevance.reason,
      contentGap: scores.explanation.factors.contentGap.reason,
      audienceRelevance: scores.explanation.factors.audienceFit.reason,
    };
  }

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
  trend: TrendSignal,
  overrides?: ScoringInputOverrides
): ScoreMetrics {
  const viralityPotential = clamp(Math.round(0.6 * scores.trendRelevance + 0.4 * scores.nicheFit), 0, 100);
  const historicalAffinity = clamp(scores.historicalFit, 0, 100);
  const productionEase = 92; // Short-form talking head standard
  const retentionEstimate = clamp(Math.round(0.5 * scores.historicalFit + 0.5 * scores.audienceFit), 0, 100);

  let competitionLevel: CompetitionLevel = 'Medium';
  if (overrides?.competitionLevel) {
    competitionLevel = overrides.competitionLevel;
  } else if (trend.competition_level) {
    competitionLevel = trend.competition_level;
  } else {
    competitionLevel = scores.contentGap >= 85 ? 'Low' : scores.contentGap >= 70 ? 'Medium' : 'High';
  }

  return {
    viralityPotential,
    historicalAffinity,
    productionEase,
    retentionEstimate,
    competitionLevel,
  };
}
