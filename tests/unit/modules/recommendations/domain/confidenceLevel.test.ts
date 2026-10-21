import { describe, expect, it } from 'vitest';

import { confidenceLevel, shownConfidence } from '@/modules/recommendations/domain/confidenceLevel';

describe('confidenceLevel', () => {
  it.each([
    [1, 'High'],
    [0.7, 'High'],
    [0.69, 'Medium'],
    [0.45, 'Medium'],
    [0.44, 'Low'],
    [0, 'Low'],
  ])('score_%s_is%s', (score, level) => {
    expect(confidenceLevel(score)).toBe(level);
  });
});

describe('shownConfidence', () => {
  it('engineRecommendation_showsItsLevel', () => {
    expect(shownConfidence('EngineGenerated', 0.5)).toBe('Medium');
  });

  it('manualRecommendation_showsNoConfidence', () => {
    expect(shownConfidence('Manual', 1)).toBeNull();
  });
});
