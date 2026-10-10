import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/ai/geminiClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      trendTopic,
      category,
      targetAudience = 'Desk workers and busy professionals looking for fat loss and mobility',
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are the lead content strategist for Instagram creator @FitnessWithAnanya (Ananya Verma, 18.4K followers, fitness and mobility coach for desk workers).
Your task is to generate ready-to-film Instagram Reel content for this high-scoring content opportunity:

Opportunity Title: "${title}"
Associated Google Trend: "${trendTopic || title}"
Category: "${category || 'Fitness & Nutrition'}"
Target Audience: "${targetAudience}"

Format your response strictly as valid JSON matching this schema:
{
  "hook": {
    "primary": "The main verbal spoken hook for first 2 seconds",
    "visualHook": "Exact visual pattern interrupt on screen",
    "textOverlay": "Punchy text banner with emojis",
    "alternativeHooks": ["Alternative hook 1", "Alternative hook 2", "Alternative hook 3"]
  },
  "script": {
    "estimatedDuration": "35-45 seconds",
    "audioVibe": "Audio style recommendation and sound cues",
    "sections": [
      {
        "timestamp": "00:00 - 00:03",
        "scene": "Hook",
        "visualAction": "Specific creator physical action and camera framing",
        "spokenAudio": "Exact spoken words",
        "onScreenText": "On-screen text title"
      },
      {
        "timestamp": "00:04 - 00:15",
        "scene": "The Pain Point & The Mistake",
        "visualAction": "Visual demonstration of the problem",
        "spokenAudio": "Exact spoken words explaining why standard advice fails",
        "onScreenText": "Key takeaway text"
      },
      {
        "timestamp": "00:16 - 00:30",
        "scene": "The Actionable Solution",
        "visualAction": "Step by step execution",
        "spokenAudio": "Actionable instructions and golden rule to retain watch time",
        "onScreenText": "Step instructions"
      },
      {
        "timestamp": "00:31 - 00:40",
        "scene": "Payoff & CTA",
        "visualAction": "Final result showcase and pointing to CTA",
        "spokenAudio": "Closing payoff and high-conversion call to action",
        "onScreenText": "Call to action prompt"
      }
    ]
  },
  "caption": "Full Instagram caption with hook opening, bullet points, macro/protocol details, and call to action",
  "cta": {
    "action": "Specific engagement action",
    "commentKeyword": "ONE_WORD_KEYWORD",
    "pinnedCommentPrompt": "Text for pinned comment"
  },
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "creatorTips": [
    "Production tip 1",
    "Retention tip 2",
    "Algorithm optimization tip 3"
  ]
}

Ensure the tone is authentic, scientific yet accessible, direct, and zero fluff. Only return JSON, no markdown formatting or backticks if possible.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({ success: true, source: 'gemini', content: parsed });
      } catch (apiErr) {
        console.error('Gemini API call failed in Next.js route:', apiErr);
      }
    }

    // Graceful fallback if Gemini API is unavailable (clearly indicates preset demo mode)
    return NextResponse.json({
      success: true,
      source: 'preset_demo',
      message: 'Generated using TrendIQ Creator Engine (Demo Preset Mode - Gemini API key not configured)',
    });
  } catch (err) {
    console.error('Error in /api/generate-content route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
