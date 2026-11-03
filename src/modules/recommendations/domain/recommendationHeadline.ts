import type { FoodAction } from '@/modules/recommendations/domain/Recommendation';

export interface FoodPreview {
  readonly foodName: string | null;
  readonly action: FoodAction;
  readonly substituteFoodName: string | null;
}

export type HeadlineTitle =
  | { readonly kind: 'server'; readonly text: string }
  | { readonly kind: 'tally'; readonly parts: { action: FoodAction; count: number }[] }
  | { readonly kind: 'none' };

export interface Headline {
  readonly title: HeadlineTitle;
  readonly foodNames: string[];
  readonly moreFoods: number;
}

// The order and the three named foods of the mobile app, so both apps title a row the same way.
const DISPLAY_ORDER: readonly FoodAction[] = ['Avoid', 'Substitute', 'Reduce', 'Suggest'];
export const NAMED_FOODS = 3;

export function recommendationHeadline(title: string | null, foods: FoodPreview[]): Headline {
  const names = [
    ...new Set(foods.flatMap((food) => (food.foodName === null ? [] : [food.foodName]))),
  ];
  const detail = {
    foodNames: names.slice(0, NAMED_FOODS),
    moreFoods: Math.max(0, names.length - NAMED_FOODS),
  };
  const own = title?.trim() ?? '';
  if (own !== '') {
    return { title: { kind: 'server', text: own }, ...detail };
  }
  const parts = DISPLAY_ORDER.map((action) => ({
    action,
    count: foods.filter((food) => food.action === action).length,
  })).filter((part) => part.count > 0);
  return { title: parts.length === 0 ? { kind: 'none' } : { kind: 'tally', parts }, ...detail };
}
