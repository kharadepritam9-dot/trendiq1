import { GoogleGenAI } from '@google/genai';
import { getGeminiClient } from './geminiClient';
import { ContentAngle, GeneratedContent } from '../../types';

export const ALLOWED_ANGLES: readonly ContentAngle[] = [
  'educational',
  'punchy',
  'storytelling',
  'conversational',
] as const;

export interface PreviousContentVersion {
  hook?: {
    primary?: string;
    visualHook?: string;
    textOverlay?: string;
  };
  angle?: ContentAngle;
  caption?: string;
  version?: number;
}

export interface GenerateContentRequest {
  opportunityId: string;
  title: string;
  topic?: string;
  category?: string;
  targetAudience?: string;
  selectedAngle: ContentAngle;
  previousVersions?: PreviousContentVersion[];
}

export type GenerateContentServiceResult =
  | {
      success: true;
      source: 'gemini';
      opportunityId: string;
      angle: ContentAngle;
      version: number;
      content: GeneratedContent;
    }
  | {
      success: false;
      status: number;
      error: string;
      message: string;
    };

/**
 * Validate incoming generation request payload.
 */
export function validateGenerateRequest(
  body: unknown
):
  | { valid: true; data: GenerateContentRequest }
  | { valid: false; status: number; error: string; message: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'Request body must be a JSON object.',
    };
  }

  const b = body as Record<string, unknown>;

  // opportunityId validation
  const oppIdRaw = b.opportunityId ?? b.id;
  if (typeof oppIdRaw !== 'string' || oppIdRaw.trim().length === 0) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'opportunityId is required and must be a non-empty string.',
    };
  }
  if (oppIdRaw.length > 100) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'opportunityId exceeds maximum length of 100 characters.',
    };
  }
  const opportunityId = oppIdRaw.trim();

  // title / topic validation
  const titleRaw = b.title ?? b.topic;
  if (typeof titleRaw !== 'string' || titleRaw.trim().length === 0) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'title is required and must be a non-empty string.',
    };
  }
  if (titleRaw.length > 300) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: 'title exceeds maximum length of 300 characters.',
    };
  }
  const title = titleRaw.trim();

  // category validation
  let category = 'Fitness & Health';
  if (b.category !== undefined && b.category !== null) {
    if (typeof b.category !== 'string') {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'category must be a string.',
      };
    }
    if (b.category.length > 100) {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'category exceeds maximum length of 100 characters.',
      };
    }
    if (b.category.trim().length > 0) {
      category = b.category.trim();
    }
  }

  // targetAudience validation
  let targetAudience = 'Desk workers and busy professionals looking for fat loss and mobility';
  if (b.targetAudience !== undefined && b.targetAudience !== null) {
    if (typeof b.targetAudience !== 'string') {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'targetAudience must be a string.',
      };
    }
    if (b.targetAudience.length > 500) {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'targetAudience exceeds maximum length of 500 characters.',
      };
    }
    if (b.targetAudience.trim().length > 0) {
      targetAudience = b.targetAudience.trim();
    }
  }

  // selectedAngle validation
  const angleRaw = (b.selectedAngle ?? b.angle) as string | undefined;
  if (!angleRaw || !ALLOWED_ANGLES.includes(angleRaw as ContentAngle)) {
    return {
      valid: false,
      status: 400,
      error: 'INVALID_REQUEST',
      message: `selectedAngle must be one of: ${ALLOWED_ANGLES.join(', ')}.`,
    };
  }
  const selectedAngle = angleRaw as ContentAngle;

  // previousVersions validation
  let previousVersions: PreviousContentVersion[] | undefined = undefined;
  if (b.previousVersions !== undefined && b.previousVersions !== null) {
    if (!Array.isArray(b.previousVersions)) {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'previousVersions must be an array.',
      };
    }
    if (b.previousVersions.length > 20) {
      return {
        valid: false,
        status: 400,
        error: 'INVALID_REQUEST',
        message: 'previousVersions cannot exceed 20 items.',
      };
    }
    previousVersions = b.previousVersions as PreviousContentVersion[];
  }

  return {
    valid: true,
    data: {
      opportunityId,
      title,
      category,
      targetAudience,
      selectedAngle,
      previousVersions,
    },
  };
}

/**
 * Validate that the model-generated output strictly conforms to GeneratedContent.
 */
export function validateGeneratedContentSchema(
  raw: unknown,
  angle: ContentAngle,
  version: number = 1
): { valid: true; data: GeneratedContent } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Generated content is not a valid object.' };
  }

  const obj = raw as Record<string, unknown>;

  // Validate Hook
  if (!obj.hook || typeof obj.hook !== 'object' || Array.isArray(obj.hook)) {
    return { valid: false, error: 'Missing or invalid "hook" object.' };
  }
  const hook = obj.hook as Record<string, unknown>;
  if (typeof hook.primary !== 'string' || hook.primary.trim().length < 8) {
    return { valid: false, error: 'Invalid "hook.primary" (must be at least 8 characters).' };
  }
  if (typeof hook.visualHook !== 'string' || hook.visualHook.trim().length < 5) {
    return { valid: false, error: 'Invalid "hook.visualHook" (must be at least 5 characters).' };
  }
  if (typeof hook.textOverlay !== 'string' || hook.textOverlay.trim().length < 2) {
    return { valid: false, error: 'Invalid "hook.textOverlay" (must be at least 2 characters).' };
  }
  if (!Array.isArray(hook.alternativeHooks) || hook.alternativeHooks.length < 2) {
    return { valid: false, error: '"hook.alternativeHooks" must contain at least 2 alternatives.' };
  }
  const alternativeHooks = hook.alternativeHooks
    .filter((h): h is string => typeof h === 'string' && h.trim().length > 0)
    .map((h) => h.trim());
  if (alternativeHooks.length < 2) {
    return { valid: false, error: '"hook.alternativeHooks" contains invalid or empty items.' };
  }

  // Validate Script
  if (!obj.script || typeof obj.script !== 'object' || Array.isArray(obj.script)) {
    return { valid: false, error: 'Missing or invalid "script" object.' };
  }
  const script = obj.script as Record<string, unknown>;
  if (typeof script.estimatedDuration !== 'string' || script.estimatedDuration.trim().length === 0) {
    return { valid: false, error: 'Invalid "script.estimatedDuration".' };
  }
  if (typeof script.audioVibe !== 'string' || script.audioVibe.trim().length === 0) {
    return { valid: false, error: 'Invalid "script.audioVibe".' };
  }
  if (!Array.isArray(script.sections) || script.sections.length < 3) {
    return { valid: false, error: '"script.sections" must have at least 3 script sections.' };
  }

  const sections = [];
  for (let i = 0; i < script.sections.length; i++) {
    const sec = script.sections[i];
    if (!sec || typeof sec !== 'object' || Array.isArray(sec)) {
      return { valid: false, error: `Invalid script section at index ${i}.` };
    }
    const s = sec as Record<string, unknown>;
    if (typeof s.timestamp !== 'string' || s.timestamp.trim().length === 0) {
      return { valid: false, error: `Script section ${i} missing valid "timestamp".` };
    }
    if (typeof s.scene !== 'string' || s.scene.trim().length === 0) {
      return { valid: false, error: `Script section ${i} missing valid "scene".` };
    }
    if (typeof s.visualAction !== 'string' || s.visualAction.trim().length === 0) {
      return { valid: false, error: `Script section ${i} missing valid "visualAction".` };
    }
    if (typeof s.spokenAudio !== 'string' || s.spokenAudio.trim().length === 0) {
      return { valid: false, error: `Script section ${i} missing valid "spokenAudio".` };
    }
    if (typeof s.onScreenText !== 'string' || s.onScreenText.trim().length === 0) {
      return { valid: false, error: `Script section ${i} missing valid "onScreenText".` };
    }
    sections.push({
      timestamp: s.timestamp.trim(),
      scene: s.scene.trim(),
      visualAction: s.visualAction.trim(),
      spokenAudio: s.spokenAudio.trim(),
      onScreenText: s.onScreenText.trim(),
    });
  }

  // Validate Caption
  if (typeof obj.caption !== 'string' || obj.caption.trim().length < 20) {
    return { valid: false, error: 'Invalid "caption" (must be at least 20 characters).' };
  }

  // Validate CTA
  if (!obj.cta || typeof obj.cta !== 'object' || Array.isArray(obj.cta)) {
    return { valid: false, error: 'Missing or invalid "cta" object.' };
  }
  const cta = obj.cta as Record<string, unknown>;
  if (typeof cta.action !== 'string' || cta.action.trim().length === 0) {
    return { valid: false, error: 'Invalid "cta.action".' };
  }
  if (typeof cta.commentKeyword !== 'string' || cta.commentKeyword.trim().length === 0) {
    return { valid: false, error: 'Invalid "cta.commentKeyword".' };
  }
  if (typeof cta.pinnedCommentPrompt !== 'string' || cta.pinnedCommentPrompt.trim().length === 0) {
    return { valid: false, error: 'Invalid "cta.pinnedCommentPrompt".' };
  }

  // Validate Hashtags
  if (!Array.isArray(obj.hashtags) || obj.hashtags.length < 3) {
    return { valid: false, error: '"hashtags" must have at least 3 hashtags.' };
  }
  const hashtags = obj.hashtags
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => (t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`));
  if (hashtags.length < 3) {
    return { valid: false, error: '"hashtags" contains invalid or empty items.' };
  }

  // Validate Creator Tips
  if (!Array.isArray(obj.creatorTips) || obj.creatorTips.length < 2) {
    return { valid: false, error: '"creatorTips" must contain at least 2 actionable tips.' };
  }
  const creatorTips = obj.creatorTips
    .filter((tip): tip is string => typeof tip === 'string' && tip.trim().length > 0)
    .map((tip) => tip.trim());
  if (creatorTips.length < 2) {
    return { valid: false, error: '"creatorTips" contains invalid or empty items.' };
  }

  return {
    valid: true,
    data: {
      hook: {
        primary: (hook.primary as string).trim(),
        visualHook: (hook.visualHook as string).trim(),
        textOverlay: (hook.textOverlay as string).trim(),
        alternativeHooks,
      },
      script: {
        estimatedDuration: (script.estimatedDuration as string).trim(),
        audioVibe: (script.audioVibe as string).trim(),
        sections,
      },
      caption: (obj.caption as string).trim(),
      cta: {
        action: (cta.action as string).trim(),
        commentKeyword: (cta.commentKeyword as string).trim().toUpperCase(),
        pinnedCommentPrompt: (cta.pinnedCommentPrompt as string).trim(),
      },
      hashtags,
      creatorTips,
      angle,
      version,
      isAiGenerated: true,
    },
  };
}

/**
 * Builds the prompt strictly grounded in the creator profile, topic, selected creative angle,
 * and previous versions if regenerating on the same topic.
 */
export function buildGenerationPrompt(req: GenerateContentRequest): string {
  const angleGuidance: Record<ContentAngle, string> = {
    educational: `CREATIVE ANGLE: EDUCATIONAL & TACTICAL BREAKDOWN
- Emphasize scientific logic, biomechanics, concrete numbers (grams of protein, degrees of angle, rep cadences, timings), and precise anatomical or nutritional mechanics.
- Address why the standard advice fails desk workers and give an actionable, step-by-step fix.
- Visual framing: Instructive demonstrations with clear on-screen visual callouts.`,

    punchy: `CREATIVE ANGLE: HIGH-ENERGY & PUNCHY
- Fast-paced pattern interrupt in the first 0.5 seconds.
- High curiosity gap with short, sharp, rhythmic delivery (zero filler words or slow intros).
- Visual framing: Rapid cutaways every 2-3 seconds, intense eye contact, bold and direct contrast.`,

    storytelling: `CREATIVE ANGLE: RELATABLE NARRATIVE & TRANSFORMATION ARC
- Open in media res with an authentic, relatable moment of desk-worker struggle (e.g. 3 PM posture fatigue, chaotic meal prep).
- Follow a tight narrative arc: the struggle, the simple pivot/discovery, and the tangible payoff.
- Visual framing: Empathetic, documentary-style b-roll and warm, personal reflection.`,

    conversational: `CREATIVE ANGLE: CANDID & CONVERSATIONAL COFFEE-CHAT
- Direct-to-camera peer-to-peer connection as if FaceTiming a client or friend between work meetings.
- Warm, authentic conversational bridges ("Real talk...", "Can we be honest about...").
- Visual framing: Natural, handheld or desk-mounted framing with authentic expressions and friendly pacing.`,
  };

  let regenerationDirectives = '';
  if (req.previousVersions && req.previousVersions.length > 0) {
    const prevHooks = req.previousVersions
      .map((v, i) => `  - Version ${i + 1} (${v.angle || 'prior'}): Hook was "${v.hook?.primary || 'N/A'}"`)
      .join('\n');

    regenerationDirectives = `
SAME-TOPIC REGENERATION MANDATE:
Previous generated hooks for this exact topic:
${prevHooks}

RULES FOR THIS REGENERATION:
1. Maintain the exact same core topic ("${req.title}") and intent.
2. DO NOT repeat, rephrase closely, or borrow words from the previous hooks listed above.
3. Deliver a fresh hook structure, new visual pattern interrupt, and distinct script progression matching the '${req.selectedAngle}' angle.
4. Ensure this version feels like a unique, distinct creative angle for the creator's content library.
`;
  }

  return `You are the lead content strategist for Instagram creator @FitnessWithAnanya (Ananya Verma, 18.4K followers, desk worker fitness & mobility coach).
Your task is to generate ready-to-film Instagram Reel content for this validated content opportunity:

OPPORTUNITY CONTEXT:
- Opportunity Title / Topic: "${req.title}"
- Category: "${req.category || 'Fitness & Health'}"
- Target Audience: "${req.targetAudience}"

${angleGuidance[req.selectedAngle]}
${regenerationDirectives}
CRITICAL SAFETY & REASONING CONSTRAINTS:
1. DO NOT calculate, alter, or reference any Opportunity Score.
2. DO NOT make unsubstantiated claims of guaranteed virality, follower counts, or medical cures. Ground advice in realistic habit changes.
3. Return strictly valid JSON matching the exact schema below. No markdown formatting, backticks, or preamble.

JSON SCHEMA REQUIREMENT:
{
  "hook": {
    "primary": "The main verbal spoken hook for first 2 seconds (minimum 10 chars)",
    "visualHook": "Exact visual pattern interrupt on screen",
    "textOverlay": "Punchy on-screen text overlay with emojis",
    "alternativeHooks": [
      "Alternative hook option 1",
      "Alternative hook option 2",
      "Alternative hook option 3"
    ]
  },
  "script": {
    "estimatedDuration": "30-45 seconds",
    "audioVibe": "Audio style recommendation and sound cues",
    "sections": [
      {
        "timestamp": "00:00 - 00:03",
        "scene": "Hook",
        "visualAction": "Specific creator physical action and framing",
        "spokenAudio": "Exact spoken words",
        "onScreenText": "On-screen text callout"
      },
      {
        "timestamp": "00:04 - 00:15",
        "scene": "The Desk-Worker Problem",
        "visualAction": "Visual demonstration of the struggle or common mistake",
        "spokenAudio": "Exact spoken words breaking down why typical advice fails",
        "onScreenText": "Key takeaway headline"
      },
      {
        "timestamp": "00:16 - 00:30",
        "scene": "Actionable Protocol",
        "visualAction": "Clear step-by-step execution",
        "spokenAudio": "Clear, tactical instructions",
        "onScreenText": "Step instructions"
      },
      {
        "timestamp": "00:31 - 00:40",
        "scene": "Payoff & CTA",
        "visualAction": "Final outcome demonstration and cue to action",
        "spokenAudio": "Closing payoff and high-conversion call to action",
        "onScreenText": "Comment trigger prompt"
      }
    ]
  },
  "caption": "Full ready-to-post Instagram caption with hook opening, actionable takeaways, and engagement prompt",
  "cta": {
    "action": "Specific engagement action (e.g., Comment for the PDF guide)",
    "commentKeyword": "ONE_WORD_KEYWORD",
    "pinnedCommentPrompt": "Exact copy for the creator's pinned comment"
  },
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "creatorTips": [
    "Production tip 1",
    "Retention tip 2",
    "Algorithm tip 3"
  ]
}`;
}

/**
 * Execute content generation with Gemini model.
 */
export async function generateContentWithGemini(
  body: unknown,
  options?: { client?: GoogleGenAI | null; model?: string }
): Promise<GenerateContentServiceResult> {
  // 1. Validate request
  const validation = validateGenerateRequest(body);
  if (validation.valid === false) {
    return {
      success: false,
      status: validation.status,
      error: validation.error,
      message: validation.message,
    };
  }

  const req = validation.data;

  // 2. Obtain Gemini client
  const ai = options?.client !== undefined ? options.client : getGeminiClient();
  if (!ai) {
    return {
      success: false,
      status: 503,
      error: 'GEMINI_API_KEY_MISSING',
      message: 'Gemini API key is not configured on the server.',
    };
  }

  // 3. Build grounded prompt
  const prompt = buildGenerationPrompt(req);
  const modelName = options?.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    if (!responseText.trim()) {
      return {
        success: false,
        status: 502,
        error: 'INVALID_AI_RESPONSE',
        message: 'AI model returned an empty response.',
      };
    }

    let parsedJson: unknown;
    try {
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      parsedJson = JSON.parse(cleanJson);
    } catch {
      return {
        success: false,
        status: 502,
        error: 'INVALID_AI_RESPONSE',
        message: 'AI model output could not be parsed as JSON.',
      };
    }

    // 4. Strict Schema Validation
    const nextVersion = (req.previousVersions?.length || 0) + 1;
    const schemaValidation = validateGeneratedContentSchema(parsedJson, req.selectedAngle, nextVersion);
    if (schemaValidation.valid === false) {
      return {
        success: false,
        status: 502,
        error: 'INVALID_AI_RESPONSE',
        message: `AI model output does not conform to required schema: ${schemaValidation.error}`,
      };
    }

    return {
      success: true,
      source: 'gemini',
      opportunityId: req.opportunityId,
      angle: req.selectedAngle,
      version: nextVersion,
      content: schemaValidation.data,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    // Detect quota / rate limit failures
    if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        status: 429,
        error: 'QUOTA_EXHAUSTED',
        message: 'Gemini API quota exceeded. Please try again later.',
      };
    }

    // Model not found or configuration issue
    if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
      return {
        success: false,
        status: 502,
        error: 'MODEL_NOT_FOUND',
        message: 'The requested AI model is unavailable or not found.',
      };
    }

    // Safe sanitized error for any other API failure
    return {
      success: false,
      status: 502,
      error: 'MODEL_REQUEST_FAILED',
      message: 'Failed to communicate with the AI model. Please try again.',
    };
  }
}
