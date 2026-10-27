import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { PasswordResetRefusedError } from '@/modules/identity/domain/PasswordReset';
import { HttpPasswordResetGateway } from '@/modules/identity/infrastructure/HttpPasswordResetGateway';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';

const BASE = 'http://portal.test';
const AUTH = `${BASE}/api/v1/auth/password-reset`;
const gateway = new HttpPasswordResetGateway(
  createApiClient({
    baseUrl: BASE,
    tokens: { getAccessToken: async () => null, renewAfterUnauthorized: async () => null },
  }),
);

async function refusal(promise: Promise<unknown>) {
  const error = await promise.catch((e) => e);
  expect(error).toBeInstanceOf(PasswordResetRefusedError);
  return (error as PasswordResetRefusedError).failure;
}

describe('HttpPasswordResetGateway', () => {
  // CP018 part B: the portal asks for the link with its own client, so the email points to it.
  it('request_sendsTheEmailWithThePortalClient_andNoBearer', async () => {
    let sent: { body: unknown; auth: string | null } | null = null;
    server.use(
      http.post(`${AUTH}/request`, async ({ request }) => {
        sent = { body: await request.json(), auth: request.headers.get('Authorization') };
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await gateway.request('nutricionista.prueba@ejemplo.test');

    expect(sent).toEqual({
      body: { email: 'nutricionista.prueba@ejemplo.test', clientId: 'cauce-web-portal' },
      auth: null,
    });
  });

  it.each([
    [400, 'invalid-email'],
    [429, 'rate-limited'],
  ] as const)('request_with%i_isRefusedAs %s', async (status, kind) => {
    server.use(http.post(`${AUTH}/request`, () => HttpResponse.json({}, { status })));

    expect((await refusal(gateway.request('x'))).kind).toBe(kind);
  });

  it('validate_with204_isValid_andWith400_isAnInvalidLink', async () => {
    server.use(http.post(`${AUTH}/validate`, () => new HttpResponse(null, { status: 204 })));
    await expect(gateway.validate('token-1')).resolves.toBeUndefined();

    server.use(
      http.post(`${AUTH}/validate`, () =>
        HttpResponse.json({ errorCode: 'invalid_password_reset_token' }, { status: 400 }),
      ),
    );
    expect((await refusal(gateway.validate('token-1'))).kind).toBe('invalid-link');
  });

  it('validate_onA500_isUnavailable', async () => {
    server.use(http.post(`${AUTH}/validate`, () => new HttpResponse(null, { status: 500 })));

    await expect(gateway.validate('t')).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('confirm_sendsTokenAndPassword', async () => {
    let body: unknown = null;
    server.use(
      http.post(`${AUTH}/confirm`, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await gateway.confirm('token-1', 'Portal#2026');

    expect(body).toEqual({ token: 'token-1', newPassword: 'Portal#2026' });
  });

  it.each([
    ['invalid_password_reset_token', { kind: 'invalid-link' }],
    ['expired_password_reset_token', { kind: 'invalid-link' }],
  ])('confirm_with %s_isAnInvalidLink', async (errorCode, failure) => {
    server.use(
      http.post(`${AUTH}/confirm`, () => HttpResponse.json({ errorCode }, { status: 400 })),
    );

    expect(await refusal(gateway.confirm('t', 'p'))).toEqual(failure);
  });

  it('confirm_withAWeakPassword_keepsTheServerMessages', async () => {
    server.use(
      http.post(`${AUTH}/confirm`, () =>
        HttpResponse.json(
          { errorCode: 'validation_error', errors: { NewPassword: ['Debe tener 8 caracteres.'] } },
          { status: 400 },
        ),
      ),
    );

    expect(await refusal(gateway.confirm('t', 'p'))).toEqual({
      kind: 'invalid-password',
      messages: ['Debe tener 8 caracteres.'],
    });
  });

  it('confirm_onNetworkFailure_isUnavailable', async () => {
    server.use(http.post(`${AUTH}/confirm`, () => HttpResponse.error()));

    await expect(gateway.confirm('t', 'p')).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
