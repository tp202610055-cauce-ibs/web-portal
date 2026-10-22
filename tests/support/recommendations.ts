import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import type { components } from '@/shared/infrastructure/api/generated/schema';

type PendingReviewDto = components['schemas']['PendingReviewRecommendationDto'];
type PendingReviewPageDto = components['schemas']['PendingReviewRecommendationDtoPagedResult'];
type RecommendationDetailDto = components['schemas']['RecommendationDetailDto'];
type SupportingDataDto = components['schemas']['RecommendationSupportingDataDto'];

// Synthetic recommendations of synthetic patients ("Paciente Prueba A" and "B"); never real people.
export const REVIEW_PATIENT_ID = '00000000-0000-4000-8000-0000000000a1';
export const PENDING_ID = '00000000-0000-4000-8000-0000000000d1';
export const OVERDUE_ID = '00000000-0000-4000-8000-0000000000d2';

// Literal notes of CP036, CP045 and CP046, and the boundary values of the 10-character minimum.
export const NOTE_CP036 = 'Reducir cebolla y ajo por intolerancia a FODMAP';
export const NOTE_CP045 = 'Reducir lácteos por intolerancia a la lactosa';
export const NOTE_CP046 = 'Riesgo de deficiencia de calcio sin supervisión';
export const NOTE_NINE = 'Muy poco.';
export const NOTE_TEN = 'Ajuste OK.';

// CP086: the edited step and the 36-character note.
export const STEP_CP086 = 'Cocinar la zanahoria al vapor durante 15 minutos';
export const NOTE_CP086 = 'Ajuste por intolerancia a la lactosa';

export function pendingReviewBody(overrides: Partial<PendingReviewDto> = {}): PendingReviewDto {
  return {
    recommendationId: PENDING_ID,
    patientId: REVIEW_PATIENT_ID,
    patientFullName: 'Paciente Prueba A',
    status: 'PendingReview',
    confidenceScore: 0.82,
    itemsCount: 3,
    generatedAt: '2026-10-20T14:30:00Z',
    expiresAt: '2026-10-27T14:30:00Z',
    ...overrides,
  };
}

// Oldest first, as the server orders the queue: one pending for more than 24 hours, then a recent one.
export const queueItems: PendingReviewDto[] = [
  pendingReviewBody({
    recommendationId: OVERDUE_ID,
    patientId: '00000000-0000-4000-8000-0000000000a2',
    patientFullName: 'Paciente Prueba B',
    confidenceScore: 0.55,
    itemsCount: 1,
    generatedAt: '2026-10-19T08:00:00Z',
    expiresAt: null,
  }),
  pendingReviewBody(),
];

export function pendingPageBody(
  items: PendingReviewDto[] = queueItems,
  overrides: Partial<PendingReviewPageDto> = {},
): PendingReviewPageDto {
  return { items, page: 1, pageSize: 20, totalCount: items.length, ...overrides };
}

export const supportingDataBody: SupportingDataDto = {
  symptomCountsLast14d: 9,
  mealCountsLast14d: 31,
  topFodmapHighFoodsLast14d: ['Cebolla', 'Ajo'],
  correlationWindowHours: 4,
  analysisWindowFrom: '2026-10-07T15:00:00Z',
  analysisWindowTo: '2026-10-21T15:00:00Z',
};

// CP036: suggests cooked carrot, reduces onion and substitutes garlic, each with its FODMAP reason.
export function detailBody(
  overrides: Partial<RecommendationDetailDto> = {},
): RecommendationDetailDto {
  return {
    recommendationId: PENDING_ID,
    patientId: REVIEW_PATIENT_ID,
    modelVersionName: 'rule-v1.0.0',
    status: 'PendingReview',
    confidenceScore: 0.82,
    autoApproved: false,
    reviewedByNutritionistId: null,
    nutritionistNote: null,
    aiExplanation: 'Tus registros muestran hinchazón después de comidas con cebolla y ajo.',
    explanationSource: 'LlmGenerated',
    generatedAt: '2026-10-20T14:30:00Z',
    reviewedAt: null,
    deliveredAt: null,
    expiresAt: '2026-10-27T14:30:00Z',
    items: [
      {
        recommendationItemId: '00000000-0000-4000-8000-0000000000e1',
        foodId: '00000000-0000-4000-8000-0000000000f1',
        foodName: 'Zanahoria cocida',
        category: 'Verduras',
        actionType: 'Suggest',
        substituteFoodId: null,
        substituteFoodName: null,
        reasoning: 'Bajo contenido de FODMAP.',
      },
      {
        recommendationItemId: '00000000-0000-4000-8000-0000000000e2',
        foodId: '00000000-0000-4000-8000-0000000000f2',
        foodName: 'Cebolla',
        category: 'Verduras',
        actionType: 'Reduce',
        substituteFoodId: null,
        substituteFoodName: null,
        reasoning: 'Alto contenido de fructanos.',
      },
      {
        recommendationItemId: '00000000-0000-4000-8000-0000000000e3',
        foodId: '00000000-0000-4000-8000-0000000000f3',
        foodName: 'Ajo',
        category: 'Verduras',
        actionType: 'Substitute',
        substituteFoodId: '00000000-0000-4000-8000-0000000000f4',
        substituteFoodName: 'Aceite infusionado con ajo',
        reasoning: 'El aceite conserva el sabor sin los fructanos.',
      },
    ],
    // The snapshot does not mark these as nullable, but the backend sends null without feedback or archive.
    feedback: null as unknown as RecommendationDetailDto['feedback'],
    archiveReason: null as unknown as RecommendationDetailDto['archiveReason'],
    reviewedByNutritionistName: null,
    steps: ['Cocina con aceite infusionado en lugar de ajo.', 'Registra tus síntomas cada día.'],
    supportingData: supportingDataBody,
    title: 'Reducir cebolla y ajo',
    description: 'Ajuste de alimentos con FODMAP altos durante dos semanas.',
    source: 'EngineGenerated',
    isActive: true,
    archivedAt: null,
    validUntil: null,
    allowedActions: ['Approve', 'Modify', 'Reject'],
    ...overrides,
  };
}

const reviewed: Partial<RecommendationDetailDto> = {
  nutritionistNote: NOTE_CP036,
  reviewedByNutritionistName: 'Nutricionista Prueba',
  reviewedAt: '2026-10-20T16:00:00Z',
};

// CP048: R1 approved as generated, R2 approved with changes, R3 manual and R4 rejected.
export const approvedR1 = detailBody({
  ...reviewed,
  status: 'Approved',
  allowedActions: ['Archive'],
});
export const modifiedR2 = detailBody({
  ...reviewed,
  status: 'ModifiedApproved',
  allowedActions: ['Archive'],
});
export const manualR3 = detailBody({
  ...reviewed,
  status: 'ManualApproved',
  source: 'Manual',
  explanationSource: 'Manual',
  aiExplanation: null,
  confidenceScore: 1,
  modelVersionName: '',
  title: 'Hidratación entre comidas',
  allowedActions: ['Archive'],
});
export const rejectedR4 = detailBody({
  ...reviewed,
  status: 'Rejected',
  nutritionistNote: NOTE_CP046,
  title: 'Eliminar todos los lácteos',
  allowedActions: [],
});
// Opening the detail may expire it: the server answers with the new state and no actions.
export const expiredOnOpen = detailBody({
  status: 'Expired',
  expiresAt: '2026-10-19T14:30:00Z',
  allowedActions: [],
});

export const CARROT_ID = '00000000-0000-4000-8000-0000000000f1';
export const ONION_ID = '00000000-0000-4000-8000-0000000000f2';
export const GARLIC_ID = '00000000-0000-4000-8000-0000000000f3';

function reduceItem(index: number, foodId: string, foodName: string) {
  return {
    recommendationItemId: `00000000-0000-4000-8000-0000000000c${index}`,
    foodId,
    foodName,
    category: 'Verduras',
    actionType: 'Reduce' as const,
    substituteFoodId: null,
    substituteFoodName: null,
    reasoning: 'Alto contenido de fructanos.',
  };
}

// CP047 and CP086: «Reducir cebolla y ajo», with cooked carrot suggested and one step.
export const cp086Pending = detailBody({
  items: [
    { ...reduceItem(1, CARROT_ID, 'Zanahoria cocida'), actionType: 'Suggest', reasoning: null },
    reduceItem(2, ONION_ID, 'Cebolla'),
    reduceItem(3, GARLIC_ID, 'Ajo'),
  ],
  steps: ['Cocinar la zanahoria al vapor'],
});

export function fakeRecommendationsGateway(
  overrides: Partial<RecommendationsGateway> = {},
): RecommendationsGateway {
  return {
    listPendingReview: () => new Promise(() => undefined),
    getDetail: () => new Promise(() => undefined),
    approve: () => new Promise(() => undefined),
    reject: () => new Promise(() => undefined),
    modify: () => new Promise(() => undefined),
    ...overrides,
  };
}
