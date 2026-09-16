/**
 * Anytime TrueSkill ranking: coverage, then adjacent-pair sampling.
 *
 * Coverage: every photo gets 1 comparison (unseen vs pivot).
 * Then: sort by μ and compare the adjacent pair with the highest overlap.
 * Auto-stop when every adjacent pair satisfies |μi − μi+1| > c(σi + σi+1).
 */

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

export function isAdjacentPairSeparated(imageA, imageB, c = DEFAULT_SEPARATION_C) {
  return skillOverlap(imageA, imageB, c) < 0;
}

function pickPivot(seen) {
  return sortByMuDesc(seen)[0] || null;
}

/**
 * Choose the next comparison pair.
 * Coverage phase until every photo has ≥1 comparison (unseen vs current pivot).
 * Then adjacent pair with the highest overlap.
 *
 * @param {Array} images
 * @param {{ lastPairKey?: string, c?: number }} [options]
 * @returns {[*, *] | null} ids
 */
export function selectNextPair(images, options = {}) {
  const items = (images || []).filter((img) => img && img.id != null);
  if (items.length < 2) return null;

  const lastPairKey = options.lastPairKey || '';
  const c = options.c ?? DEFAULT_SEPARATION_C;

  const unseen = items.filter((img) => (img.comparisons || 0) < 1);
  const seen = items.filter((img) => (img.comparisons || 0) >= 1);

  if (unseen.length > 0) {
    if (seen.length === 0) {
      return [unseen[0].id, unseen[1].id];
    }
    const pivot = pickPivot(seen);
    if (!pivot || pivot.id === unseen[0].id) {
      const other = items.find((img) => img.id !== unseen[0].id);
      return other ? [unseen[0].id, other.id] : null;
    }
    return [unseen[0].id, pivot.id];
  }

  const ranked = sortByMuDesc(items);
  let bestPair = null;
  let bestScore = -Infinity;

  for (let i = 0; i < ranked.length - 1; i++) {
    const left = ranked[i];
    const right = ranked[i + 1];
    const key = makePairKey(left.id, right.id);
    const overlap = skillOverlap(left, right, c);
    const repeatPenalty = key && key === lastPairKey ? 1e-6 : 0;
    const comparisonPenalty = 1e-9 * ((left.comparisons || 0) + (right.comparisons || 0));
    const score = overlap - repeatPenalty - comparisonPenalty;
    if (score > bestScore) {
      bestScore = score;
      bestPair = [left.id, right.id];
    }
  }

  return bestPair;
}

/**
 * Auto-stop when every photo has been seen once and every adjacent pair is
 * separated: |μi − μi+1| > c(σi + σi+1).
 * @param {Array} images
 * @param {number} [c]
 * @returns {boolean}
 */
export function isRankingStable(images, c = DEFAULT_SEPARATION_C) {
  if (!images || images.length < 2) return false;
  const allSeen = images.every((img) => (img.comparisons || 0) >= 1);
  if (!allSeen) return false;

  const ranked = sortByMuDesc(images);
  for (let i = 0; i < ranked.length - 1; i++) {
    if (!isAdjacentPairSeparated(ranked[i], ranked[i + 1], c)) {
      return false;
    }
  }
  return true;
}

/**
 * Ranking stability used as progress (0–100).
 * 50% coverage of first comparisons + 50% adjacent-pair separation.
 * @param {Array} images
 * @param {number} [c]
 * @returns {number}
 */
export function rankingProgress(images, c = DEFAULT_SEPARATION_C) {
  if (!images || images.length < 2) return 100;

  const coverage =
    images.filter((img) => (img.comparisons || 0) >= 1).length / images.length;

  const ranked = sortByMuDesc(images);
  const adjacentCount = ranked.length - 1;
  let separationSum = 0;
  for (let i = 0; i < adjacentCount; i++) {
    const gap = Math.abs(getMu(ranked[i]) - getMu(ranked[i + 1]));
    const threshold = c * (getSigma(ranked[i]) + getSigma(ranked[i + 1]));
    separationSum += threshold <= 0 ? 1 : Math.min(1, gap / threshold);
  }
  const stability = adjacentCount > 0 ? separationSum / adjacentCount : 1;

  return Math.max(0, Math.min(100, Math.round(100 * (0.5 * coverage + 0.5 * stability))));
}

/**
 * Lower-bound remaining comparisons: unseen photos, then unresolved adjacent pairs.
 * @param {Array} images
 * @param {number} [c]
 * @returns {number}
 */
export function countRemainingComparisons(images, c = DEFAULT_SEPARATION_C) {
  if (!images || images.length < 2) return 0;

  const unseen = images.filter((img) => (img.comparisons || 0) < 1).length;
  const seen = images.length - unseen;
  if (unseen > 0) {
    return seen === 0 ? Math.max(0, unseen - 1) : unseen;
  }

  const ranked = sortByMuDesc(images);
  let unresolved = 0;
  for (let i = 0; i < ranked.length - 1; i++) {
    if (!isAdjacentPairSeparated(ranked[i], ranked[i + 1], c)) {
      unresolved += 1;
    }
  }
  return unresolved;
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
