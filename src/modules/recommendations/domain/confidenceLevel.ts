import type { RecommendationSource } from '@/modules/recommendations/domain/Recommendation';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

// Cut points of the engine thresholds, the same ones the mobile app shows.
export const HIGH_CONFIDENCE = 0.7;
export const MEDIUM_CONFIDENCE = 0.45;

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= HIGH_CONFIDENCE) {
    return 'High';
  }
  return score >= MEDIUM_CONFIDENCE ? 'Medium' : 'Low';
}

// A manual recommendation carries a fixed 1.0 with no model behind it, so it shows no confidence.
export function shownConfidence(
  source: RecommendationSource,
  score: number,
): ConfidenceLevel | null {
  return source === 'Manual' ? null : confidenceLevel(score);
}
