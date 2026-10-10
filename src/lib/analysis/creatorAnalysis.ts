import {
  NormalizedCreatorProfile,
  ContentFormat,
} from '../../types/normalized';

export interface AnalyzedPillarMetric {
  name: string;
  avgViews: number;
  postsCount: number;
  engagement: number;
  velocityRatio: number; // pillar views / baseline views
  trendAffinityWeight: number; // 0.2 to 1.0
}

export interface FormatPerformance {
  format: ContentFormat;
  avgViews: number;
  postCount: number;
  avgShares: number;
  multiplier: number; // relative to baseline
}

export interface CreatorAnalysisResult {
  creatorId: string;
  username: string;
  baselineAvgViews: number;
  baselineEngagementRate: number;
  baselineSaveRate: number;
  pillarMetrics: AnalyzedPillarMetric[];
  formatPerformance: FormatPerformance[];
  bestFormat: ContentFormat;
  recentTopicRecency: Map<string, number>; // keyword -> minimum daysAgo
  nicheKeywords: string[];
  demographicsTags: string[];
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'about', 'this', 'that', 'from', 'your',
  'you', 'all', 'day', 'how', 'what', 'when', 'why', 'who', 'without',
  'under', 'over', 'into', 'most', 'some', 'more', 'less', 'than',
]);

/**
 * Extracts normalized distinct keywords from text tokens.
 */
function extractKeywords(texts: string[]): string[] {
  const words = new Set<string>();

  for (const text of texts) {
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    for (const t of tokens) {
      words.add(t);
    }
  }

  return Array.from(words);
}

/**
 * Maps trend affinity string to numeric weight.
 */
function getAffinityWeight(affinity: string): number {
  switch (affinity) {
    case 'Very High':
      return 1.0;
    case 'High':
      return 0.8;
    case 'Moderate':
      return 0.5;
    case 'Low':
    default:
      return 0.2;
  }
}

/**
 * Ingests a NormalizedCreatorProfile and performs baseline creator analysis.
 * Features strict zero-denominator safeguards and missing-metric handling.
 */
export function analyzeCreatorProfile(
  profile: NormalizedCreatorProfile
): CreatorAnalysisResult {
  // 1. Calculate baseline average views with zero-denominator safeguards
  let baselineAvgViews = profile.metricsSummary?.avgReelViews || 0;

  if (baselineAvgViews <= 0 && profile.recentPosts?.length > 0) {
    const totalViews = profile.recentPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    baselineAvgViews = Math.round(totalViews / profile.recentPosts.length);
  }

  // Safe fallback if account has zero views anywhere
  if (baselineAvgViews <= 0) {
    baselineAvgViews = 10000;
  }

  const baselineEngagementRate = profile.metricsSummary?.avgEngagementRate || 4.0;
  const baselineSaveRate = profile.metricsSummary?.saveRate || 0.05;

  // 2. Compute Content Pillar Metrics & Velocity Ratios
  const pillarMetrics: AnalyzedPillarMetric[] = (profile.contentPillars || []).map((pillar) => {
    const pViews = pillar.avgViews || baselineAvgViews;
    // Safe velocity ratio with zero-division safeguard
    const rawVelocity = baselineAvgViews > 0 ? pViews / baselineAvgViews : 1.0;
    const velocityRatio = parseFloat(Math.max(0.5, Math.min(2.0, rawVelocity)).toFixed(2));

    return {
      name: pillar.name,
      avgViews: pViews,
      postsCount: pillar.postsCount || 0,
      engagement: pillar.engagement || baselineEngagementRate,
      velocityRatio,
      trendAffinityWeight: getAffinityWeight(pillar.trendAffinity),
    };
  });

  // 3. Compute Format Performance
  const formatBuckets: Record<ContentFormat, { totalViews: number; totalShares: number; count: number }> = {
    'Reel': { totalViews: 0, totalShares: 0, count: 0 },
    'Carousel': { totalViews: 0, totalShares: 0, count: 0 },
    'Talking Head': { totalViews: 0, totalShares: 0, count: 0 },
  };

  for (const post of profile.recentPosts || []) {
    const f = post.format in formatBuckets ? post.format : 'Reel';
    formatBuckets[f].totalViews += post.views || 0;
    formatBuckets[f].totalShares += post.shares || 0;
    formatBuckets[f].count += 1;
  }

  const formatPerformance: FormatPerformance[] = (
    Object.keys(formatBuckets) as ContentFormat[]
  ).map((f) => {
    const b = formatBuckets[f];
    const avgViews = b.count > 0 ? Math.round(b.totalViews / b.count) : baselineAvgViews;
    const avgShares = b.count > 0 ? Math.round(b.totalShares / b.count) : 0;
    const rawMul = baselineAvgViews > 0 ? avgViews / baselineAvgViews : 1.0;
    const multiplier = parseFloat(Math.max(0.7, Math.min(1.5, rawMul)).toFixed(2));

    return {
      format: f,
      avgViews,
      postCount: b.count,
      avgShares,
      multiplier,
    };
  });

  // Find best performing format
  let bestFormat: ContentFormat = 'Talking Head';
  let highestViews = 0;
  for (const fp of formatPerformance) {
    if (fp.postCount > 0 && fp.avgViews > highestViews) {
      highestViews = fp.avgViews;
      bestFormat = fp.format;
    }
  }

  // 4. Build Recent Topic Recency Map (for Content Gap calculations)
  const recentTopicRecency = new Map<string, number>();

  for (const post of profile.recentPosts || []) {
    const postKeywords = extractKeywords([post.title, post.caption || '']);
    const daysAgo = typeof post.daysAgo === 'number' ? post.daysAgo : 30;

    for (const kw of postKeywords) {
      const existing = recentTopicRecency.get(kw);
      if (existing === undefined || daysAgo < existing) {
        recentTopicRecency.set(kw, daysAgo);
      }
    }
  }

  // 5. Extract Niche Keywords from bio, category, and pillar names
  const bioAndPillars = [
    profile.bio || '',
    profile.category || '',
    ...pillarMetrics.map((p) => p.name),
  ];
  const nicheKeywords = extractKeywords(bioAndPillars);

  // 6. Demographics Tags
  const demographicsTags = [
    ...(profile.demographics?.topLocations || []),
    profile.demographics?.topAge || '',
    profile.demographics?.peakActiveTime || '',
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  return {
    creatorId: profile.id,
    username: profile.username,
    baselineAvgViews,
    baselineEngagementRate,
    baselineSaveRate,
    pillarMetrics,
    formatPerformance,
    bestFormat,
    recentTopicRecency,
    nicheKeywords,
    demographicsTags,
  };
}
