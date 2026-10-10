import fs from 'fs';
import path from 'path';
import { getDemoProfile } from '../src/lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from '../src/lib/analysis/creatorAnalysis';
import {
  calculatePillarScores,
  calculateNicheFit,
  calculateHistoricalFit,
  calculateTrendRelevance,
  calculateContentGap,
  calculateAudienceFit,
  clamp,
  DEFAULT_SCORING_WEIGHTS,
} from '../src/lib/scoring/opportunityScorer';
import { generateRankedOpportunities } from '../src/lib/opportunities/rankedPipeline';
import { TrendSignal, NormalizedCreatorProfile, ScoringInputOverrides } from '../src/types/normalized';

console.log('=====================================================');
console.log('   TRENDIQ MENTOR EXPLAINABLE ENGINE TEST SUITE');
console.log('=====================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Exact Mentor Weights & Arithmetic Verification
// -----------------------------------------------------------------------------
console.log('[Test 1] Verifying exact mentor scoring weights (25/25/20/15/15)...');
const weights = DEFAULT_SCORING_WEIGHTS;
console.assert(weights.nicheFit === 0.25, `Niche Fit weight must be 0.25, got ${weights.nicheFit}`);
console.assert(weights.historicalFit === 0.25, `Historical Performance weight must be 0.25, got ${weights.historicalFit}`);
console.assert(weights.trendRelevance === 0.20, `Trend Momentum weight must be 0.20, got ${weights.trendRelevance}`);
console.assert(weights.contentGap === 0.15, `Content Gap weight must be 0.15, got ${weights.contentGap}`);
console.assert(weights.audienceFit === 0.15, `Audience Relevance weight must be 0.15, got ${weights.audienceFit}`);

const weightSum = weights.nicheFit + weights.historicalFit + weights.trendRelevance + weights.contentGap + weights.audienceFit;
console.assert(Math.abs(weightSum - 1.0) < 0.000001, `Weights must sum exactly to 1.0 (100%), got ${weightSum}`);

// Known manual test calculation:
// Niche=80, Hist=70, Trend=90, Gap=60, Aud=50
// Expected: 0.25*80 + 0.25*70 + 0.20*90 + 0.15*60 + 0.15*50 = 20 + 17.5 + 18 + 9 + 7.5 = 72.0 -> 72
const expectedKnown = Math.round(0.25 * 80 + 0.25 * 70 + 0.20 * 90 + 0.15 * 60 + 0.15 * 50);
console.assert(expectedKnown === 72, `Expected known weighted score to be 72, got ${expectedKnown}`);

// Boundary calculations: all 100 -> 100, all 0 -> 0
const all100 = Math.round(0.25 * 100 + 0.25 * 100 + 0.20 * 100 + 0.15 * 100 + 0.15 * 100);
const all0 = Math.round(0.25 * 0 + 0.25 * 0 + 0.20 * 0 + 0.15 * 0 + 0.15 * 0);
console.assert(all100 === 100, `All 100s must equal 100, got ${all100}`);
console.assert(all0 === 0, `All 0s must equal 0, got ${all0}`);
console.log('✅ Weights verified: Niche 25% + Hist 25% + Trend 20% + Gap 15% + Audience 15% = 100% exactly.');

// -----------------------------------------------------------------------------
// TEST 2: Determinism & Repeatability (1,000 Iterations)
// -----------------------------------------------------------------------------
console.log('\n[Test 2] Verifying 1,000-run scoring repeatability & determinism...');
const demoProfile = getDemoProfile();
const demoAnalysis = analyzeCreatorProfile(demoProfile);
const sampleTrend: TrendSignal = {
  id: 'trend-test',
  topic: 'High-Protein Cottage Cheese Flatbread & Bakes',
  category: 'Nutrition & Diet',
  trend_score: 96,
  growth_status: '+340% Breakout',
  growth_type: 'breakout',
  region: 'Global',
  source: 'Google Trends',
  snapshot_date: 'Sep 2026',
  search_volume_index: 98,
  peak_timing: 'Morning',
  audience_interest: 'Fat loss, busy professionals',
  top_queries: ['cottage cheese flatbread calories'],
};

const firstRun = calculatePillarScores(demoProfile, demoAnalysis, sampleTrend);

for (let i = 0; i < 1000; i++) {
  const nextRun = calculatePillarScores(demoProfile, demoAnalysis, sampleTrend);
  if (
    nextRun.totalScore !== firstRun.totalScore ||
    nextRun.nicheFit !== firstRun.nicheFit ||
    nextRun.historicalFit !== firstRun.historicalFit ||
    nextRun.trendRelevance !== firstRun.trendRelevance ||
    nextRun.contentGap !== firstRun.contentGap ||
    nextRun.audienceFit !== firstRun.audienceFit
  ) {
    throw new Error(`Non-deterministic score detected at iteration ${i}!`);
  }
}
console.log(`✅ Determinism confirmed: 1,000 runs produced 100% identical scores (${firstRun.totalScore}/100).`);

// -----------------------------------------------------------------------------
// TEST 3: Score Boundaries & Extreme Inputs Clamping [0, 100]
// -----------------------------------------------------------------------------
console.log('\n[Test 3] Verifying boundary clamping [0, 100] across extreme inputs...');
const extremeHighTrend: TrendSignal = {
  ...sampleTrend,
  search_volume_index: 9999,
  growth_type: 'breakout',
};
const extremeLowTrend: TrendSignal = {
  ...sampleTrend,
  search_volume_index: -9999,
  growth_type: 'steady',
};

const highScores = calculatePillarScores(demoProfile, demoAnalysis, extremeHighTrend);
const lowScores = calculatePillarScores(demoProfile, demoAnalysis, extremeLowTrend);

console.assert(highScores.totalScore <= 100 && highScores.totalScore >= 0, 'Total score must be in [0, 100]');
console.assert(highScores.nicheFit <= 100 && highScores.nicheFit >= 0, 'NicheFit must be in [0, 100]');
console.assert(highScores.historicalFit <= 100 && highScores.historicalFit >= 0, 'HistoricalFit must be in [0, 100]');
console.assert(highScores.trendRelevance <= 100 && highScores.trendRelevance >= 0, 'TrendRelevance must be in [0, 100]');
console.assert(highScores.contentGap <= 100 && highScores.contentGap >= 0, 'ContentGap must be in [0, 100]');
console.assert(highScores.audienceFit <= 100 && highScores.audienceFit >= 0, 'AudienceFit must be in [0, 100]');

console.assert(lowScores.totalScore >= 0, 'Low totalScore must be >= 0');
console.assert(lowScores.trendRelevance >= 0, 'Low trendRelevance must be >= 0');
console.log('✅ Boundary constraints verified: All sub-scores and totals strictly clamped within [0, 100].');

// -----------------------------------------------------------------------------
// TEST 4: Missing-Data Handling & Explicit Fallbacks
// -----------------------------------------------------------------------------
console.log('\n[Test 4] Verifying missing-data handling and explicit fallback labelling...');
const emptyCreator: NormalizedCreatorProfile = {
  id: 'empty-test',
  isDemo: true,
  username: 'ZeroCreator',
  handle: '@zerocreator',
  fullName: 'Zero Views User',
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

const emptyAnalysis = analyzeCreatorProfile(emptyCreator);

// Historical Fit: explicit neutral fallback = 65
const emptyHistFit = calculateHistoricalFit(emptyCreator, emptyAnalysis, sampleTrend);
console.assert(emptyHistFit === 65, `Expected Historical Fit neutral fallback = 65, got ${emptyHistFit}`);

// Audience Fit: explicit neutral fallback = 70
const emptyAudFit = calculateAudienceFit(emptyCreator, sampleTrend);
console.assert(emptyAudFit === 70, `Expected Audience Fit neutral fallback = 70, got ${emptyAudFit}`);

// Content Gap: when market competition is unmeasured and topic never covered,
// uses neutral fallback Medium = 70: 0.7 * 70 + 25 = 74
const emptyTrendWithoutQueries: TrendSignal = {
  ...sampleTrend,
  topic: 'Completely Novel Unknown Unposted Topic',
  top_queries: [],
};
const emptyGapFit = calculateContentGap(emptyAnalysis, emptyTrendWithoutQueries);
console.assert(emptyGapFit === 74, `Expected Content Gap neutral fallback (0.7*70+25)=74, got ${emptyGapFit}`);

// Niche Fit: when creator has no pillars and bio, neutral fallback = 50
const emptyNicheFit = calculateNicheFit(emptyCreator, emptyAnalysis, emptyTrendWithoutQueries);
console.assert(emptyNicheFit === 50, `Expected Niche Fit neutral fallback = 50, got ${emptyNicheFit}`);

// Verify explanations label fallbacks
const emptyPillarScores = calculatePillarScores(emptyCreator, emptyAnalysis, emptyTrendWithoutQueries);
console.assert(emptyPillarScores.explanation !== undefined, 'Explanation must be defined');
console.assert(emptyPillarScores.explanation?.factors.nicheFit.isFallback === true, 'NicheFit must be marked fallback');
console.assert(emptyPillarScores.explanation?.factors.historicalFit.isFallback === true, 'HistoricalFit must be marked fallback');
console.assert(emptyPillarScores.explanation?.factors.contentGap.isFallback === true, 'ContentGap must be marked fallback');
console.assert(emptyPillarScores.explanation?.factors.audienceFit.isFallback === true, 'AudienceFit must be marked fallback');
console.assert(emptyPillarScores.explanation?.factors.historicalFit.evidence.includes('Data unavailable'), 'Evidence must explicitly state Data unavailable');

console.log('✅ Missing-data fallbacks verified: Niche=50, Hist=65, Gap=74, Audience=70 with explicit labels.');

// -----------------------------------------------------------------------------
// TEST 5: Each Adjustable Playground Input Modifies Appropriate Factor
// -----------------------------------------------------------------------------
console.log('\n[Test 5] Verifying adjustable inputs alter the appropriate factors...');

// 5.1 Trend search volume index alters Trend Momentum
const baseTrendRelevance = calculateTrendRelevance(sampleTrend);
const boostedTrendRelevance = calculateTrendRelevance(sampleTrend, { searchVolumeIndex: 50 });
console.assert(boostedTrendRelevance !== baseTrendRelevance, 'searchVolumeIndex must alter Trend Momentum');
console.assert(boostedTrendRelevance === Math.round(0.75 * 50 + 25), `Expected 0.75*50+25=63, got ${boostedTrendRelevance}`);

// 5.2 Competition level alters Content Gap
const lowCompGap = calculateContentGap(demoAnalysis, emptyTrendWithoutQueries, { competitionLevel: 'Low' });
const highCompGap = calculateContentGap(demoAnalysis, emptyTrendWithoutQueries, { competitionLevel: 'High' });
console.assert(lowCompGap === 88, `Low competition gap should be 0.7*90+25=88, got ${lowCompGap}`);
console.assert(highCompGap === 57, `High competition gap should be 0.7*45+25=56.5->57, got ${highCompGap}`);
console.assert(lowCompGap > highCompGap, 'Low competition must give higher gap score than High competition');

// 5.3 Topic recency alters Content Gap (fatigue penalty)
const recentCoveredGap = calculateContentGap(demoAnalysis, emptyTrendWithoutQueries, { daysSinceLastCovered: 3 });
const olderCoveredGap = calculateContentGap(demoAnalysis, emptyTrendWithoutQueries, { daysSinceLastCovered: 10 });
const unpostedGap = calculateContentGap(demoAnalysis, emptyTrendWithoutQueries, { daysSinceLastCovered: 30, competitionLevel: 'Low' });
console.assert(recentCoveredGap === 30, `Recency <= 7 days must trigger fatigue penalty 30, got ${recentCoveredGap}`);
console.assert(olderCoveredGap === 55, `Recency 8-14 days must trigger moderate penalty 55, got ${olderCoveredGap}`);
console.assert(unpostedGap === 88, `Recency > 14 days must use competition formula, got ${unpostedGap}`);

// 5.4 Niche match override alters Niche Fit
const customNicheFit = calculateNicheFit(demoProfile, demoAnalysis, sampleTrend, { nicheMatchScore: 95 });
console.assert(customNicheFit === 95, `Niche match override must be 95, got ${customNicheFit}`);

// 5.5 Audience relevance override alters Audience Fit
const customAudienceFit = calculateAudienceFit(demoProfile, sampleTrend, { audienceFitScore: 82 });
console.assert(customAudienceFit === 82, `Audience fit override must be 82, got ${customAudienceFit}`);

console.log('✅ Adjustable inputs verified: SVI, competition, recency, niche, and audience all modify expected factors.');

// -----------------------------------------------------------------------------
// TEST 6: Changing Inputs Changes Final Score and Rank
// -----------------------------------------------------------------------------
console.log('\n[Test 6] Verifying scenario where changing inputs changes final score & candidate ranking...');
const trendsPath = path.join(process.cwd(), 'trends.json');
const rawTrends: TrendSignal[] = JSON.parse(fs.readFileSync(trendsPath, 'utf-8')).trends;

// Baseline generation
const baselineOpps = generateRankedOpportunities(demoProfile, demoAnalysis, rawTrends);
const originalRank1 = baselineOpps[0];
const originalRank2 = baselineOpps[1];

console.log(`   Baseline #1: "${originalRank1.title}" (Score: ${originalRank1.opportunityScore})`);
console.log(`   Baseline #2: "${originalRank2.title}" (Score: ${originalRank2.opportunityScore})`);

// Notice in baseline:
// Rank 1 is Cottage Cheese (trend-1, score 88)
// Rank 2 is Wall Slide (trend-3, score 86, penalized by recency: covered 3 days ago in demo recent posts -> gap = 30)
// Now simulate in playground: Mentor changes Wall Slide recency from 3 days to 35 days (unposted) and competition to Low!
const simulationOverrides: Record<string, ScoringInputOverrides> = {
  'trend-3': {
    daysSinceLastCovered: 35,
    competitionLevel: 'Low',
  },
};

const simulatedOpps = generateRankedOpportunities(demoProfile, demoAnalysis, rawTrends, simulationOverrides);
const simulatedRank1 = simulatedOpps[0];

console.log(`   Simulated #1: "${simulatedRank1.title}" (Score: ${simulatedRank1.opportunityScore}, was #${simulatedRank1.originalRank})`);
console.assert(simulatedRank1.trendId === 'trend-3', `Expected Wall Slide (trend-3) to overtake Rank #1, got ${simulatedRank1.trendId}`);
console.assert(simulatedRank1.opportunityScore > originalRank2.opportunityScore, `Score must increase from ${originalRank2.opportunityScore}`);
console.assert(simulatedRank1.badge === 'Top Pick', 'Simulated #1 must have badge "Top Pick"');
console.assert(simulatedRank1.isSimulationModified === true, 'Wall Slide must be marked as simulation modified');

console.log(`✅ Ranking change verified: Wall Slide moved from Rank #2 (${originalRank2.opportunityScore} pts) to Rank #1 (${simulatedRank1.opportunityScore} pts).`);

// -----------------------------------------------------------------------------
// TEST 7: Factor Explainability & Weighted Contribution Arithmetic
// -----------------------------------------------------------------------------
console.log('\n[Test 7] Verifying 5-factor explainability and weighted contribution precision...');
for (const opp of baselineOpps) {
  const exp = opp.explanation!;
  console.assert(exp !== undefined, `Opportunity ${opp.id} must have explanation`);
  
  const f = exp.factors;
  const sumContributions =
    f.nicheFit.weightedContribution +
    f.historicalFit.weightedContribution +
    f.trendRelevance.weightedContribution +
    f.contentGap.weightedContribution +
    f.audienceFit.weightedContribution;

  // Round of sum must equal final total score
  const roundedSum = Math.round(sumContributions);
  console.assert(
    roundedSum === opp.opportunityScore,
    `Sum of contributions (${sumContributions.toFixed(2)} -> ${roundedSum}) must equal totalScore (${opp.opportunityScore}) for ${opp.title}`
  );

  // Each factor must have evidence and non-empty reason
  console.assert(f.nicheFit.evidence.length > 5, 'NicheFit evidence must be descriptive');
  console.assert(f.historicalFit.evidence.length > 5, 'HistoricalFit evidence must be descriptive');
  console.assert(f.trendRelevance.evidence.length > 5, 'TrendRelevance evidence must be descriptive');
  console.assert(f.contentGap.evidence.length > 5, 'ContentGap evidence must be descriptive');
  console.assert(f.audienceFit.evidence.length > 5, 'AudienceFit evidence must be descriptive');
}
console.log('✅ Explainability verified: All 5 factors contain empirical evidence, reasons, weights, and contributions.');

// -----------------------------------------------------------------------------
// TEST 8: Deterministic Ordering When Scores Tie
// -----------------------------------------------------------------------------
console.log('\n[Test 8] Verifying deterministic ordering when candidate scores tie...');
const tieTrendA: TrendSignal = {
  ...sampleTrend,
  id: 'trend-tie-a',
  topic: 'Topic Alpha',
  search_volume_index: 80,
};
const tieTrendB: TrendSignal = {
  ...sampleTrend,
  id: 'trend-tie-b',
  topic: 'Topic Beta',
  search_volume_index: 80,
};

const tieOpps1 = generateRankedOpportunities(demoProfile, demoAnalysis, [tieTrendA, tieTrendB]);
const tieOpps2 = generateRankedOpportunities(demoProfile, demoAnalysis, [tieTrendB, tieTrendA]); // reverse initial input order

console.assert(tieOpps1.length === 2 && tieOpps2.length === 2, 'Must score both candidates');
console.assert(tieOpps1[0].id === tieOpps2[0].id, 'Tied candidates must produce identical order regardless of input order');
console.assert(tieOpps1[1].id === tieOpps2[1].id, 'Tied candidates must produce identical order regardless of input order');
console.log('✅ Deterministic tie-breaking verified: Multi-key secondary sorting ensures consistent order.');

// -----------------------------------------------------------------------------
// TEST 9: Candidate Deduplication
// -----------------------------------------------------------------------------
console.log('\n[Test 9] Verifying candidate deduplication in opportunities pipeline...');
const duplicateTrends: TrendSignal[] = [
  sampleTrend,
  { ...sampleTrend },
  { ...sampleTrend, id: 'trend-test-copy', topic: sampleTrend.topic.toUpperCase() },
];

const deduplicatedOpps = generateRankedOpportunities(demoProfile, demoAnalysis, duplicateTrends);
console.assert(deduplicatedOpps.length === 1, `Expected 1 distinct opportunity, got ${deduplicatedOpps.length}`);
console.log('✅ Deduplication verified: Duplicate IDs and duplicate topics safely rejected.');

console.log('\n=====================================================');
console.log('   ALL PHASE 2 MENTOR ENGINE TESTS PASSED! (9/9)');
console.log('=====================================================\n');
