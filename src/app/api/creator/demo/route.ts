import { NextResponse } from 'next/server';
import { getDemoProfile } from '../../../../lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../../../../lib/analysis/creatorAnalysis';

export async function GET() {
  try {
    const profile = getDemoProfile();
    const analysis = analyzeCreatorProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
      analysis: {
        creatorId: analysis.creatorId,
        username: analysis.username,
        baselineAvgViews: analysis.baselineAvgViews,
        baselineEngagementRate: analysis.baselineEngagementRate,
        baselineSaveRate: analysis.baselineSaveRate,
        bestFormat: analysis.bestFormat,
        pillarMetrics: analysis.pillarMetrics,
        formatPerformance: analysis.formatPerformance,
        nicheKeywords: analysis.nicheKeywords,
        demographicsTags: analysis.demographicsTags,
        recentTopicCount: analysis.recentTopicRecency.size,
      },
    });
  } catch (err) {
    console.error('Error in /api/creator/demo route:', err);
    return NextResponse.json(
      { error: 'Failed to load demo creator profile' },
      { status: 500 }
    );
  }
}
