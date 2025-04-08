/**
 * Elo Rating System for Photo Comparisons
 *
 * This implementation uses the Elo rating system to rank photos based on pairwise comparisons.
 * It also calculates uncertainty and determines which comparisons would be most informative.
 */

// Default K-factor (determines how much ratings change after each comparison)
export const DEFAULT_K = 32

// Default starting rating
export const DEFAULT_RATING = 1400

// Default uncertainty (higher means less confident in the rating)
export const DEFAULT_UNCERTAINTY = 400

/**
 * Calculate the expected score (probability of winning) for a player
 * @param {number} ratingA - Rating of player A
 * @param {number} ratingB - Rating of player B
 * @returns {number} - Expected score between 0 and 1
 */
export function calculateExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Update ratings after a comparison
 * @param {number} ratingWinner - Current rating of the winner
 * @param {number} ratingLoser - Current rating of the loser
 * @param {number} kFactor - K-factor determining how much ratings change
 * @returns {object} - New ratings for winner and loser
 */
export function updateRatings(ratingWinner, ratingLoser, kFactor = DEFAULT_K) {
  const expectedWinner = calculateExpectedScore(ratingWinner, ratingLoser)
  const expectedLoser = calculateExpectedScore(ratingLoser, ratingWinner)

  const newRatingWinner = Math.round(ratingWinner + kFactor * (1 - expectedWinner))
  const newRatingLoser = Math.round(ratingLoser + kFactor * (0 - expectedLoser))

  return {
    winner: newRatingWinner,
    loser: newRatingLoser,
  }
}

/**
 * Update uncertainties after a comparison
 * @param {number} uncertaintyWinner - Current uncertainty of the winner
 * @param {number} uncertaintyLoser - Current uncertainty of the loser
 * @returns {object} - New uncertainties for winner and loser
 */
export function updateUncertainties(uncertaintyWinner, uncertaintyLoser) {
  // Reduce uncertainty more when it's higher
  const newUncertaintyWinner = Math.max(uncertaintyWinner * 0.95, 50)
  const newUncertaintyLoser = Math.max(uncertaintyLoser * 0.95, 50)

  return {
    winner: newUncertaintyWinner,
    loser: newUncertaintyLoser,
  }
}

/**
 * Calculate the information gain from a potential comparison
 * Higher values indicate more informative comparisons
 * @param {object} imageA - First image with rating and uncertainty
 * @param {object} imageB - Second image with rating and uncertainty
 * @returns {number} - Information gain score
 */
export function calculateInformationGain(imageA, imageB) {
  // Comparisons are more informative when:
  // 1. Ratings are close (outcome is uncertain)
  // 2. Uncertainties are high (we're not confident in current ratings)
  // 3. Images haven't been compared many times

  const ratingDiff = Math.abs(imageA.rating - imageB.rating)
  const combinedUncertainty = imageA.uncertainty + imageB.uncertainty
  const combinedComparisons = (imageA.comparisons || 0) + (imageB.comparisons || 0)

  // Normalize rating difference (closer to 0 is better)
  const normalizedRatingDiff = Math.max(0, 1 - ratingDiff / 400)

  // Weight factors
  const RATING_WEIGHT = 0.4
  const UNCERTAINTY_WEIGHT = 0.4
  const COMPARISON_WEIGHT = 0.2

  return (
    RATING_WEIGHT * normalizedRatingDiff +
    UNCERTAINTY_WEIGHT * (combinedUncertainty / (2 * DEFAULT_UNCERTAINTY)) +
    COMPARISON_WEIGHT * (1 / (combinedComparisons + 1))
  )
}

/**
 * Find the most informative comparison from a list of potential pairs
 * @param {Array} images - Array of images with ratings and uncertainties
 * @param {Array} remainingPairs - Array of remaining image ID pairs
 * @returns {Array} - The most informative pair [leftId, rightId]
 */
export function findMostInformativePair(images, remainingPairs) {
  if (remainingPairs.length === 0) return null

  let bestPair = remainingPairs[0]
  let highestInfoGain = -1

  for (const pair of remainingPairs) {
    const [leftId, rightId] = pair
    const leftImage = images.find((img) => img.id === leftId)
    const rightImage = images.find((img) => img.id === rightId)

    if (!leftImage || !rightImage) continue

    const infoGain = calculateInformationGain(leftImage, rightImage)

    if (infoGain > highestInfoGain) {
      highestInfoGain = infoGain
      bestPair = pair
    }
  }

  return bestPair
}

/**
 * Calculate confidence percentage based on uncertainty
 * @param {number} uncertainty - Uncertainty value
 * @returns {number} - Confidence percentage (0-100)
 */
export function calculateConfidence(uncertainty) {
  // Map uncertainty from [50, DEFAULT_UNCERTAINTY] to [100, 0]
  const normalizedUncertainty = Math.min(Math.max(uncertainty, 50), DEFAULT_UNCERTAINTY)
  const confidencePercent = 100 - ((normalizedUncertainty - 50) / (DEFAULT_UNCERTAINTY - 50)) * 100
  return Math.round(confidencePercent)
}

/**
 * Determine if we have enough confidence in our rankings
 * @param {Array} images - Array of images with ratings and uncertainties
 * @param {number} minConfidence - Minimum confidence percentage required
 * @param {number} minComparisons - Minimum number of comparisons per image
 * @returns {boolean} - True if we have enough confidence
 */
export function hasEnoughConfidence(images, minConfidence = 70, minComparisons = 3) {
  // Check if all images have been compared at least minComparisons times
  const allComparedEnough = images.every((img) => (img.comparisons || 0) >= minComparisons)

  // Check if average confidence is above threshold
  const avgConfidence =
    images.reduce((sum, img) => sum + calculateConfidence(img.uncertainty || DEFAULT_UNCERTAINTY), 0) / images.length

  return allComparedEnough && avgConfidence >= minConfidence
}
