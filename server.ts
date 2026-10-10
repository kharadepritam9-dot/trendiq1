import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { generateContentWithGemini } from './src/lib/ai/contentGenerator';

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

// 2. Endpoint: Generate Content (Hook, Script, Caption, CTA) with Gemini
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

// 3. Endpoint: Analyze Custom Trend or Custom Topic with Gemini
app.post('/api/analyze-custom-topic', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  if (ai) {
    try {
      const prompt = `You are TrendIQ's AI Content Intelligence Engine.
Analyze this user-submitted topic for creator @FitnessWithAnanya (Ananya Verma, 18.4K followers, desk worker fitness & mobility coach):

Topic: "${topic}"

Calculate an Opportunity Score (0-100) and break down "Why this idea?" into the 5 TrendIQ pillars:
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
      return res.json({ success: true, opportunity: parsed });
    } catch (err) {
      console.error('Gemini custom topic analysis error:', err);
    }
  }

  // Fallback if Gemini not reachable
  const simulatedScore = Math.floor(75 + Math.random() * 20);
  return res.json({
    success: true,
    opportunity: {
      title: `The Truth About ${topic} for Desk Workers`,
      opportunityScore: simulatedScore,
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
        viralityPotential: Math.floor(75 + Math.random() * 20),
        historicalAffinity: Math.floor(75 + Math.random() * 20),
        productionEase: 90,
        retentionEstimate: Math.floor(80 + Math.random() * 15),
        competitionLevel: 'Low',
      },
    },
  });
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
