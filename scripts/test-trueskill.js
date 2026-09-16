#!/usr/bin/env node

/**
 * TrueSkill anytime ranking tests.
 * Run: node --experimental-default-type=module scripts/test-trueskill.js
 */

import {
  DEFAULT_BETA,
  DEFAULT_MU,
  DEFAULT_SIGMA,
  getMu,
  getSigma,
  updateTrueSkill,
} from '../utils/trueskill.js';
import {
  applyComparison,
  countRemainingComparisons,
  DEFAULT_SEPARATION_C,
  isRankingStable,
  makePairKey,
  rankImages,
  rankingProgress,
  selectNextPair,
  skillOverlap,
  withTrueSkillDefaults,
} from '../utils/ranking.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  ✅ ${message}`);
  } else {
    failed += 1;
    console.error(`  ❌ ${message}`);
  }
}

function assertClose(actual, expected, epsilon, message) {
  const ok = Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon;
  assert(ok, `${message} (got ${actual}, expected ${expected} ± ${epsilon})`);
}

function makePhoto(id, extras = {}) {
  return withTrueSkillDefaults({ id, name: `photo-${id}`, ...extras });
}

console.log('🧪 TrueSkill constants');
assert(DEFAULT_MU === 25, 'default mu is 25');
assertClose(DEFAULT_SIGMA, 25 / 3, 1e-12, 'default sigma is 25/3');
assertClose(DEFAULT_BETA, 25 / 6, 1e-12, 'default beta is 25/6');
assert(DEFAULT_SEPARATION_C === 1, 'default separation c is 1');

console.log('\n🧪 1v1 update from equal priors');
const equalUpdate = updateTrueSkill(
  { mu: DEFAULT_MU, sigma: DEFAULT_SIGMA },
  { mu: DEFAULT_MU, sigma: DEFAULT_SIGMA },
);
assert(equalUpdate.winner.mu > DEFAULT_MU, 'winner mu increases');
assert(equalUpdate.loser.mu < DEFAULT_MU, 'loser mu decreases');
assertClose(equalUpdate.winner.mu + equalUpdate.loser.mu, 2 * DEFAULT_MU, 1e-9, 'mu is conserved for equal priors');
assert(equalUpdate.winner.sigma < DEFAULT_SIGMA, 'winner sigma decreases');
assert(equalUpdate.loser.sigma < DEFAULT_SIGMA, 'loser sigma decreases');
assertClose(equalUpdate.winner.sigma, equalUpdate.loser.sigma, 1e-9, 'equal priors keep equal sigma');

console.log('\n🧪 Upset moves ratings more than a favorite win');
const favoriteWin = updateTrueSkill({ mu: 32, sigma: 4 }, { mu: 18, sigma: 4 });
const upsetWin = updateTrueSkill({ mu: 18, sigma: 4 }, { mu: 32, sigma: 4 });
const favoriteDelta = Math.abs(favoriteWin.winner.mu - 32);
const upsetDelta = Math.abs(upsetWin.winner.mu - 18);
assert(upsetDelta > favoriteDelta, 'underdog win moves mu more than favorite win');

console.log('\n🧪 Coverage phase: unseen vs pivot');
let photos = [makePhoto('a'), makePhoto('b'), makePhoto('c'), makePhoto('d')];
const firstPair = selectNextPair(photos);
assert(Array.isArray(firstPair) && firstPair.length === 2, 'first pair has two ids');
assert(firstPair[0] === 'a' && firstPair[1] === 'b', 'first pair is two unseen photos');

photos = applyComparison(photos, 'a', 'b');
const secondPair = selectNextPair(photos);
assert(secondPair.includes('c'), 'next pair includes an unseen photo');
assert(secondPair.includes('a') || secondPair.includes('b'), 'next pair uses a seen pivot');
assert(!secondPair.includes('d'), 'coverage does not skip ahead to a later unseen photo');

photos = applyComparison(photos, secondPair[0], secondPair[1] === secondPair[0] ? 'a' : secondPair[1]);
const thirdPair = selectNextPair(photos);
assert(thirdPair.includes('d'), 'last unseen is paired next');
assert(!isRankingStable(photos), 'ranking is not stable during coverage');
assert(rankingProgress(photos) < 100, 'progress is below 100 during coverage');
assert(countRemainingComparisons(photos) >= 1, 'remaining comparisons stay positive during coverage');

console.log('\n🧪 Adjacent phase: highest overlap');
const adjacentPhotos = [
  makePhoto('p1', { mu: 30, sigma: 2, comparisons: 1 }),
  makePhoto('p2', { mu: 29.8, sigma: 2, comparisons: 1 }),
  makePhoto('p3', { mu: 10, sigma: 1, comparisons: 1 }),
  makePhoto('p4', { mu: 0, sigma: 1, comparisons: 1 }),
];
const overlap12 = skillOverlap(adjacentPhotos[0], adjacentPhotos[1]);
const overlap23 = skillOverlap(adjacentPhotos[1], adjacentPhotos[2]);
assert(overlap12 > overlap23, 'close adjacent pair has higher overlap than a wide gap');
const adjacentPick = selectNextPair(adjacentPhotos);
assert(
  makePairKey(adjacentPick[0], adjacentPick[1]) === makePairKey('p1', 'p2'),
  'adjacent sampling picks the highest-overlap neighbors',
);

const lastKey = makePairKey('p1', 'p2');
const afterRepeatGuard = selectNextPair(adjacentPhotos, { lastPairKey: lastKey });
assert(
  makePairKey(afterRepeatGuard[0], afterRepeatGuard[1]) === lastKey,
  'still picks the unresolved adjacent pair even if it was last compared',
);

console.log('\n🧪 Auto-stop only when adjacent |μi−μi+1| > c(σi+σi+1)');
const overlapping = [
  makePhoto('x', { mu: 26, sigma: 3, comparisons: 1 }),
  makePhoto('y', { mu: 25, sigma: 3, comparisons: 1 }),
];
assert(!isRankingStable(overlapping), 'overlapping adjacent pair is not stable');

const separated = [
  makePhoto('x', { mu: 40, sigma: 2, comparisons: 1 }),
  makePhoto('y', { mu: 20, sigma: 2, comparisons: 1 }),
];
assert(
  Math.abs(getMu(separated[0]) - getMu(separated[1])) >
    DEFAULT_SEPARATION_C * (getSigma(separated[0]) + getSigma(separated[1])),
  'fixture satisfies |μi−μi+1| > c(σi+σi+1)',
);
assert(isRankingStable(separated), 'separated adjacent pair is stable');
assert(rankingProgress(separated) === 100, 'stable ranking reports 100% progress');
assert(countRemainingComparisons(separated) === 0, 'stable ranking has 0 remaining');

const unseenBlocksStop = [
  makePhoto('x', { mu: 40, sigma: 1, comparisons: 1 }),
  makePhoto('y', { mu: 10, sigma: 1, comparisons: 0 }),
];
assert(!isRankingStable(unseenBlocksStop), 'unseen photos block auto-stop even if mus are far apart');

console.log('\n🧪 rankImages uses mu/rating, not score');
const scoredWrong = [
  { id: 'low', score: 999, mu: 10, sigma: 2, comparisons: 1 },
  { id: 'high', score: 0, mu: 40, sigma: 2, comparisons: 1 },
];
const ranked = rankImages(scoredWrong);
assert(ranked[0].id === 'high', 'higher mu ranks first despite a larger leftover score');
assert(ranked[0].rank === 1 && ranked[1].rank === 2, 'unique ranks are assigned');
assert(ranked[0].rating === ranked[0].mu, 'rating is synced to mu');

console.log('\n🧪 Simulated tournament recovers true order');
const trueSkills = [42, 33, 25, 17, 8];
let field = trueSkills.map((skill, index) => makePhoto(`s${index}`, { trueSkill: skill }));

function simulateWinner(left, right) {
  return left.trueSkill >= right.trueSkill ? left.id : right.id;
}

let lastKeySim = '';
for (let step = 0; step < 80 && !isRankingStable(field); step++) {
  const pair = selectNextPair(field, { lastPairKey: lastKeySim });
  if (!pair) break;
  const left = field.find((img) => img.id === pair[0]);
  const right = field.find((img) => img.id === pair[1]);
  const winnerId = simulateWinner(left, right);
  const loserId = winnerId === left.id ? right.id : left.id;
  field = applyComparison(field, winnerId, loserId);
  lastKeySim = makePairKey(pair[0], pair[1]);
}

const recovered = rankImages(field).map((img) => img.id);
assert(JSON.stringify(recovered) === JSON.stringify(['s0', 's1', 's2', 's3', 's4']), 'recovered ranking matches true skill order');
assert(isRankingStable(field), 'simulated tournament reaches the adjacent-separation stop');
assert(rankingProgress(field) === 100, 'simulated tournament progress reaches 100');

console.log('\n📋 Summary');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}

console.log('\n🎉 TrueSkill ranking tests passed');
