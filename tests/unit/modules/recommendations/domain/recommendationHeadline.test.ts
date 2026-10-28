import { describe, expect, it } from 'vitest';

import { recommendationHeadline } from '@/modules/recommendations/domain/recommendationHeadline';

const food = (foodName: string, action: 'Suggest' | 'Reduce' | 'Avoid' | 'Substitute') => ({
  foodName,
  action,
  substituteFoodName: null,
});

// Same rule as the mobile app (recommendation_headline): the server title wins; otherwise the
// count per action in the order avoid, substitute, reduce, suggest, and up to three food names.
describe('recommendationHeadline', () => {
  it('cp074_engineRows_countTheirActions_andNameTheirFoods', () => {
    expect(
      recommendationHeadline(null, [
        food('Cebolla cocida', 'Reduce'),
        food('Pan de trigo blanco', 'Reduce'),
      ]),
    ).toEqual({
      title: { kind: 'tally', parts: [{ action: 'Reduce', count: 2 }] },
      foodNames: ['Cebolla cocida', 'Pan de trigo blanco'],
      moreFoods: 0,
    });
  });

  it('mixedActions_followTheMobileOrder_andNamesAreUniqueUpToThree', () => {
    const headline = recommendationHeadline('  ', [
      food('Zanahoria cocida', 'Suggest'),
      food('Cebolla cocida', 'Reduce'),
      food('Leche entera de vaca', 'Avoid'),
      food('Cebolla cocida', 'Substitute'),
      food('Queso fresco', 'Avoid'),
    ]);

    expect(headline.title).toEqual({
      kind: 'tally',
      parts: [
        { action: 'Avoid', count: 2 },
        { action: 'Substitute', count: 1 },
        { action: 'Reduce', count: 1 },
        { action: 'Suggest', count: 1 },
      ],
    });
    expect(headline.foodNames).toEqual([
      'Zanahoria cocida',
      'Cebolla cocida',
      'Leche entera de vaca',
    ]);
    expect(headline.moreFoods).toBe(1);
  });

  it('aServerTitle_winsAndKeepsTheFoodsAsDetail', () => {
    expect(recommendationHeadline(' Reducir legumbres ', [])).toEqual({
      title: { kind: 'server', text: 'Reducir legumbres' },
      foodNames: [],
      moreFoods: 0,
    });
  });

  it('withoutTitleOrFoods_hasNoHeadline', () => {
    expect(recommendationHeadline(null, []).title).toEqual({ kind: 'none' });
  });
});
