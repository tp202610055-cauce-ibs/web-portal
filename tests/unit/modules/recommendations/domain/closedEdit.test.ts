import { describe, expect, it } from 'vitest';

import { canAttemptClosedEdit } from '@/modules/recommendations/domain/closedEdit';

const CLOSED = [
  'Approved',
  'ModifiedApproved',
  'ManualApproved',
  'Delivered',
  'FeedbackReceived',
  'Rejected',
] as const;

describe('canAttemptClosedEdit', () => {
  it.each(CLOSED)('%s_offersTheAttempt', (status) => {
    expect(canAttemptClosedEdit({ status, isActive: true, allowedActions: ['Archive'] })).toBe(
      true,
    );
  });

  it.each(['PendingReview', 'Generated', 'Expired'] as const)('%s_doesNot', (status) => {
    expect(canAttemptClosedEdit({ status, isActive: true, allowedActions: [] })).toBe(false);
  });

  it('archived_or_withModifyAllowed_doesNot', () => {
    expect(canAttemptClosedEdit({ status: 'Approved', isActive: false, allowedActions: [] })).toBe(
      false,
    );
    expect(
      canAttemptClosedEdit({ status: 'Approved', isActive: true, allowedActions: ['Modify'] }),
    ).toBe(false);
  });
});
