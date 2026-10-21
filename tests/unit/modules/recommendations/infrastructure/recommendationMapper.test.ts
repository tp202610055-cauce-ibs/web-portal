import { describe, expect, it } from 'vitest';

import {
  toPendingReviewPage,
  toRecommendationDetail,
} from '@/modules/recommendations/infrastructure/recommendationMapper';
import { ContractViolationError } from '@/shared/domain/errors';

import {
  detailBody,
  manualR3,
  OVERDUE_ID,
  PENDING_ID,
  pendingPageBody,
  pendingReviewBody,
  supportingDataBody,
} from '../../../../support/recommendations';

describe('toPendingReviewPage', () => {
  it('page_keepsTheServerOrderAndDates', () => {
    const page = toPendingReviewPage(pendingPageBody());

    expect(page.items.map((item) => item.recommendationId)).toEqual([OVERDUE_ID, PENDING_ID]);
    expect(page.items[0]?.generatedAt).toEqual(new Date('2026-10-19T08:00:00Z'));
    expect(page.items[0]?.expiresAt).toBeNull();
    expect(page.totalCount).toBe(2);
  });

  it('page_withNullItems_isEmpty', () => {
    expect(toPendingReviewPage(pendingPageBody([], { items: null })).items).toEqual([]);
  });

  it('page_withUnknownStatus_isContractViolation', () => {
    const body = pendingPageBody([pendingReviewBody({ status: 'Archived' as never })]);

    expect(() => toPendingReviewPage(body)).toThrow(ContractViolationError);
  });
});

describe('toRecommendationDetail', () => {
  it('detail_mapsTheContentTheReviewShows', () => {
    const detail = toRecommendationDetail(detailBody());

    expect(detail.status).toBe('PendingReview');
    expect(detail.allowedActions).toEqual(['Approve', 'Modify', 'Reject']);
    expect(detail.items[2]).toEqual({
      recommendationItemId: '00000000-0000-4000-8000-0000000000e3',
      foodName: 'Ajo',
      action: 'Substitute',
      substituteFoodName: 'Aceite infusionado con ajo',
      reasoning: 'El aceite conserva el sabor sin los fructanos.',
    });
    expect(detail.supportingData).toEqual({
      symptomCount: 9,
      mealCount: 31,
      topHighFodmapFoods: ['Cebolla', 'Ajo'],
      correlationWindowHours: 4,
      windowFrom: new Date('2026-10-07T15:00:00Z'),
      windowTo: new Date('2026-10-21T15:00:00Z'),
    });
    expect(detail.modelVersionName).toBe('rule-v1.0.0');
  });

  it('detail_withNullAllowedActions_offersNoAction', () => {
    expect(toRecommendationDetail(detailBody({ allowedActions: null })).allowedActions).toEqual([]);
  });

  it('detail_withUnknownAllowedAction_dropsIt', () => {
    const body = detailBody({ allowedActions: ['Approve', 'Publish' as never] });

    expect(toRecommendationDetail(body).allowedActions).toEqual(['Approve']);
  });

  it('detail_withNullLists_usesEmptyLists', () => {
    const body = detailBody({
      items: null,
      steps: null,
      supportingData: { ...supportingDataBody, topFodmapHighFoodsLast14d: null },
    });

    const detail = toRecommendationDetail(body);

    expect(detail.items).toEqual([]);
    expect(detail.steps).toEqual([]);
    expect(detail.supportingData.topHighFodmapFoods).toEqual([]);
  });

  it('manualDetail_withEmptyModelName_hasNoModel', () => {
    const detail = toRecommendationDetail(manualR3);

    expect(detail.modelVersionName).toBeNull();
    expect(detail.source).toBe('Manual');
    expect(detail.aiExplanation).toBeNull();
  });

  it('detail_withoutStatus_isContractViolation', () => {
    expect(() => toRecommendationDetail({ ...detailBody(), status: undefined })).toThrow(
      ContractViolationError,
    );
  });
});
