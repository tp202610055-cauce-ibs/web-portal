import { describe, expect, it, vi } from 'vitest';

import { attemptFor } from '@/modules/recommendations/application/decisionKey';

describe('attemptFor', () => {
  it('firstAttempt_getsANewKey', () => {
    const newKey = vi.fn(() => 'key-1');

    expect(attemptFor(null, 'approve:Nota válida', newKey)).toEqual({
      content: 'approve:Nota válida',
      key: 'key-1',
    });
    expect(newKey).toHaveBeenCalledTimes(1);
  });

  it('retryOfTheSameContent_reusesTheKey', () => {
    const previous = { content: 'approve:Nota válida', key: 'key-1' };
    const newKey = vi.fn(() => 'key-2');

    expect(attemptFor(previous, 'approve:Nota válida', newKey)).toBe(previous);
    expect(newKey).not.toHaveBeenCalled();
  });

  it('changedContent_getsANewKey', () => {
    const previous = { content: 'approve:Nota válida', key: 'key-1' };

    expect(attemptFor(previous, 'approve:Otra nota válida', () => 'key-2').key).toBe('key-2');
  });
});
