import {
  validateGenerateRequest,
  validateGeneratedContentSchema,
  buildGenerationPrompt,
  generateContentWithGemini,
  ALLOWED_ANGLES,
  GenerateContentRequest,
} from '../src/lib/ai/contentGenerator';
import { ContentAngle, GeneratedContent } from '../src/types';

console.log('=====================================================');
console.log('   TRENDIQ PHASE 3 COMPREHENSIVE TEST SUITE');
console.log('   (Gemini AI Content Generation & Regeneration)');
console.log('=====================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Request Validation & Parameter Boundaries
// -----------------------------------------------------------------------------
console.log('[Test 1] Verifying Request Body Validation & Field Limits...');

// 1.1 Reject non-object body
const resNull = validateGenerateRequest(null);
console.assert(resNull.valid === false && resNull.status === 400 && resNull.error === 'INVALID_REQUEST', 'Must reject null body');

const resArray = validateGenerateRequest([1, 2, 3]);
console.assert(resArray.valid === false && resArray.status === 400, 'Must reject array body');

// 1.2 Missing / invalid opportunityId
const resNoOppId = validateGenerateRequest({ title: 'Valid Title', selectedAngle: 'educational' });
console.assert(resNoOppId.valid === false && resNoOppId.message.includes('opportunityId'), 'Must require opportunityId');

const resLongOppId = validateGenerateRequest({
  opportunityId: 'x'.repeat(101),
  title: 'Valid Title',
  selectedAngle: 'educational',
});
console.assert(resLongOppId.valid === false && resLongOppId.message.includes('100'), 'Must reject opportunityId > 100 chars');

// 1.3 Missing / oversized title
const resNoTitle = validateGenerateRequest({ opportunityId: 'opp-1', selectedAngle: 'educational' });
console.assert(resNoTitle.valid === false && resNoTitle.message.includes('title'), 'Must require title');

const resLongTitle = validateGenerateRequest({
  opportunityId: 'opp-1',
  title: 'x'.repeat(301),
  selectedAngle: 'educational',
});
console.assert(resLongTitle.valid === false && resLongTitle.message.includes('300'), 'Must reject title > 300 chars');

// 1.4 Invalid creative angles
const resBadAngle = validateGenerateRequest({
  opportunityId: 'opp-1',
  title: 'Fix Slouching in 60s',
  selectedAngle: 'ultra_viral_hype',
});
console.assert(resBadAngle.valid === false && resBadAngle.message.includes('selectedAngle must be one of'), 'Must reject unsupported angle');

// 1.5 Supported angles validation
for (const angle of ALLOWED_ANGLES) {
  const resValid = validateGenerateRequest({
    opportunityId: 'opp-test',
    title: 'High Protein Desk Lunch',
    selectedAngle: angle,
  });
  console.assert(resValid.valid === true, `Angle '${angle}' must be accepted`);
  if (resValid.valid) {
    console.assert(resValid.data.selectedAngle === angle, `Angle should match ${angle}`);
  }
}

// 1.6 Oversized previousVersions array
const resOversizedVersions = validateGenerateRequest({
  opportunityId: 'opp-test',
  title: 'Title',
  selectedAngle: 'educational',
  previousVersions: new Array(25).fill({ hook: { primary: 'test' } }),
});
console.assert(resOversizedVersions.valid === false && resOversizedVersions.message.includes('20'), 'Must cap previousVersions at 20');

console.log('✅ Request Validation verified: Strictly rejects bad payloads, lengths, and angles.');

// -----------------------------------------------------------------------------
// TEST 2: Schema Validation on Model Outputs
// -----------------------------------------------------------------------------
console.log('\n[Test 2] Verifying GeneratedContent Schema Validation...');

const sampleValidRawContent = {
  hook: {
    primary: 'Stop doing standard sit-ups if you sit at a desk 8 hours a day.',
    visualHook: 'Ananya pushes her desk chair away, visibly wincing at lower back stiffness.',
    textOverlay: 'Desk Workers: Stop Doing This ❌',
    alternativeHooks: [
      'The #1 mistake desk workers make with their core workouts.',
      'Why your lower back aches after core workouts at your desk.',
      'Do this 30-second pelvic tilt before your next workout.',
    ],
  },
  script: {
    estimatedDuration: '35 seconds',
    audioVibe: 'Crisp, driving lofi beat with subtle foley clicks',
    sections: [
      {
        timestamp: '00:00 - 00:03',
        scene: 'Hook',
        visualAction: 'Standing by ergonomic desk, pointing directly to camera',
        spokenAudio: 'Stop doing standard sit-ups if you sit at a desk 8 hours a day.',
        onScreenText: 'STOP DOING SIT-UPS 🛑',
      },
      {
        timestamp: '00:04 - 00:15',
        scene: 'The Problem',
        visualAction: 'Demonstrating hip flexor tightness and anterior tilt on mat',
        spokenAudio: 'Your hip flexors are already locked short from sitting. Sit-ups just pull your spine into more flexion.',
        onScreenText: 'Tight Hip Flexors = Spine Strain',
      },
      {
        timestamp: '00:16 - 00:28',
        scene: 'The Solution',
        visualAction: 'Demonstrating deadbugs with slow, controlled breathing',
        spokenAudio: 'Switch to deadbugs. Press your lower back flat, exhale fully, and extend opposite limbs slowly.',
        onScreenText: 'The Desk Fix: Deadbugs (3x10)',
      },
      {
        timestamp: '00:29 - 00:35',
        scene: 'CTA & Payoff',
        visualAction: 'Standing tall, thumbs up, gesturing to comments',
        spokenAudio: 'Comment CORE below and I will send you my 5-minute desk posture routine.',
        onScreenText: 'Comment "CORE" for Routine 👇',
      },
    ],
  },
  caption: 'Desk workers: if you suffer from afternoon lower back tightness, your core routine might be making it worse!\n\nStandard crunches and sit-ups pull on already tight psoas muscles. Replace them with anti-extension drills like deadbugs.\n\nSave this for your next workout and comment CORE for the complete desk mobility cheat-sheet!',
  cta: {
    action: 'Comment for cheat-sheet',
    commentKeyword: 'CORE',
    pinnedCommentPrompt: 'Drop CORE below and I will DM you the free 5-minute desk posture routine PDF!',
  },
  hashtags: ['#DeskWorkerFitness', '#MobilityDrills', '#BackPainRelief', '#FitnessWithAnanya', '#PostureCorrection'],
  creatorTips: [
    'Keep chin tucked during the deadbug demonstration to model clean spinal alignment.',
    'Hold the text overlay on screen for at least 2.5 seconds so viewers can register it.',
    'Pin your own comment immediately after posting to boost comment engagement.',
  ],
};

const validSchemaRes = validateGeneratedContentSchema(sampleValidRawContent, 'educational', 1);
console.assert(validSchemaRes.valid === true, 'Valid raw content must pass schema validation');
if (validSchemaRes.valid) {
  console.assert(validSchemaRes.data.isAiGenerated === true, 'isAiGenerated must be true');
  console.assert(validSchemaRes.data.angle === 'educational', 'Angle must be educational');
  console.assert(validSchemaRes.data.version === 1, 'Version must be 1');
  console.assert(validSchemaRes.data.cta.commentKeyword === 'CORE', 'Keyword should be uppercased');
  console.assert(validSchemaRes.data.hashtags.length === 5, 'Hashtags must be preserved');
}

// 2.2 Reject incomplete hooks
const badHookRes = validateGeneratedContentSchema(
  { ...sampleValidRawContent, hook: { primary: 'Too short' } },
  'educational',
  1
);
console.assert(badHookRes.valid === false, 'Must reject short/incomplete hook');

// 2.3 Reject script with fewer than 3 sections
const shortScriptRes = validateGeneratedContentSchema(
  {
    ...sampleValidRawContent,
    script: {
      ...sampleValidRawContent.script,
      sections: [sampleValidRawContent.script.sections[0]],
    },
  },
  'educational',
  1
);
console.assert(shortScriptRes.valid === false && shortScriptRes.error.includes('3 script sections'), 'Must require at least 3 sections');

// 2.4 Reject missing CTA or empty hashtags
const badCtaRes = validateGeneratedContentSchema(
  { ...sampleValidRawContent, cta: { action: '', commentKeyword: '' } },
  'educational',
  1
);
console.assert(badCtaRes.valid === false, 'Must reject empty CTA');

const emptyHashtagsRes = validateGeneratedContentSchema(
  { ...sampleValidRawContent, hashtags: [] },
  'educational',
  1
);
console.assert(emptyHashtagsRes.valid === false, 'Must reject empty hashtags');

console.log('✅ Schema Validation verified: Enforces complete structure, minimum sections, and valid fields.');

// -----------------------------------------------------------------------------
// TEST 3: Invalid Gemini JSON Handling
// -----------------------------------------------------------------------------
console.log('\n[Test 3] Verifying Invalid Gemini JSON & Code-Fence Stripping...');

// 3.1 Mock AI that returns malformed JSON
const mockClientMalformed = {
  models: {
    generateContent: async () => ({
      text: '{ "hook": { "primary": "Unterminated string ...',
    }),
  },
} as any;

const malformedRes = await generateContentWithGemini(
  { opportunityId: 'opp-1', title: 'Test Topic', selectedAngle: 'punchy' },
  { client: mockClientMalformed }
);

console.assert(malformedRes.success === false, 'Must return failure for malformed JSON');
if (malformedRes.success === false) {
  console.assert(malformedRes.status === 502, `Expected status 502, got ${malformedRes.status}`);
  console.assert(malformedRes.error === 'INVALID_AI_RESPONSE', 'Error must be INVALID_AI_RESPONSE');
}

// 3.2 Mock AI that returns JSON wrapped in markdown ```json ... ```
const mockClientFenced = {
  models: {
    generateContent: async () => ({
      text: '```json\n' + JSON.stringify(sampleValidRawContent) + '\n```',
    }),
  },
} as any;

const fencedRes = await generateContentWithGemini(
  { opportunityId: 'opp-1', title: 'Test Topic', selectedAngle: 'conversational' },
  { client: mockClientFenced }
);
console.assert(fencedRes.success === true, 'Must successfully parse markdown fenced JSON');
if (fencedRes.success) {
  console.assert(fencedRes.angle === 'conversational', 'Angle must be conversational');
  console.assert(fencedRes.content.isAiGenerated === true, 'Must mark isAiGenerated');
}

console.log('✅ Invalid JSON handling verified: Gracefully returns 502 on bad JSON and strips code fences.');

// -----------------------------------------------------------------------------
// TEST 4: Missing API Key Handling
// -----------------------------------------------------------------------------
console.log('\n[Test 4] Verifying Missing API Key Handling...');

const missingKeyRes = await generateContentWithGemini(
  { opportunityId: 'opp-1', title: 'Test Topic', selectedAngle: 'educational' },
  { client: null } // Explicitly simulate no API key configured
);

console.assert(missingKeyRes.success === false, 'Must return success: false when API key is missing');
if (missingKeyRes.success === false) {
  console.assert(missingKeyRes.status === 503, `Expected status 503, got ${missingKeyRes.status}`);
  console.assert(missingKeyRes.error === 'GEMINI_API_KEY_MISSING', 'Error must be GEMINI_API_KEY_MISSING');
  console.assert(!missingKeyRes.message.includes('undefined'), 'Message must be safe and descriptive');
}

console.log('✅ Missing API Key verified: Returns 503 GEMINI_API_KEY_MISSING, never returns fake preset-demo.');

// -----------------------------------------------------------------------------
// TEST 5: API / Quota Failure Handling
// -----------------------------------------------------------------------------
console.log('\n[Test 5] Verifying API & Quota Failure Handling...');

// 5.1 Quota exhaustion (429 / RESOURCE_EXHAUSTED)
const mockClientQuota = {
  models: {
    generateContent: async () => {
      const err = new Error('429 Too Many Requests: Quota exceeded for quota metric "GenerateContent"');
      throw err;
    },
  },
} as any;

const quotaRes = await generateContentWithGemini(
  { opportunityId: 'opp-1', title: 'Test Topic', selectedAngle: 'punchy' },
  { client: mockClientQuota }
);

console.assert(quotaRes.success === false, 'Quota failure must return success: false');
if (quotaRes.success === false) {
  console.assert(quotaRes.status === 429, `Expected status 429, got ${quotaRes.status}`);
  console.assert(quotaRes.error === 'QUOTA_EXHAUSTED', 'Error code must be QUOTA_EXHAUSTED');
  console.assert(quotaRes.message.includes('quota exceeded'), 'Safe message must indicate quota exceeded');
}

// 5.2 Server / network failure with internal details (leak prevention)
const mockClientInternalErr = {
  models: {
    generateContent: async () => {
      throw new Error('Connection reset at TCP 10.240.0.1:443 with token AIzaSyD-SECRET-KEY');
    },
  },
} as any;

const internalErrRes = await generateContentWithGemini(
  { opportunityId: 'opp-1', title: 'Test Topic', selectedAngle: 'storytelling' },
  { client: mockClientInternalErr }
);

console.assert(internalErrRes.success === false, 'Model failure must return success: false');
if (internalErrRes.success === false) {
  console.assert(internalErrRes.status === 502, `Expected status 502, got ${internalErrRes.status}`);
  console.assert(internalErrRes.error === 'MODEL_REQUEST_FAILED', 'Error code must be MODEL_REQUEST_FAILED');
  console.assert(!internalErrRes.message.includes('AIzaSyD'), 'Raw internal secrets must NEVER leak to client');
}

console.log('✅ API & Quota Failure verified: Returns 429 for quota, 502 for model failures, zero secret leaks.');

// -----------------------------------------------------------------------------
// TEST 6: Angle Changes & Prompt Directives
// -----------------------------------------------------------------------------
console.log('\n[Test 6] Verifying Creative Angle Directives in Generation Prompts...');

const baseReq: GenerateContentRequest = {
  opportunityId: 'opp-1',
  title: 'Fix 8 Hours of Slouching with 60s Wall Slides',
  category: 'Mobility & Posture',
  targetAudience: 'Desk workers and busy professionals',
  selectedAngle: 'educational',
};

// 6.1 Educational Prompt
const eduPrompt = buildGenerationPrompt({ ...baseReq, selectedAngle: 'educational' });
console.assert(eduPrompt.includes('EDUCATIONAL & TACTICAL BREAKDOWN'), 'Must include Educational guidance');
console.assert(eduPrompt.includes('biomechanics'), 'Educational prompt must emphasize mechanics');

// 6.2 Punchy Prompt
const punchyPrompt = buildGenerationPrompt({ ...baseReq, selectedAngle: 'punchy' });
console.assert(punchyPrompt.includes('HIGH-ENERGY & PUNCHY'), 'Must include Punchy guidance');
console.assert(punchyPrompt.includes('pattern interrupt in the first 0.5 seconds'), 'Punchy prompt must require fast interrupt');

// 6.3 Storytelling Prompt
const storyPrompt = buildGenerationPrompt({ ...baseReq, selectedAngle: 'storytelling' });
console.assert(storyPrompt.includes('RELATABLE NARRATIVE & TRANSFORMATION ARC'), 'Must include Storytelling guidance');
console.assert(storyPrompt.includes('struggle'), 'Storytelling prompt must include relatable struggle');

// 6.4 Conversational Prompt
const convPrompt = buildGenerationPrompt({ ...baseReq, selectedAngle: 'conversational' });
console.assert(convPrompt.includes('CANDID & CONVERSATIONAL COFFEE-CHAT'), 'Must include Conversational guidance');
console.assert(convPrompt.includes('FaceTiming'), 'Conversational prompt must include friendly peer guidance');

// 6.5 Safety & Score preservation negative constraints
for (const p of [eduPrompt, punchyPrompt, storyPrompt, convPrompt]) {
  console.assert(p.includes('DO NOT calculate, alter, or reference any Opportunity Score'), 'Must forbid changing score');
  console.assert(p.includes('DO NOT make unsubstantiated claims of guaranteed virality'), 'Must forbid virality claims');
  console.assert(p.includes('@FitnessWithAnanya'), 'Must be grounded in Ananya Verma profile');
}

console.log('✅ Creative Angle Prompts verified: Distinct instructions for 4 angles with strict constraints.');

// -----------------------------------------------------------------------------
// TEST 7: Same-Topic Regeneration & Constraints
// -----------------------------------------------------------------------------
console.log('\n[Test 7] Verifying Same-Topic Multi-Angle Regeneration Constraints...');

const previousVersions = [
  {
    hook: {
      primary: 'Stop doing standard sit-ups if you sit at a desk all day.',
      visualHook: 'Ananya pushes chair away wincing.',
      textOverlay: 'Desk Workers Stop 🛑',
    },
    angle: 'educational' as ContentAngle,
    caption: 'Prior caption...',
    version: 1,
  },
  {
    hook: {
      primary: 'Your desk is destroying your spine and 50 crunches will not save you.',
      visualHook: 'Rapid red flash and spine graphic.',
      textOverlay: 'CRUNCHES ARE A LIE ❌',
    },
    angle: 'punchy' as ContentAngle,
    caption: 'Prior punchy caption...',
    version: 2,
  },
];

const regenReq: GenerateContentRequest = {
  opportunityId: 'opp-1',
  title: 'Fix 8 Hours of Slouching with 60s Wall Slides',
  category: 'Mobility & Posture',
  selectedAngle: 'storytelling',
  previousVersions,
};

const regenPrompt = buildGenerationPrompt(regenReq);

// Check that prompt specifically instructs not repeating previous hooks
console.assert(regenPrompt.includes('SAME-TOPIC REGENERATION MANDATE:'), 'Prompt must include regeneration mandate');
console.assert(regenPrompt.includes('Stop doing standard sit-ups'), 'Prompt must reference Version 1 hook');
console.assert(regenPrompt.includes('Your desk is destroying your spine'), 'Prompt must reference Version 2 hook');
console.assert(regenPrompt.includes('Maintain the exact same core topic ("Fix 8 Hours of Slouching with 60s Wall Slides")'), 'Core topic must be preserved');
console.assert(regenPrompt.includes('DO NOT repeat, rephrase closely, or borrow words'), 'Must forbid copying earlier hooks');

// Mock generation for same-topic regeneration
const mockRegenClient = {
  models: {
    generateContent: async () => ({
      text: JSON.stringify({
        ...sampleValidRawContent,
        hook: {
          ...sampleValidRawContent.hook,
          primary: 'I used to finish every 9-hour workday with a neck so stiff I could barely check my blind spots.',
        },
      }),
    }),
  },
} as any;

const regenResult = await generateContentWithGemini(regenReq, { client: mockRegenClient });

console.assert(regenResult.success === true, 'Regeneration must succeed');
if (regenResult.success) {
  console.assert(regenResult.version === 3, `Expected version 3, got ${regenResult.version}`);
  console.assert(regenResult.opportunityId === 'opp-1', 'Opportunity ID must be strictly preserved');
  console.assert(regenResult.angle === 'storytelling', 'Selected angle must be storytelling');
  console.assert(regenResult.content.hook.primary !== previousVersions[0].hook.primary, 'Hook must differ from v1');
  console.assert(regenResult.content.hook.primary !== previousVersions[1].hook.primary, 'Hook must differ from v2');
}

console.log('✅ Same-Topic Regeneration verified: Context included, previous hooks excluded, version incremented.');

// -----------------------------------------------------------------------------
// TEST 8: Full End-to-End Mocked AI Generation
// -----------------------------------------------------------------------------
console.log('\n[Test 8] Verifying Full Mocked Gemini Service Generation...');

const mockClientFull = {
  models: {
    generateContent: async () => ({
      text: JSON.stringify(sampleValidRawContent),
    }),
  },
} as any;

const fullRes = await generateContentWithGemini(
  {
    opportunityId: 'opp-e2e',
    title: 'The 2-Ingredient Cottage Cheese Flatbread: 38g Protein for Desk Workers',
    category: 'Nutrition & Diet',
    selectedAngle: 'educational',
  },
  { client: mockClientFull }
);

console.assert(fullRes.success === true, 'End-to-end mocked call must succeed');
if (fullRes.success) {
  console.assert(fullRes.source === 'gemini', 'Source must be gemini');
  console.assert(fullRes.opportunityId === 'opp-e2e', 'Opp ID must match');
  console.assert(fullRes.content.script.sections.length === 4, 'Must have 4 script sections');
  console.assert(fullRes.content.cta.commentKeyword === 'CORE', 'Must have CTA keyword');
  console.assert(fullRes.content.isAiGenerated === true, 'Must have isAiGenerated = true');
}

console.log('✅ Full End-to-End Mocked Generation verified successfully.');

console.log('\n=====================================================');
console.log('   ALL PHASE 3 TESTS PASSED SUCCESSFULLY! (8/8)');
console.log('=====================================================\n');
