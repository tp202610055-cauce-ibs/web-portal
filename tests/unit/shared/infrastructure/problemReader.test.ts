import { describe, expect, it } from 'vitest';

import { readProblem, toApiProblem } from '@/shared/infrastructure/problemReader';

describe('problemReader', () => {
  it('readProblem_withExtensions_readsThem', async () => {
    const response = Response.json(
      {
        status: 423,
        errorCode: 'account_locked',
        lockedUntil: '2026-10-20T20:15:00Z',
        retryAfterSeconds: 30,
        errors: { email: ['Required'] },
      },
      { status: 423 },
    );

    expect(await readProblem(response)).toEqual({
      status: 423,
      errorCode: 'account_locked',
      lockedUntil: '2026-10-20T20:15:00Z',
      retryAfterSeconds: 30,
      errors: { email: ['Required'] },
    });
  });

  it('readProblem_withoutBody_keepsOnlyTheStatus', async () => {
    expect(await readProblem(new Response(null, { status: 405 }))).toEqual({ status: 405 });
  });

  it('readProblem_leavesTheBodyReadable', async () => {
    const response = Response.json({ errorCode: 'forbidden' }, { status: 403 });

    await readProblem(response);

    expect(await response.json()).toEqual({ errorCode: 'forbidden' });
  });

  it('toApiProblem_withWrongTypes_dropsThoseFields', () => {
    expect(toApiProblem(400, { errorCode: 7, retryAfterSeconds: 'soon' })).toEqual({
      status: 400,
      errorCode: undefined,
      retryAfterSeconds: undefined,
      errors: undefined,
      lockedUntil: undefined,
    });
  });

  it('toApiProblem_withTextBody_keepsOnlyTheStatus', () => {
    expect(toApiProblem(500, 'Internal error')).toEqual({ status: 500 });
  });
});
