import type {
  FoodAction,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';

export const TITLE_MAX_LENGTH = 200;

export interface DraftFood {
  readonly foodId: string;
  readonly name: string | null;
}

// One editable food; `key` keeps each row stable while foods are added and removed.
export interface DraftItem {
  readonly key: string;
  readonly foodId: string;
  readonly foodName: string | null;
  readonly action: FoodAction;
  readonly reasoning: string;
  readonly substituteFoodId: string | null;
  readonly substituteFoodName: string | null;
}

// What the nutritionist is editing; `itemsTouched` says the food list must travel in full.
export interface RecommendationDraft {
  readonly title: string;
  readonly description: string;
  readonly steps: string[];
  readonly items: DraftItem[];
  readonly itemsTouched: boolean;
}

export type TitleProblem = 'empty' | 'too-long';
export type ItemProblem = 'substitute-required' | 'substitute-same';

export interface DraftProblems {
  readonly title: TitleProblem | null;
  readonly description: 'empty' | null;
  readonly noItems: boolean;
  readonly items: Readonly<Record<string, ItemProblem>>;
}

export function draftFrom(detail: RecommendationDetail): RecommendationDraft {
  return {
    title: detail.title ?? '',
    description: detail.description ?? '',
    steps: [...detail.steps],
    items: detail.items.map((item) => ({
      key: item.recommendationItemId,
      foodId: item.foodId,
      foodName: item.foodName,
      action: item.action,
      reasoning: item.reasoning ?? '',
      substituteFoodId: item.substituteFoodId,
      substituteFoodName: item.substituteFoodName,
    })),
    itemsTouched: false,
  };
}

function itemProblem(item: DraftItem): ItemProblem | null {
  if (item.action !== 'Substitute') {
    return null;
  }
  if (item.substituteFoodId === null) {
    return 'substitute-required';
  }
  return item.substituteFoodId === item.foodId ? 'substitute-same' : null;
}

// The server applies whatever arrives, so blanks that would erase content are caught here first.
export function checkDraft(
  original: RecommendationDetail,
  draft: RecommendationDraft,
): DraftProblems {
  const title = draft.title.trim();
  const items: Record<string, ItemProblem> = {};
  for (const item of draft.items) {
    const problem = itemProblem(item);
    if (problem !== null) {
      items[item.key] = problem;
    }
  }
  return {
    title: title === '' ? 'empty' : title.length > TITLE_MAX_LENGTH ? 'too-long' : null,
    description:
      draft.description.trim() === '' && (original.description ?? '').trim() !== ''
        ? 'empty'
        : null,
    noItems: draft.items.length === 0,
    items,
  };
}

export function hasProblems(problems: DraftProblems): boolean {
  return (
    problems.title !== null ||
    problems.description !== null ||
    problems.noItems ||
    Object.keys(problems.items).length > 0
  );
}

function updateItem(
  draft: RecommendationDraft,
  key: string,
  change: (item: DraftItem) => DraftItem,
): RecommendationDraft {
  return {
    ...draft,
    items: draft.items.map((item) => (item.key === key ? change(item) : item)),
    itemsTouched: true,
  };
}

// Only a substitution may carry a substitute: any other action clears it, as the server requires.
export function withAction(
  draft: RecommendationDraft,
  key: string,
  action: FoodAction,
): RecommendationDraft {
  return updateItem(draft, key, (item) =>
    action === 'Substitute'
      ? { ...item, action }
      : { ...item, action, substituteFoodId: null, substituteFoodName: null },
  );
}

export function withReasoning(
  draft: RecommendationDraft,
  key: string,
  reasoning: string,
): RecommendationDraft {
  return updateItem(draft, key, (item) => ({ ...item, reasoning }));
}

export function withSubstitute(
  draft: RecommendationDraft,
  key: string,
  food: DraftFood,
): RecommendationDraft {
  return updateItem(draft, key, (item) => ({
    ...item,
    substituteFoodId: food.foodId,
    substituteFoodName: food.name,
  }));
}

export function withoutItem(draft: RecommendationDraft, key: string): RecommendationDraft {
  return { ...draft, items: draft.items.filter((item) => item.key !== key), itemsTouched: true };
}

// A food added from the search starts as Reduce; a food already in the list is never added twice.
export function withFood(
  draft: RecommendationDraft,
  food: DraftFood,
  key: string,
): RecommendationDraft {
  if (draft.items.some((item) => item.foodId === food.foodId)) {
    return draft;
  }
  const added: DraftItem = {
    key,
    foodId: food.foodId,
    foodName: food.name,
    action: 'Reduce',
    reasoning: '',
    substituteFoodId: null,
    substituteFoodName: null,
  };
  return { ...draft, items: [...draft.items, added], itemsTouched: true };
}
