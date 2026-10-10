import type { ContentAngle, OpportunityScoreBreakdown } from './types/normalized';
export * from './types/normalized';

export interface InstagramAccount {
  username: string;
  fullName: string;
  handle: string;
  bio: string;
  category: string;
  avatar: string;
  followers: number;
  following: number;
  postsCount: number;
  avgReelViews: number;
  avgEngagementRate: number;
  topReelViews: number;
  bestContentFormat: string;
  topPerformingTopic: string;
  keyContentInsight: string;
  retentionAverageSeconds: number;
  demographics: {
    topAge: string;
    genderSplit: string;
    topLocations: string[];
    peakActiveTime: string;
  };
  pillars: Array<{
    name: string;
    avgViews: number;
    engagement: number;
    postsCount: number;
    trendAffinity: 'High' | 'Very High' | 'Moderate';
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    format: 'Reel' | 'Carousel' | 'Talking Head';
    views: number;
    likes: number;
    shares: number;
    saves: number;
    date: string;
    thumbnailColor: string;
    thumbnailIcon: string;
  }>;
}

export interface TrendSignal {
  id: string;
  topic: string;
  category: string;
  trend_score: number;
  growth_status: string;
  growth_type: 'breakout' | 'rising' | 'sustained' | 'steady';
  region: string;
  source: string;
  snapshot_date: string;
  search_volume_index: number;
  peak_timing: string;
  audience_interest: string;
  top_queries: string[];
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
  competitionLevel: 'Low' | 'Medium' | 'High';
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
    sections: Array<{
      timestamp: string;
      scene: string;
      visualAction: string;
      spokenAudio: string;
      onScreenText: string;
    }>;
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
}

export type ScreenState = 
  | 'landing'
  | 'analyze'
  | 'loading'
  | 'dashboard'
  | 'trends'
  | 'opportunities'
  | 'opportunity_detail';
