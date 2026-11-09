import {
  DEFAULT_MU,
  DEFAULT_SIGMA,
  getMu,
  getSigma,
  updateTrueSkill,
} from './trueskill.js';

export { DEFAULT_MU, DEFAULT_SIGMA, getMu, getSigma, updateTrueSkill };

/** Multiplier c in |μi − μi+1| > c(σi + σi+1). */
export const DEFAULT_SEPARATION_C = 1;
const DIRECT_WIN_MARGIN = 3;
const FIRST_PLACE_WIN_MARGIN = 5;
const MAX_REPEAT_PENALTY = 3;

export function makePairKey(idA, idB) {
  if (idA == null || idB == null) return '';
  return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
}

export function withTrueSkillDefaults(img) {
  const mu = getMu(img);
  const sigma = getSigma(img);
  return {
    ...img,
    mu,
    sigma,
    rating: mu,
    comparisons: img.comparisons ?? 0,
  };
}

export function sortByMuDesc(images) {
  return [...(images || [])].sort((a, b) => {
    const muDelta = getMu(b) - getMu(a);
    if (muDelta !== 0) return muDelta;
    const sigmaDelta = getSigma(a) - getSigma(b);
    if (sigmaDelta !== 0) return sigmaDelta;
    return String(a.id ?? '').localeCompare(String(b.id ?? ''));
  });
}

/**
 * Overlap of two skill Gaussians relative to the separation threshold.
 * Positive => still overlapping (unresolved). Higher = more unresolved.
 * @param {object} imageA
 * @param {object} imageB
 * @param {number} [c]
 * @returns {number}
 */
export function skillOverlap(imageA, imageB, c = DEFAULT_SEPARATION_C) {
  const muDiff = Math.abs(getMu(imageA) - getMu(imageB));
  const sigmaSum = getSigma(imageA) + getSigma(imageB);
  return c * sigmaSum - muDiff;
}

export function recordPairVote(pairHistory, winnerId, loserId) {
  const key = makePairKey(winnerId, loserId);
  const record = pairHistory[key];
  return {
    ...pairHistory,
    [key]: {
      ids: [winnerId, loserId],
      count: (record?.count || 0) + 1,
      wins: { ...record?.wins, [winnerId]: (record?.wins[winnerId] || 0) + 1 },
    },
  };
}

function getAdjacentMatchups(ranked, pairHistory, c) {
  return ranked.slice(1).map((right, index) => {
    const left = ranked[index];
    const record = pairHistory[makePairKey(left.id, right.id)];
    const overlap = skillOverlap(left, right, c);
    const directWins = record ? (record.wins[left.id] || 0) - (record.wins[right.id] || 0) : 0;
    // Require more head-to-head evidence for first place in larger sets.
    const positionMargin = index === 0 ? FIRST_PLACE_WIN_MARGIN : DIRECT_WIN_MARGIN;
    const winMargin = ranked.length === 2 ? 1 : positionMargin;
    const threshold = c * (getSigma(left) + getSigma(right));
    const skillProgress = threshold <= 0 ? 1 : 1 - overlap / threshold;
    return {
      overlap,
      resolved: overlap < 0 || directWins >= winMargin,
      progress: Math.min(1, Math.max(skillProgress, directWins / winMargin)),
    };
  });
}

/**
 * Introduce each photo against a mid-ranked opponent, then prioritize unresolved
 * neighbors. Use a nearby alternate when the previous pair would come up again.
 */
export function selectNextPair(images, { lastPairKey, pairHistory = {}, c = DEFAULT_SEPARATION_C } = {}) {
  const items = (images || []).filter((img) => img && img.id != null);
  if (items.length < 2) return null;

  const ranked = sortByMuDesc(items);
  const unseen = items.filter((img) => !img.comparisons);
  if (unseen.length > 0) {
    const seen = ranked.filter((img) => img.comparisons);
    const pivot = seen[Math.floor(seen.length / 2)] || unseen[1];
    return [unseen[0].id, pivot.id];
  }

  const adjacent = getAdjacentMatchups(ranked, pairHistory, c);
  let bestPair = null;
  let bestScore = -Infinity;

  for (let i = 0; i < ranked.length - 1; i++) {
    const left = ranked[i];

    for (let j = i + 1; j < Math.min(i + 3, ranked.length); j++) {
      const right = ranked[j];
      const key = makePairKey(left.id, right.id);
      if (key === lastPairKey && ranked.length > 2) continue;

      const neighbors = j === i + 1 ? adjacent[i] : null;
      const overlap = neighbors?.overlap ?? skillOverlap(left, right, c);
      const unresolvedBonus = neighbors && !neighbors.resolved ? DEFAULT_SIGMA : 0;
      const priorVotes = pairHistory[key]?.count || 0;
      const repeatPenalty = Math.min(priorVotes, MAX_REPEAT_PENALTY);
      const score = overlap + unresolvedBonus - repeatPenalty;
      if (score > bestScore) {
        bestScore = score;
        bestPair = [left.id, right.id];
      }
    }
  }

  return bestPair;
}

export function isRankingStable(images, { c = DEFAULT_SEPARATION_C, pairHistory = {} } = {}) {
  return images?.length >= 2 && countRemainingComparisons(images, { c, pairHistory }) === 0;
}

/** Progress combines first-comparison coverage and resolution of adjacent matchups. */
export function rankingProgress(images, { c = DEFAULT_SEPARATION_C, pairHistory = {} } = {}) {
  if (!images || images.length < 2) return 100;

  const coverage = images.filter((img) => img.comparisons).length / images.length;
  const adjacent = getAdjacentMatchups(sortByMuDesc(images), pairHistory, c);
  if (coverage === 1 && adjacent.every((matchup) => matchup.resolved)) return 100;

  const resolution = adjacent.reduce((sum, matchup) => sum + matchup.progress, 0) / adjacent.length;
  return Math.min(99, Math.round(50 * (coverage + resolution)));
}

/** Count first comparisons still needed, then the unresolved adjacent matchups. */
export function countRemainingComparisons(images, { c = DEFAULT_SEPARATION_C, pairHistory = {} } = {}) {
  if (!images || images.length < 2) return 0;

  const unseen = images.filter((img) => !img.comparisons).length;
  if (unseen > 0) return unseen === images.length ? unseen - 1 : unseen;

  return getAdjacentMatchups(sortByMuDesc(images), pairHistory, c).filter((matchup) => !matchup.resolved).length;
}

/**
 * Sort by μ (rating) descending and assign unique ranks.
 * @param {Array} images
 * @returns {Array}
 */
export function rankImages(images) {
  return sortByMuDesc(images || []).map((img, index) => {
    const mu = getMu(img);
    const sigma = getSigma(img);
    return {
      ...img,
      mu,
      sigma,
      rating: mu,
      rank: index + 1,
    };
  });
}

/**
 * Apply a decisive comparison to the image list.
 * @param {Array} images
 * @param {*} winnerId
 * @param {*} loserId
 * @returns {Array}
 */
export function applyComparison(images, winnerId, loserId) {
  const winnerImage = (images || []).find((img) => img.id === winnerId);
  const loserImage = (images || []).find((img) => img.id === loserId);
  if (!winnerImage || !loserImage) return images || [];

  const updated = updateTrueSkill(winnerImage, loserImage);

  return images.map((img) => {
    if (img.id === winnerId) {
      return {
        ...img,
        mu: updated.winner.mu,
        sigma: updated.winner.sigma,
        rating: updated.winner.mu,
        comparisons: (img.comparisons || 0) + 1,
      };
    }
    if (img.id === loserId) {
      return {
        ...img,
        mu: updated.loser.mu,
        sigma: updated.loser.sigma,
        rating: updated.loser.mu,
        comparisons: (img.comparisons || 0) + 1,
      };
    }
    return img;
  });
}

export function pairFromIds(images, ids) {
  if (!ids || ids.length < 2) return null;
  const left = images.find((img) => img.id === ids[0]);
  const right = images.find((img) => img.id === ids[1]);
  if (!left || !right) return null;
  return [left, right];
}
