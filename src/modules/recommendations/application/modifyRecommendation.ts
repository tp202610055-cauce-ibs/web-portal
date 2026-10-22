import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import type {
  FoodAction,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';
import type { RecommendationDraft } from '@/modules/recommendations/domain/recommendationDraft';

export interface ModificationItem {
  readonly foodId: string;
  readonly actionType: FoodAction;
  readonly reasoning: string | null;
  readonly substituteFoodId: string | null;
}

// A null field keeps what the recommendation has; an empty step list erases its steps.
export interface ModificationRequest {
  readonly clinicalNote: string;
  readonly title: string | null;
  readonly description: string | null;
  readonly steps: string[] | null;
  readonly items: ModificationItem[] | null;
}

function changedText(edited: string, original: string | null): string | null {
  const text = edited.trim();
  return text === (original ?? '').trim() ? null : text;
}

function changedSteps(edited: string[], original: string[]): string[] | null {
  const steps = edited.map((step) => step.trim()).filter((step) => step !== '');
  const same = steps.length === original.length && steps.every((step, i) => step === original[i]);
  return same ? null : steps;
}

// Once the draft touches the food list, the whole list travels; untouched, the server keeps it.
export function buildModification(
  original: RecommendationDetail,
  draft: RecommendationDraft,
  note: string,
): ModificationRequest {
  return {
    clinicalNote: note.trim(),
    title: changedText(draft.title, original.title),
    description: changedText(draft.description, original.description),
    steps: changedSteps(draft.steps, original.steps),
    items: draft.itemsTouched
      ? draft.items.map((item) => ({
          foodId: item.foodId,
          actionType: item.action,
          reasoning: item.reasoning.trim() === '' ? null : item.reasoning.trim(),
          substituteFoodId: item.substituteFoodId,
        }))
      : null,
  };
}

export function hasChanges(request: ModificationRequest): boolean {
  return (
    request.title !== null ||
    request.description !== null ||
    request.steps !== null ||
    request.items !== null
  );
}

export function submitModification(
  gateway: RecommendationsGateway,
  recommendationId: string,
  request: ModificationRequest,
  idempotencyKey: string,
): Promise<void> {
  return gateway.modify(recommendationId, request, idempotencyKey);
}
