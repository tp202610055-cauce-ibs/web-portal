import { describe, expect, it, vi } from 'vitest';

import {
  getRecommendation,
  isRecommendationId,
  listPendingReview,
  REVIEW_QUEUE_PAGE_SIZE,
  submitDecision,
} from '@/modules/recommendations/application/reviewRecommendations';

import {
  fakeRecommendationsGateway,
  NOTE_CP045,
  NOTE_CP046,
  PENDING_ID,
} from '../../../../support/recommendations';

describe('reviewRecommendations', () => {
  it.each([
    [PENDING_ID, true],
    [PENDING_ID.toUpperCase(), true],
    ['not-a-uuid', false],
    [undefined, false],
  ])('isRecommendationId_%s_is%s', (value, expected) => {
    expect(isRecommendationId(value)).toBe(expected);
  });

  it('listPendingReview_asksForThePageWithTheQueueSize', async () => {
    const page = { items: [], page: 2, pageSize: REVIEW_QUEUE_PAGE_SIZE, totalCount: 21 };
    const listPending = vi.fn().mockResolvedValue(page);

    await expect(
      listPendingReview(fakeRecommendationsGateway({ listPendingReview: listPending }), 2),
    ).resolves.toBe(page);
    expect(listPending).toHaveBeenCalledWith(2, 20);
  });

  it('getRecommendation_readsTheDetail', async () => {
    const getDetail = vi.fn().mockResolvedValue({ recommendationId: PENDING_ID });

    await getRecommendation(fakeRecommendationsGateway({ getDetail }), PENDING_ID);

    expect(getDetail).toHaveBeenCalledWith(PENDING_ID);
  });

  it('approveDecision_sendsTheTrimmedNoteWithItsKey', async () => {
    const approve = vi.fn().mockResolvedValue(undefined);
    const reject = vi.fn();

    await submitDecision(fakeRecommendationsGateway({ approve, reject }), {
      decision: 'approve',
      recommendationId: PENDING_ID,
      note: `  ${NOTE_CP045}  `,
      idempotencyKey: 'key-1',
    });

    expect(approve).toHaveBeenCalledWith(PENDING_ID, NOTE_CP045, 'key-1');
    expect(reject).not.toHaveBeenCalled();
  });

  it('rejectDecision_sendsTheTrimmedReasonWithItsKey', async () => {
    const approve = vi.fn();
    const reject = vi.fn().mockResolvedValue(undefined);

    await submitDecision(fakeRecommendationsGateway({ approve, reject }), {
      decision: 'reject',
      recommendationId: PENDING_ID,
      note: NOTE_CP046,
      idempotencyKey: 'key-2',
    });

    expect(reject).toHaveBeenCalledWith(PENDING_ID, NOTE_CP046, 'key-2');
    expect(approve).not.toHaveBeenCalled();
  });
});
