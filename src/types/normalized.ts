/**
 * Canonical normalized data types for TrendIQ.
 * Shared by both Demo data and future Meta Instagram Graph API data.
 */

export type ContentFormat = 'Reel' | 'Carousel' | 'Talking Head';

export type GrowthType = 'breakout' | 'rising' | 'sustained' | 'steady';

export type CompetitionLevel = 'Low' | 'Medium' | 'High';

export type ContentAngle =
  | 'educational'
  | 'punchy'
  | 'storytelling'
  | 'conversational';

export interface NormalizedPost {
  id: string;
  title: string;
  caption?: string;
  format: ContentFormat;
  views: number;
  likes: number;
  comments?: number;
  shares: number;
  saves: number;
  publishedAt: string; // ISO-8601 or ISO date
  daysAgo: number;     // Integer days since published
  thumbnailColor?: string;
  thumbnailIcon?: string;
}

export interface NormalizedContentPillar {
  name: string;
  avgViews: number;
  engagement: number;
  postsCount: number;
  trendAffinity: 'Very High' | 'High' | 'Moderate' | 'Low';
}

export interface NormalizedDemographics {
  topAge: string;
  genderSplit: string;
  topLocations: string[];
  peakActiveTime: string;
}

export interface NormalizedMetricsSummary {
  avgReelViews: number;
  avgEngagementRate: number; // Percentage, e.g. 4.8
  topReelViews: number;
  bestContentFormat: ContentFormat;
  topPerformingTopic: string;
  keyContentInsight: string;
  retentionAverageSeconds: number;
  saveRate: number; // Saves / views ratio, e.g. 0.05
}

export interface NormalizedCreatorProfile {
  id: string;
  isDemo: boolean;
  username: string;
  handle: string;
  fullName: string;
  bio: string;
  category: string;
  avatarUrl: string;
  followers: number;
  following: number;
  postsCount: number;
  metricsSummary: NormalizedMetricsSummary;
  contentPillars: NormalizedContentPillar[];
  recentPosts: NormalizedPost[];
  demographics: NormalizedDemographics;
}

export interface TrendSignal {
  id: string;
  topic: string;
  category: string;
  trend_score: number;
  growth_status: string;
  growth_type: GrowthType;
  region: string;
  source: string;
  snapshot_date: string;
  search_volume_index: number;
  peak_timing: string;
  audience_interest: string;
  top_queries: string[];
  competition_level?: CompetitionLevel;
}

export interface FactorExplanation {
  name: string;                 // e.g. "Niche Fit", "Historical Performance", "Trend Momentum", "Content Gap", "Audience Relevance"
  score: number;                // 0-100 factor score
  weight: number;               // e.g. 0.25 (25%)
  weightedContribution: number; // score * weight (e.g. 17.5)
  reason: string;               // concise reason supported by account/trend data
  evidence: string;             // exact evidence / input values used in calculation
  isFallback?: boolean;         // whether missing-data fallback was used
}

export interface OpportunityExplanation {
  factors: {
    nicheFit: FactorExplanation;
    historicalFit: FactorExplanation;
    trendRelevance: FactorExplanation;
    contentGap: FactorExplanation;
    audienceFit: FactorExplanation;
  };
  formula: string;
  totalScore: number;
}

export interface ScoringWeights {
  nicheFit: number;        // 0.25 (25%)
  historicalFit: number;   // 0.25 (25%) - Historical Performance
  trendRelevance: number;  // 0.20 (20%) - Trend Momentum
  contentGap: number;      // 0.15 (15%) - Content Gap
  audienceFit: number;     // 0.15 (15%) - Audience Relevance
}

export interface ScoringInputOverrides {
  searchVolumeIndex?: number;
  growthType?: GrowthType;
  competitionLevel?: CompetitionLevel;
  daysSinceLastCovered?: number;
  nicheMatchScore?: number;
  audienceFitScore?: number;
}

export interface OpportunityScoreBreakdown {
  nicheFit: number;        // 0-100 (Weight: 25%)
  historicalFit: number;   // 0-100 (Weight: 25%) - Historical Performance
  trendRelevance: number;  // 0-100 (Weight: 20%) - Trend Momentum
  contentGap: number;      // 0-100 (Weight: 15%) - Content Gap
  audienceFit: number;     // 0-100 (Weight: 15%) - Audience Relevance
  totalScore: number;      // 0-100 deterministic weighted score
  explanation?: OpportunityExplanation;
}

export interface WhyBreakdown {
  nicheFit: string;
  historicalContentFit: string;
  trendRelevance: string;
  contentGap: string;
  audienceRelevance: string;
}

export interface ScoreMetrics {
  viralityPotential: number; // 0-100
  historicalAffinity: number; // 0-100
  productionEase: number; // 0-100
  retentionEstimate: number; // 0-100
  competitionLevel: CompetitionLevel;
}

export interface ScriptSection {
  timestamp: string;
  scene: string;
  visualAction: string;
  spokenAudio: string;
  onScreenText: string;
}

export interface GeneratedContent {
  hook: {
    primary: string;
    visualHook: string;
    textOverlay: string;
    alternativeHooks: string[];
  };
  script: {
    estimatedDuration: string;
    audioVibe: string;
    sections: ScriptSection[];
  };
  caption: string;
  cta: {
    action: string;
    commentKeyword: string;
    pinnedCommentPrompt: string;
  };
  hashtags: string[];
  creatorTips: string[];
  angle?: ContentAngle;
  version?: number;
  isAiGenerated?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  opportunityScore: number;
  shortReason: string;
  badge: string;
  trendId?: string;
  matchedCategory: string;
  scoreBreakdown?: OpportunityScoreBreakdown;
  whyBreakdown: WhyBreakdown;
  scoreMetrics: ScoreMetrics;
  generatedContent: GeneratedContent;
  selectedAngle?: ContentAngle;
  contentVersions?: GeneratedContent[];
  explanation?: OpportunityExplanation;
  originalScore?: number;
  originalRank?: number;
  currentRank?: number;
  isSimulationModified?: boolean;
}
