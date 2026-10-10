import { demoAccount } from '../../data/mockData';
import {
  NormalizedCreatorProfile,
  NormalizedPost,
  ContentFormat,
} from '../../types/normalized';
import { InstagramAdapter } from './types';

/**
 * Parses human-readable relative date strings into daysAgo integer.
 * e.g. "3 days ago" -> 3, "1 week ago" -> 7, "2 weeks ago" -> 14
 */
function parseDaysAgo(dateStr: string): number {
  const lower = dateStr.toLowerCase();
  const match = lower.match(/(\d+)\s*(day|week|month|hour)/);
  if (!match) return 30; // fallback if unparsed

  const num = parseInt(match[1], 10);
  const unit = match[2];

  if (unit.startsWith('hour')) return 0;
  if (unit.startsWith('day')) return num;
  if (unit.startsWith('week')) return num * 7;
  if (unit.startsWith('month')) return num * 30;
  return 30;
}

/**
 * Calculates ISO date string from daysAgo offset.
 */
function getIsoDateFromDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/**
 * Normalizes recent posts from the demo dataset.
 */
function normalizeRecentPosts(): NormalizedPost[] {
  return demoAccount.recentPosts.map((post) => {
    const daysAgo = parseDaysAgo(post.date);
    const publishedAt = getIsoDateFromDaysAgo(daysAgo);

    return {
      id: post.id,
      title: post.title,
      caption: post.title,
      format: (post.format === 'Talking Head'
        ? 'Talking Head'
        : post.format === 'Carousel'
        ? 'Carousel'
        : 'Reel') as ContentFormat,
      views: post.views,
      likes: post.likes,
      shares: post.shares,
      saves: post.saves,
      publishedAt,
      daysAgo,
      thumbnailColor: post.thumbnailColor,
      thumbnailIcon: post.thumbnailIcon,
    };
  });
}

/**
 * Computes average save-to-view ratio across recent posts.
 * Guarantees zero-denominator protection.
 */
function computeSaveRate(posts: NormalizedPost[]): number {
  if (!posts || posts.length === 0) return 0.05; // neutral baseline fallback

  let totalViews = 0;
  let totalSaves = 0;

  for (const p of posts) {
    totalViews += p.views || 0;
    totalSaves += p.saves || 0;
  }

  if (totalViews <= 0) return 0.05;
  return parseFloat((totalSaves / totalViews).toFixed(4));
}

/**
 * Converts demo account data into the canonical NormalizedCreatorProfile.
 */
export function getDemoProfile(): NormalizedCreatorProfile {
  const posts = normalizeRecentPosts();
  const calculatedSaveRate = computeSaveRate(posts);

  return {
    id: 'demo-fitnesswithananya',
    isDemo: true,
    username: demoAccount.username,
    handle: demoAccount.handle,
    fullName: demoAccount.fullName,
    bio: demoAccount.bio,
    category: demoAccount.category,
    avatarUrl: demoAccount.avatar,
    followers: demoAccount.followers,
    following: demoAccount.following,
    postsCount: demoAccount.postsCount,
    metricsSummary: {
      avgReelViews: demoAccount.avgReelViews,
      avgEngagementRate: demoAccount.avgEngagementRate,
      topReelViews: demoAccount.topReelViews,
      bestContentFormat: 'Talking Head',
      topPerformingTopic: demoAccount.topPerformingTopic,
      keyContentInsight: demoAccount.keyContentInsight,
      retentionAverageSeconds: demoAccount.retentionAverageSeconds,
      saveRate: calculatedSaveRate,
    },
    contentPillars: demoAccount.pillars.map((p) => ({
      name: p.name,
      avgViews: p.avgViews,
      engagement: p.engagement,
      postsCount: p.postsCount,
      trendAffinity: p.trendAffinity,
    })),
    recentPosts: posts,
    demographics: {
      topAge: demoAccount.demographics.topAge,
      genderSplit: demoAccount.demographics.genderSplit,
      topLocations: demoAccount.demographics.topLocations,
      peakActiveTime: demoAccount.demographics.peakActiveTime,
    },
  };
}

export class DemoInstagramAdapter implements InstagramAdapter {
  async getProfile(): Promise<NormalizedCreatorProfile> {
    return getDemoProfile();
  }
}
