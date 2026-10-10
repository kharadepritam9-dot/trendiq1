import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { generateContentWithGemini } from './src/lib/ai/contentGenerator';
import { getDemoProfile } from './src/lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from './src/lib/analysis/creatorAnalysis';
import { generateRankedOpportunities } from './src/lib/opportunities/rankedPipeline';
import { calculatePillarScores, buildWhyBreakdown, buildScoreMetrics } from './src/lib/scoring/opportunityScorer';
import { TrendSignal, Opportunity } from './src/types/normalized';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini API client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Endpoint: Get Google Trends Snapshot
app.get('/api/trends', (req, res) => {
  try {
    const trendsFilePath = path.join(__dirname, 'trends.json');
    if (fs.existsSync(trendsFilePath)) {
      const data = fs.readFileSync(trendsFilePath, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.status(404).json({ error: 'trends.json not found' });
  } catch (err) {
    console.error('Error reading trends:', err);
    return res.status(500).json({ error: 'Failed to read trends data' });
  }
});

// 2. Endpoint: Get Ranked Opportunities
app.get('/api/opportunities', (req, res) => {
  try {
    const trendsFilePath = path.join(__dirname, 'trends.json');
    if (!fs.existsSync(trendsFilePath)) {
      return res.status(404).json({ error: 'trends.json not found' });
    }
    const data = fs.readFileSync(trendsFilePath, 'utf-8');
    const parsed = JSON.parse(data);
    const trends: TrendSignal[] = parsed.trends || [];

    const profile = getDemoProfile();
    const analysis = analyzeCreatorProfile(profile);
    const opportunities = generateRankedOpportunities(profile, analysis, trends);

    return res.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (err) {
    console.error('Error generating ranked opportunities in server:', err);
    return res.status(500).json({ error: 'Failed to generate ranked opportunities' });
  }
});

// 3. Endpoint: Generate Content (Hook, Script, Caption, CTA) with Gemini
app.post('/api/generate-content', async (req, res) => {
  try {
    const result = await generateContentWithGemini(req.body);
    if (result.success === false) {
      return res.status(result.status).json({
        success: false,
        error: result.error,
        message: result.message,
      });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_REQUEST',
      message: 'Invalid JSON request payload.',
    });
  }
});

// 4. Endpoint: Analyze Custom Trend or Custom Topic Deterministically
app.post('/api/analyze-custom-topic', async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Valid topic string is required' });
  }

  const trimmedTopic = topic.trim();
  const profile = getDemoProfile();
  const analysis = analyzeCreatorProfile(profile);

  // Deterministic trend signal for user topic
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

  const scores = calculatePillarScores(profile, analysis, customTrend);
  const whyBreakdown = buildWhyBreakdown(profile, analysis, customTrend, scores);
  const scoreMetrics = buildScoreMetrics(scores, customTrend);

  let creativeTitle = `The Desk-Worker Protocol: ${trimmedTopic}`;
  let shortReason = `Evaluated across 5 deterministic factors: Niche (${scores.nicheFit}/100), Historical (${scores.historicalFit}/100), Momentum (${scores.trendRelevance}/100), Gap (${scores.contentGap}/100), Audience (${scores.audienceFit}/100).`;

  if (ai) {
    try {
      const prompt = `You are TrendIQ's creative assistant.
The deterministic scoring engine has evaluated the topic "${trimmedTopic}" for creator @FitnessWithAnanya with a score of ${scores.totalScore}/100.
Generate a punchy Reel title and 1-sentence summary. DO NOT calculate, alter, or output any score numbers.
Return strictly JSON:
{
  "title": "Creative Reel Title",
  "shortReason": "1 concise sentence"
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
      console.warn('Gemini title polish error in server (using deterministic fallback):', err);
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

  return res.json({ success: true, opportunity });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TrendIQ server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
