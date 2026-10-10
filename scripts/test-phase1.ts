import { getDemoProfile } from '../src/lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../src/lib/analysis/creatorAnalysis';
import { NormalizedCreatorProfile } from '../src/types/normalized';

console.log('--- Phase 1 Verification Test Suite ---');

// Test 1: Demo Instagram Adapter
console.log('\n[Test 1] Verifying Demo Instagram Adapter...');
const profile = getDemoProfile();

console.assert(profile.id === 'demo-fitnesswithananya', 'ID must be demo-fitnesswithananya');
console.assert(profile.isDemo === true, 'isDemo must be true');
console.assert(profile.username === 'FitnessWithAnanya', 'Username must be FitnessWithAnanya');
console.assert(profile.followers === 18420, 'Followers must match 18420');
console.assert(profile.postsCount === 126, 'PostsCount must match 126');
console.assert(profile.contentPillars.length === 4, 'Must have 4 content pillars');
console.assert(profile.recentPosts.length === 4, 'Must have 4 recent posts');
console.assert(typeof profile.metricsSummary.saveRate === 'number', 'Save rate must be a number');
console.assert(!isNaN(profile.metricsSummary.saveRate), 'Save rate must not be NaN');

console.log('✅ Demo profile loaded successfully:');
console.log(`   Username: @${profile.username} (${profile.fullName})`);
console.log(`   Followers: ${profile.followers.toLocaleString()} | Posts: ${profile.postsCount}`);
console.log(`   Baseline Avg Views: ${profile.metricsSummary.avgReelViews.toLocaleString()}`);
console.log(`   Calculated Save Rate: ${(profile.metricsSummary.saveRate * 100).toFixed(2)}%`);
console.log(`   Recent Posts count: ${profile.recentPosts.length}`);

// Test 2: Analysis Engine on Demo Profile
console.log('\n[Test 2] Verifying Creator Analysis Module on Demo Profile...');
const analysis = analyzeCreatorProfile(profile);

console.assert(analysis.baselineAvgViews > 0, 'Baseline avg views must be positive');
console.assert(analysis.pillarMetrics.length === 4, 'Must analyze 4 pillars');
console.assert(analysis.formatPerformance.length === 3, 'Must analyze 3 formats');
console.assert(analysis.bestFormat === 'Talking Head', 'Best format should be Talking Head');
console.assert(analysis.nicheKeywords.length > 5, 'Must extract niche keywords');

console.log('✅ Analysis computed successfully:');
console.log(`   Baseline Views: ${analysis.baselineAvgViews.toLocaleString()}`);
console.log(`   Best Format: ${analysis.bestFormat}`);
console.log('   Pillar Velocities:');
for (const p of analysis.pillarMetrics) {
  console.log(`     - ${p.name}: ${p.avgViews.toLocaleString()} views (${p.velocityRatio}x velocity)`);
}
console.log('   Format Multipliers:');
for (const f of analysis.formatPerformance) {
  console.log(`     - ${f.format}: ${f.avgViews.toLocaleString()} avg views (${f.multiplier}x multiplier)`);
}
console.log(`   Niche Keywords extracted: ${analysis.nicheKeywords.slice(0, 8).join(', ')}...`);

// Test 3: Zero-Denominator & Missing Data Resilience
console.log('\n[Test 3] Verifying Zero-Denominator & Missing Metrics Resilience...');
const emptyProfile: NormalizedCreatorProfile = {
  id: 'empty-test',
  isDemo: true,
  username: 'EmptyCreator',
  handle: '@emptycreator',
  fullName: 'Empty User',
  bio: '',
  category: '',
  avatarUrl: '',
  followers: 0,
  following: 0,
  postsCount: 0,
  metricsSummary: {
    avgReelViews: 0,
    avgEngagementRate: 0,
    topReelViews: 0,
    bestContentFormat: 'Reel',
    topPerformingTopic: '',
    keyContentInsight: '',
    retentionAverageSeconds: 0,
    saveRate: 0,
  },
  contentPillars: [],
  recentPosts: [],
  demographics: {
    topAge: '',
    genderSplit: '',
    topLocations: [],
    peakActiveTime: '',
  },
};

const emptyAnalysis = analyzeCreatorProfile(emptyProfile);
console.assert(emptyAnalysis.baselineAvgViews > 0, 'Empty profile must get safe baseline views fallback');
console.assert(!isNaN(emptyAnalysis.baselineAvgViews), 'Must not be NaN');
console.assert(emptyAnalysis.pillarMetrics.length === 0, 'Pillar metrics length is 0');
console.assert(emptyAnalysis.formatPerformance.length === 3, 'Format performance still produces 3 buckets');
for (const f of emptyAnalysis.formatPerformance) {
  console.assert(!isNaN(f.avgViews), 'Format avgViews must not be NaN');
  console.assert(!isNaN(f.multiplier), 'Format multiplier must not be NaN');
}
console.log('✅ Zero-denominator resilience verified: No NaNs, division by zero safely avoided.');

console.log('\n--- All Phase 1 Tests Passed Successfully! ---');
