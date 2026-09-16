/**
 * TrueSkill 1v1 rating for photo comparisons.
 *
 * Defaults match the original TrueSkill paper:
 *   mu    = 25
 *   sigma = 25/3
 *   beta  = 25/6  (performance variance)
 *   tau   = sigma/100  (small dynamics so sigma cannot collapse to 0)
 */

export const DEFAULT_MU = 25;
export const DEFAULT_SIGMA = 25 / 3;
export const DEFAULT_BETA = 25 / 6;
export const DEFAULT_TAU = DEFAULT_SIGMA / 100;
export const MIN_SIGMA = 1e-3;

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const INV_SQRT_2 = Math.SQRT1_2;

/**
 * Abramowitz & Stegun 7.1.26 error function approximation.
 * @param {number} x
 * @returns {number}
 */
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Standard normal PDF φ(x).
 * @param {number} x
 * @returns {number}
 */
export function standardPdf(x) {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Standard normal CDF Φ(x).
 * @param {number} x
 * @returns {number}
 */
export function standardCdf(x) {
  return 0.5 * (1 + erf(x * INV_SQRT_2));
}

/**
 * TrueSkill v for a decisive win (no draw).
 * t = (μ_winner − μ_loser) / c
 * @param {number} t
 * @returns {number}
 */
export function vWin(t) {
  const denom = standardCdf(t);
  if (denom < 1e-12) {
    return t < 0 ? -t : 0;
  }
  return standardPdf(t) / denom;
}

/**
 * TrueSkill w for a decisive win (no draw).
 * @param {number} t
 * @returns {number}
 */
export function wWin(t) {
  const v = vWin(t);
  const w = v * (v + t);
  return Number.isFinite(w) ? Math.max(0, w) : 0;
}

export function getMu(player) {
  if (player == null) return DEFAULT_MU;
  if (typeof player.mu === 'number' && Number.isFinite(player.mu)) return player.mu;
  if (typeof player.rating === 'number' && Number.isFinite(player.rating)) return player.rating;
  return DEFAULT_MU;
}

export function getSigma(player) {
  if (player == null) return DEFAULT_SIGMA;
  if (typeof player.sigma === 'number' && Number.isFinite(player.sigma) && player.sigma > 0) {
    return player.sigma;
  }
  return DEFAULT_SIGMA;
}

/**
 * Update winner/loser TrueSkill ratings after a decisive 1v1 comparison.
 * @param {{mu?: number, sigma?: number}} winner
 * @param {{mu?: number, sigma?: number}} loser
 * @param {{beta?: number, tau?: number}} [options]
 * @returns {{winner: {mu: number, sigma: number}, loser: {mu: number, sigma: number}}}
 */
export function updateTrueSkill(winner, loser, options = {}) {
  const beta = options.beta ?? DEFAULT_BETA;
  const tau = options.tau ?? DEFAULT_TAU;

  const muWinner = getMu(winner);
  const muLoser = getMu(loser);
  const sigmaWinner = Math.sqrt(getSigma(winner) ** 2 + tau * tau);
  const sigmaLoser = Math.sqrt(getSigma(loser) ** 2 + tau * tau);

  const c2 = 2 * beta * beta + sigmaWinner * sigmaWinner + sigmaLoser * sigmaLoser;
  const c = Math.sqrt(Math.max(c2, 1e-12));
  const t = (muWinner - muLoser) / c;
  const v = vWin(t);
  const w = wWin(t);

  const winnerVar = sigmaWinner * sigmaWinner;
  const loserVar = sigmaLoser * sigmaLoser;

  const newMuWinner = muWinner + (winnerVar / c) * v;
  const newMuLoser = muLoser - (loserVar / c) * v;

  const winnerFactor = 1 - (winnerVar / c2) * w;
  const loserFactor = 1 - (loserVar / c2) * w;

  const newSigmaWinner = Math.max(MIN_SIGMA, Math.sqrt(winnerVar * Math.max(winnerFactor, 1e-6)));
  const newSigmaLoser = Math.max(MIN_SIGMA, Math.sqrt(loserVar * Math.max(loserFactor, 1e-6)));

  return {
    winner: { mu: newMuWinner, sigma: newSigmaWinner },
    loser: { mu: newMuLoser, sigma: newSigmaLoser },
  };
}
