import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/ai/geminiClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are TrendIQ's AI Content Intelligence Engine.
Analyze this user-submitted topic for creator @FitnessWithAnanya (Ananya Verma, 18.4K followers, desk worker fitness & mobility coach):

Topic: "${topic}"

Break down "Why this idea?" into the 5 TrendIQ pillars:
1. Niche Fit
2. Historical Content Fit
3. Trend Relevance
4. Content Gap
5. Audience Relevance

Also return 4 scoring factors (viralityPotential, historicalAffinity, productionEase, retentionEstimate) and a punchy reel title.

Return strictly JSON:
{
  "title": "Reel Title for Ananya",
  "opportunityScore": 87,
  "shortReason": "Short 1-sentence reason why this is a high-opportunity idea",
  "badge": "Top Opportunity Match",
  "whyBreakdown": {
    "nicheFit": "1 concise sentence...",
    "historicalContentFit": "1 concise sentence...",
    "trendRelevance": "1 concise sentence...",
    "contentGap": "1 concise sentence...",
    "audienceRelevance": "1 concise sentence..."
  },
  "scoreMetrics": {
    "viralityPotential": 88,
    "historicalAffinity": 85,
    "productionEase": 90,
    "retentionEstimate": 86,
    "competitionLevel": "Low"
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({ success: true, opportunity: parsed });
      } catch (err) {
        console.error('Gemini custom topic analysis error in Next.js route:', err);
      }
    }

    // Explicit fallback for demo mode without Gemini API key
    return NextResponse.json({
      success: true,
      source: 'preset_demo',
      opportunity: {
        title: `The Truth About ${topic} for Desk Workers`,
        opportunityScore: 86,
        shortReason: `Strong search affinity for "${topic}" intersecting with your highest-engaged problem-solution format.`,
        badge: 'Top Opportunity Match',
        whyBreakdown: {
          nicheFit: `Connects ${topic} directly to Ananya's desk-worker health focus.`,
          historicalContentFit: `Matches Ananya's top-tier debunk and educational reels.`,
          trendRelevance: `Rising discussion and search interest across Google Trends.`,
          contentGap: `Most existing content is generic; your practical desk routine angle fills the gap.`,
          audienceRelevance: `Solves direct everyday hurdles for busy professionals.`,
        },
        scoreMetrics: {
          viralityPotential: 88,
          historicalAffinity: 86,
          productionEase: 90,
          retentionEstimate: 85,
          competitionLevel: 'Low',
        },
      },
    });
  } catch (err) {
    console.error('Error in /api/analyze-custom-topic route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
