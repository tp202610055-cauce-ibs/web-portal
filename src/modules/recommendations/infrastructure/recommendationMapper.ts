import { z } from 'zod';

import type {
  PatientRecommendationsPage,
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

// Declared as a plain enum, but null while the recommendation is active.
const archiveReason = z
  .enum(['TemporalExpiration', 'ManualSubstitution', 'ObjectiveMet', 'PlanChange'])
  .nullable();

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
  isActive: z.boolean(),
  archivedAt: instant.nullable(),
  archiveReason,
});

const patientPage = z.object({
  items: z
    .array(
      z.object({
        recommendationId: z.string().min(1),
        status: z.enum(STATUSES),
        source: z.enum(['EngineGenerated', 'Manual']),
        title: z.string().nullable(),
        itemsCount: z.number().int().nonnegative(),
        generatedAt: instant,
        validUntil: instant.nullable(),
        isActive: z.boolean(),
        archivedAt: instant.nullable(),
        archiveReason,
        foods: z
          .array(
            z.object({
              foodName: z.string().nullable(),
              actionType: z.enum(['Suggest', 'Reduce', 'Avoid', 'Substitute']),
              substituteFoodName: z.string().nullable(),
            }),
          )
          .nullable()
          .optional(),
      }),
    )
    .nullable(),
  totalCount: z.number().int().nonnegative(),
});

// Newest first, as the server orders them; active and archived come in the same list.
export function toPatientRecommendationsPage(payload: unknown): PatientRecommendationsPage {
  const parsed = patientPage.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('PatientRecommendationForNutritionistDtoPagedResult');
  }
  const items = (parsed.data.items ?? []).map(({ foods, ...row }) => ({
    ...row,
    foods: (foods ?? []).map((food) => ({
      foodName: food.foodName,
      action: food.actionType,
      substituteFoodName: food.substituteFoodName,
    })),
  }));
  return { items, totalCount: parsed.data.totalCount };
}

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
