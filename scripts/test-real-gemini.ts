import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateContentWithGemini } from '../src/lib/ai/contentGenerator';

console.log('--- Real Gemini API Live Integration Test ---');
console.log('Checking environment configuration...');
const hasKey = Boolean(process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY present:', hasKey);

if (!hasKey) {
  console.log('⚠️ Skipping live test: GEMINI_API_KEY is not configured in .env.local');
  process.exit(0);
}

async function runLiveTest() {
  console.log('\n[1/2] Testing live generation with real Gemini model (Angle: punchy)...');
  const req1 = {
    opportunityId: 'opp-real-test',
    title: 'The 2-Ingredient Cottage Cheese Flatbread: 38g Protein for Desk Workers',
    category: 'Nutrition & Diet',
    targetAudience: 'Desk workers and busy professionals looking for fat loss and mobility',
    selectedAngle: 'punchy' as const,
  };

  const start1 = Date.now();
  const res1 = await generateContentWithGemini(req1);
  const dur1 = ((Date.now() - start1) / 1000).toFixed(1);

  if (res1.success === false) {
    console.error(`❌ Live call failed (${res1.status}): [${res1.error}] ${res1.message}`);
    process.exit(1);
  }

  console.log(`✅ Live Call 1 Succeeded in ${dur1}s!`);
  console.log(`   Angle: ${res1.angle} (Version ${res1.version})`);
  console.log(`   Primary Hook: "${res1.content.hook.primary}"`);
  console.log(`   Text Overlay: "${res1.content.hook.textOverlay}"`);
  console.log(`   Visual Hook: "${res1.content.hook.visualHook}"`);
  console.log(`   Script Sections: ${res1.content.script.sections.length}`);
  console.log(`   CTA Keyword: "${res1.content.cta.commentKeyword}"`);
  console.log(`   Hashtags: ${res1.content.hashtags.join(' ')}`);

  console.log('\n[2/2] Testing same-topic multi-angle regeneration (Angle: educational, with v1 in context)...');
  const req2 = {
    opportunityId: 'opp-real-test',
    title: 'The 2-Ingredient Cottage Cheese Flatbread: 38g Protein for Desk Workers',
    category: 'Nutrition & Diet',
    targetAudience: 'Desk workers and busy professionals looking for fat loss and mobility',
    selectedAngle: 'educational' as const,
    previousVersions: [
      {
        hook: res1.content.hook,
        angle: res1.angle,
        caption: res1.content.caption,
        version: res1.version,
      },
    ],
  };

  const start2 = Date.now();
  const res2 = await generateContentWithGemini(req2);
  const dur2 = ((Date.now() - start2) / 1000).toFixed(1);

  if (res2.success === false) {
    console.error(`❌ Live regeneration failed (${res2.status}): [${res2.error}] ${res2.message}`);
    process.exit(1);
  }

  console.log(`✅ Live Call 2 Succeeded in ${dur2}s!`);
  console.log(`   Angle: ${res2.angle} (Version ${res2.version})`);
  console.log(`   New Hook: "${res2.content.hook.primary}"`);
  console.log(`   New Visual Hook: "${res2.content.hook.visualHook}"`);
  console.log(`   Different from v1?: ${res2.content.hook.primary !== res1.content.hook.primary ? 'YES' : 'NO'}`);

  console.log('\n🎉 Real Gemini live generation and same-topic regeneration passed successfully!');
}

runLiveTest().catch((err) => {
  console.error('Live test error:', err);
  process.exit(1);
});
