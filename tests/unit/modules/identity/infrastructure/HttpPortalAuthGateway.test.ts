import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { LoginError, SessionEndedError } from '@/modules/identity/domain/LoginError';
import { HttpPortalAuthGateway } from '@/modules/identity/infrastructure/HttpPortalAuthGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';

import { server } from '../../../../msw/server';
import { NUTRITIONIST_ID, portalSessionBody } from '../../../../support/portalSession';

const LOGIN = '*/api/v1/auth/portal/login';
const REFRESH = '*/api/v1/auth/portal/refresh';
const LOGOUT = '*/api/v1/auth/portal/logout';
const CREDENTIALS = { email: 'nutri.prueba@cauce.test', password: 'synthetic-password' };

function problem(status: number, extensions: Record<string, unknown> = {}) {
  return HttpResponse.json(
    { title: 'Rejected', status, ...extensions },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

describe('HttpPortalAuthGateway', () => {
  let gateway: HttpPortalAuthGateway;

  beforeEach(() => {
    gateway = new HttpPortalAuthGateway({ baseUrl: window.location.origin });
  });

  describe('login', () => {
    it('login_withValidCredentials_sendsThemAndMapsTheGrant', async () => {
      let sentBody: unknown;
      server.use(
        http.post(LOGIN, async ({ request }) => {
          sentBody = await request.json();
          return HttpResponse.json(portalSessionBody());
        }),
      );

      const result = await gateway.login(CREDENTIALS);

      expect(sentBody).toEqual(CREDENTIALS);
      expect(result).toEqual({
        accessToken: 'access-token-1',
        expiresInSeconds: 900,
        user: { userId: NUTRITIONIST_ID, fullName: 'Nutricionista Prueba', role: 'nutritionist' },
      });
    });

    // CP006 and CP017: every variant gets the same 401 from the backend and the same failure here.
    it.each([
      'CP006 A wrong password',
      'CP006 B unknown email',
      'CP006 C disabled account',
      'CP006 D pending activation',
      'CP017 D patient account',
    ])('login_%s_isInvalidCredentials', async () => {
      server.use(http.post(LOGIN, () => problem(401, { errorCode: 'invalid_credentials' })));

      await expect(gateway.login(CREDENTIALS)).rejects.toEqual(
        new LoginError({ kind: 'invalid-credentials' }),
      );
    });

    it('login_withValidationError_isInvalidCredentials', async () => {
      server.use(http.post(LOGIN, () => problem(400, { errorCode: 'validation_error' })));

      await expect(gateway.login(CREDENTIALS)).rejects.toMatchObject({
        failure: { kind: 'invalid-credentials' },
      });
    });

    it('login_withLockedAccount_carriesTheUnlockTime', async () => {
      server.use(
        http.post(LOGIN, () =>
          problem(423, { errorCode: 'account_locked', lockedUntil: '2026-10-20T20:15:00Z' }),
        ),
      );

      await expect(gateway.login(CREDENTIALS)).rejects.toMatchObject({
        failure: { kind: 'account-locked', lockedUntil: new Date('2026-10-20T20:15:00Z') },
      });
    });

    it('login_withLockWithoutAValidTime_isInvalidCredentials', async () => {
      server.use(http.post(LOGIN, () => problem(423, { lockedUntil: 'not-a-date' })));

      await expect(gateway.login(CREDENTIALS)).rejects.toMatchObject({
        failure: { kind: 'invalid-credentials' },
      });
    });

    it('login_withRateLimit_carriesTheWait', async () => {
      server.use(http.post(LOGIN, () => problem(429, { retryAfterSeconds: 42 })));

      await expect(gateway.login(CREDENTIALS)).rejects.toMatchObject({
        failure: { kind: 'rate-limited', retryAfterSeconds: 42 },
      });
    });

    it('login_withRateLimitWithoutBody_hasNoWait', async () => {
      server.use(http.post(LOGIN, () => new HttpResponse(null, { status: 429 })));

      await expect(gateway.login(CREDENTIALS)).rejects.toMatchObject({
        failure: { kind: 'rate-limited', retryAfterSeconds: null },
      });
    });

    it('login_withServerError_isUnavailable', async () => {
      server.use(
        http.post(LOGIN, () => problem(500, { errorCode: 'identity_provider_misconfigured' })),
      );

      await expect(gateway.login(CREDENTIALS)).rejects.toBeInstanceOf(ServiceUnavailableError);
    });

    it('login_withNetworkFailure_isUnavailable', async () => {
      server.use(http.post(LOGIN, () => HttpResponse.error()));

      await expect(gateway.login(CREDENTIALS)).rejects.toBeInstanceOf(ServiceUnavailableError);
    });

    it('login_withPayloadOutsideTheContract_isContractViolation', async () => {
      server.use(http.post(LOGIN, () => HttpResponse.json({ expiresIn: 900 })));

      await expect(gateway.login(CREDENTIALS)).rejects.toBeInstanceOf(ContractViolationError);
    });
  });

  describe('refresh', () => {
    it('refresh_sendsTheCsrfHeaderWithCredentials', async () => {
      let csrf: string | null = null;
      let credentials: RequestCredentials | null = null;
      server.use(
        http.post(REFRESH, ({ request }) => {
          csrf = request.headers.get('X-Cauce-Portal');
          credentials = request.credentials;
          return HttpResponse.json(portalSessionBody({ accessToken: 'access-token-2' }));
        }),
      );

      const result = await gateway.refresh();

      expect(result.accessToken).toBe('access-token-2');
      expect(csrf).toBe('1');
      expect(credentials).toBe('include');
    });

    it.each([401, 403])('refresh_with%i_meansTheSessionEnded', async (status) => {
      server.use(http.post(REFRESH, () => problem(status)));

      await expect(gateway.refresh()).rejects.toBeInstanceOf(SessionEndedError);
    });

    it.each([429, 503])('refresh_with%i_isUnavailable', async (status) => {
      server.use(http.post(REFRESH, () => problem(status)));

      await expect(gateway.refresh()).rejects.toBeInstanceOf(ServiceUnavailableError);
    });
  });

  describe('logout', () => {
    it('logout_sendsTheBearerAndTheCsrfHeader', async () => {
      let authorization: string | null = null;
      let csrf: string | null = null;
      server.use(
        http.post(LOGOUT, ({ request }) => {
          authorization = request.headers.get('Authorization');
          csrf = request.headers.get('X-Cauce-Portal');
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await gateway.logout('access-token-1');

      expect(authorization).toBe('Bearer access-token-1');
      expect(csrf).toBe('1');
    });

    it('logout_rejected_throws', async () => {
      server.use(http.post(LOGOUT, () => new HttpResponse(null, { status: 401 })));

      await expect(gateway.logout('expired-token')).rejects.toBeInstanceOf(ServiceUnavailableError);
    });
  });
});
