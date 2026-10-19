import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvitationRefusedError } from '@/modules/identity/domain/InvitationCode';
import { HttpInvitationGateway } from '@/modules/identity/infrastructure/HttpInvitationGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';

const INVITATIONS = '*/api/v1/invitations';

function notAvailable(reason?: unknown) {
  return HttpResponse.json(
    {
      status: 409,
      errorCode: 'nutritionist_not_available',
      ...(reason === undefined ? {} : { reason }),
    },
    { status: 409 },
  );
}

describe('HttpInvitationGateway', () => {
  let gateway: HttpInvitationGateway;

  beforeEach(() => {
    gateway = new HttpInvitationGateway(
      createApiClient({
        baseUrl: window.location.origin,
        tokens: { getAccessToken: async () => 'token-1', renewAfterUnauthorized: async () => null },
      }),
    );
  });

  it('generate_sendsTheBearerAndMapsTheCode', async () => {
    let authorization: string | null = null;
    server.use(
      http.post(INVITATIONS, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json(
          { code: 'ABCDEFGH23', expiresAt: '2026-10-23T15:00:00Z' },
          { status: 201 },
        );
      }),
    );

    expect(await gateway.generate()).toEqual({
      code: 'ABCDEFGH23',
      expiresAt: new Date('2026-10-23T15:00:00Z'),
    });
    expect(authorization).toBe('Bearer token-1');
  });

  it.each(['pending_activation', 'inactive', 'suspended'] as const)(
    'generate_refusedWith_%s_carriesTheReason',
    async (reason) => {
      server.use(http.post(INVITATIONS, () => notAvailable(reason)));

      await expect(gateway.generate()).rejects.toEqual(new InvitationRefusedError(reason));
    },
  );

  it.each([
    ['unknown reason', 'retired'],
    ['missing reason', undefined],
  ])('generate_refusedWith%s_isUnavailable', async (_name, reason) => {
    server.use(http.post(INVITATIONS, () => notAvailable(reason)));

    await expect(gateway.generate()).rejects.toMatchObject({ reason: 'unavailable' });
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 })],
    ['network failure', () => HttpResponse.error()],
    ['other conflict', () => HttpResponse.json({ errorCode: 'conflict_state' }, { status: 409 })],
  ])('generate_with%s_isUnavailable', async (_name, resolver) => {
    server.use(http.post(INVITATIONS, resolver));

    await expect(gateway.generate()).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('generate_withoutACode_isContractViolation', async () => {
    server.use(
      http.post(INVITATIONS, () =>
        HttpResponse.json({ code: null, expiresAt: '2026-10-23T15:00:00Z' }, { status: 201 }),
      ),
    );

    await expect(gateway.generate()).rejects.toBeInstanceOf(ContractViolationError);
  });
});
