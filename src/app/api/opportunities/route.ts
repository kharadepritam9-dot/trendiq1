import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDemoProfile } from '../../../lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../../../lib/analysis/creatorAnalysis';
import { generateRankedOpportunities } from '../../../lib/opportunities/rankedPipeline';
import { TrendSignal } from '../../../types/normalized';

export async function GET() {
  try {
    const trendsFilePath = path.join(process.cwd(), 'trends.json');
    if (!fs.existsSync(trendsFilePath)) {
      return NextResponse.json({ error: 'trends.json not found' }, { status: 404 });
    }

    const rawData = fs.readFileSync(trendsFilePath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    const trends: TrendSignal[] = parsedData.trends || [];

    const profile = getDemoProfile();
    const analysis = analyzeCreatorProfile(profile);
    const opportunities = generateRankedOpportunities(profile, analysis, trends);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (err) {
    console.error('Error generating ranked opportunities:', err);
    return NextResponse.json(
      { error: 'Failed to generate ranked opportunities' },
      { status: 500 }
    );
  }
}
