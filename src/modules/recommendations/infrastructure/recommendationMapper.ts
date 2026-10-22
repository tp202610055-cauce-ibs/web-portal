import { z } from 'zod';

import type {
  PendingReviewPage,
  RecommendationAction,
  RecommendationDetail,
} from '@/modules/recommendations/domain/Recommendation';
import { ContractViolationError } from '@/shared/domain/errors';

const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

const STATUSES = [
  'Generated',
  'PendingReview',
  'Approved',
  'ModifiedApproved',
  'ManualApproved',
  'Rejected',
  'Delivered',
  'FeedbackReceived',
  'Expired',
] as const;

const ACTIONS: readonly string[] = ['Approve', 'Modify', 'Reject', 'Archive'];

function isKnownAction(value: string): value is RecommendationAction {
  return ACTIONS.includes(value);
}

// Always sent, but declared nullable: null means no actions, and an unknown action is never offered.
const allowedActions = z
  .array(z.string())
  .nullable()
  .transform((values) => (values ?? []).filter(isKnownAction));

// The server sends an empty name when no model produced the recommendation.
const modelVersionName = z
  .string()
  .nullable()
  .transform((value) => (value === null || value.trim() === '' ? null : value));

const pendingPage = z.object({
  items: z
    .array(
      z.object({
        recommendationId: z.string().min(1),
        patientId: z.string().min(1),
        patientFullName: z.string().nullable(),
        status: z.enum(STATUSES),
        confidenceScore: z.number(),
        itemsCount: z.number().int().nonnegative(),
        generatedAt: instant,
        expiresAt: instant.nullable(),
      }),
    )
    .nullable(),
  page: z.number().int(),
  pageSize: z.number().int(),
  totalCount: z.number().int().nonnegative(),
});

const detail = z.object({
  recommendationId: z.string().min(1),
  patientId: z.string().min(1),
  modelVersionName,
  status: z.enum(STATUSES),
  confidenceScore: z.number(),
  nutritionistNote: z.string().nullable(),
  aiExplanation: z.string().nullable(),
  explanationSource: z.enum(['LlmGenerated', 'Fallback', 'Manual']),
  generatedAt: instant,
  reviewedAt: instant.nullable(),
  expiresAt: instant.nullable(),
  items: z
    .array(
      z.object({
        recommendationItemId: z.string().min(1),
        foodId: z.string().min(1),
        foodName: z.string().nullable(),
        actionType: z.enum(['Suggest', 'Reduce', 'Avoid', 'Substitute']),
        substituteFoodId: z.string().min(1).nullable(),
        substituteFoodName: z.string().nullable(),
        reasoning: z.string().nullable(),
      }),
    )
    .nullable(),
  reviewedByNutritionistName: z.string().nullable(),
  steps: z.array(z.string()).nullable(),
  supportingData: z.object({
    symptomCountsLast14d: z.number().int().nonnegative(),
    mealCountsLast14d: z.number().int().nonnegative(),
    topFodmapHighFoodsLast14d: z.array(z.string()).nullable(),
    correlationWindowHours: z.number().int().nonnegative(),
    analysisWindowFrom: instant,
    analysisWindowTo: instant,
  }),
  title: z.string().nullable(),
  description: z.string().nullable(),
  source: z.enum(['EngineGenerated', 'Manual']),
  allowedActions,
});

// The queue keeps the server order: oldest generation first.
export function toPendingReviewPage(payload: unknown): PendingReviewPage {
  const parsed = pendingPage.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('PendingReviewRecommendationDtoPagedResult');
  }
  return { ...parsed.data, items: parsed.data.items ?? [] };
}

export function toRecommendationDetail(payload: unknown): RecommendationDetail {
  const parsed = detail.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('RecommendationDetailDto');
  }
  const { items, steps, supportingData, ...rest } = parsed.data;
  return {
    ...rest,
    steps: steps ?? [],
    items: (items ?? []).map((item) => ({
      recommendationItemId: item.recommendationItemId,
      foodId: item.foodId,
      foodName: item.foodName,
      action: item.actionType,
      substituteFoodId: item.substituteFoodId,
      substituteFoodName: item.substituteFoodName,
      reasoning: item.reasoning,
    })),
    supportingData: {
      symptomCount: supportingData.symptomCountsLast14d,
      mealCount: supportingData.mealCountsLast14d,
      topHighFodmapFoods: supportingData.topFodmapHighFoodsLast14d ?? [],
      correlationWindowHours: supportingData.correlationWindowHours,
      windowFrom: supportingData.analysisWindowFrom,
      windowTo: supportingData.analysisWindowTo,
    },
  };
}
