import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/ai/geminiClient';
import { getDemoProfile } from '../../../lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../../../lib/analysis/creatorAnalysis';
import {
  calculatePillarScores,
  buildWhyBreakdown,
  buildScoreMetrics,
} from '../../../lib/scoring/opportunityScorer';
import { TrendSignal, Opportunity } from '../../../types/normalized';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Valid topic string is required' }, { status: 400 });
    }

    const trimmedTopic = topic.trim();
    const profile = getDemoProfile();
    const analysis = analyzeCreatorProfile(profile);

    // Build deterministic trend signal representation for user-submitted topic
    const customTrend: TrendSignal = {
      id: `custom-${Date.now()}`,
      topic: trimmedTopic,
      category: 'Fitness & Health',
      trend_score: 75,
      growth_status: '+120% Rising',
      growth_type: 'rising',
      region: 'Global',
      source: 'User Evaluated Topic',
      snapshot_date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      search_volume_index: 75,
      peak_timing: 'General Workdays',
      audience_interest: 'Desk workers, fat loss, mobility, fitness',
      top_queries: [trimmedTopic.toLowerCase()],
    };

    // Calculate 100% deterministic scores - NEVER let Gemini determine or alter scores
    const scores = calculatePillarScores(profile, analysis, customTrend);
    const whyBreakdown = buildWhyBreakdown(profile, analysis, customTrend, scores);
    const scoreMetrics = buildScoreMetrics(scores, customTrend);

    let creativeTitle = `The Desk-Worker Protocol: ${trimmedTopic}`;
    let shortReason = `Evaluated across 5 deterministic factors: Niche (${scores.nicheFit}/100), Historical (${scores.historicalFit}/100), Momentum (${scores.trendRelevance}/100), Gap (${scores.contentGap}/100), Audience (${scores.audienceFit}/100).`;

    // Optionally consult Gemini ONLY for creative title polish - never scores
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are TrendIQ's creative assistant.
The deterministic scoring engine has evaluated the topic "${trimmedTopic}" for creator @FitnessWithAnanya (Ananya Verma) with a deterministic Opportunity Score of ${scores.totalScore}/100.

Generate a punchy, hook-driven Reel title and a 1-sentence summary of why this fits Ananya's audience.
DO NOT calculate, mention, or change any score numbers.
Return strictly JSON:
{
  "title": "Creative Reel Title",
  "shortReason": "1 concise sentence grounded in desk worker fitness"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });

        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title) creativeTitle = parsed.title;
        if (parsed.shortReason) shortReason = parsed.shortReason;
      } catch (err) {
        console.warn('Gemini title polish error (using deterministic fallback):', err);
      }
    }

    const opportunity: Opportunity = {
      id: customTrend.id,
      title: creativeTitle,
      opportunityScore: scores.totalScore,
      shortReason,
      badge: scores.totalScore >= 85 ? 'Top Opportunity Match' : 'Evaluated Topic Match',
      trendId: customTrend.id,
      matchedCategory: 'Fitness & Health',
      scoreBreakdown: scores,
      whyBreakdown,
      scoreMetrics,
      explanation: scores.explanation,
      generatedContent: {
        hook: {
          primary: `If you sit at a desk and want to explore ${trimmedTopic}, here is the honest science you need to know.`,
          visualHook: 'Direct eye contact addressing camera with demonstration prop.',
          textOverlay: `${trimmedTopic.toUpperCase()} FOR DESK WORKERS ⚡`,
          alternativeHooks: [
            `The biggest mistake people make with ${trimmedTopic}.`,
            `The 60-second guide to ${trimmedTopic} for desk workers.`,
            `Why this ${trimmedTopic} protocol actually works.`,
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
              spokenAudio: `If you have wondered whether ${trimmedTopic} fits your desk routine, watch this.`,
              onScreenText: `DOES ${trimmedTopic.toUpperCase()} WORK?`,
            },
            {
              timestamp: '00:04 - 00:15',
              scene: 'The Problem',
              visualAction: 'Demonstrating common mistake.',
              spokenAudio: 'Most people overcomplicate this. You do not need extreme routines; here is the practical rule.',
              onScreenText: 'THE REAL RULE',
            },
            {
              timestamp: '00:16 - 00:28',
              scene: 'The Solution',
              visualAction: 'Demonstrating step-by-step protocol.',
              spokenAudio: 'Focus on consistency and timing. Here is the exact checklist to get maximum results.',
              onScreenText: 'STEP BY STEP CHECKLIST',
            },
            {
              timestamp: '00:29 - 00:35',
              scene: 'CTA & Payoff',
              visualAction: 'Closing result and pointing to comments.',
              spokenAudio: 'Save this post and drop your questions below!',
              onScreenText: 'SAVE THIS POST 📌',
            },
          ],
        },
        caption: `Everything you need to know about ${trimmedTopic} if you work a 9-to-5 💻\n\nKey takeaways:\n• Practical execution over perfection\n• Fits seamlessly into busy schedules\n\nSave this for your next routine! 📌`,
        cta: {
          action: 'Comment Keyword Automation',
          commentKeyword: 'GUIDE',
          pinnedCommentPrompt: `Pinned: "Drop any questions on ${trimmedTopic} below! 👇"`,
        },
        hashtags: ['#DeskWorkerFitness', '#Mobility', '#FitnessWithAnanya', '#Wellness'],
        creatorTips: ['Hook viewer in first 2 seconds', 'Keep text overlay visible for 3 seconds'],
      },
    };

    return NextResponse.json({ success: true, opportunity });
  } catch (err) {
    console.error('Error in /api/analyze-custom-topic route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
