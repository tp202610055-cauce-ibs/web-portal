import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionService } from '@/modules/identity/application/SessionService';
import { LoginError, SessionEndedError } from '@/modules/identity/domain/LoginError';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { SystemClock } from '@/shared/infrastructure/SystemClock';

import {
  directLock,
  FakeCrossTabChannel,
  fakeGateway,
  grant,
} from '../../../../support/portalSession';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

describe('SessionService', () => {
  let gateway: ReturnType<typeof fakeGateway>;
  let channel: FakeCrossTabChannel;
  let onSessionCleared: ReturnType<typeof vi.fn>;
  let service: SessionService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T15:00:00Z'));
    gateway = fakeGateway();
    channel = new FakeCrossTabChannel();
    onSessionCleared = vi.fn();
    service = new SessionService({
      gateway,
      clock: new SystemClock(),
      channel,
      lock: directLock,
      onSessionCleared,
    });
  });

  afterEach(() => {
    service.dispose();
    vi.useRealTimers();
  });

  async function signIn(expiresInSeconds = 900) {
    gateway.login.mockResolvedValueOnce(grant('token-1', { expiresInSeconds }));
    await service.login('nutri.prueba@cauce.test', 'synthetic-password');
  }

  describe('start', () => {
    it('start_withValidCookie_authenticates', async () => {
      gateway.refresh.mockResolvedValueOnce(grant('token-1'));

      await service.start();

      expect(service.current()).toMatchObject({
        status: 'authenticated',
        user: { fullName: 'Nutricionista Prueba' },
      });
      expect(await service.getAccessToken()).toBe('token-1');
    });

    it('start_withEndedSession_isAnonymousWithoutReason', async () => {
      gateway.refresh.mockRejectedValueOnce(new SessionEndedError());

      await service.start();

      expect(service.current()).toEqual({ status: 'anonymous', reason: null });
    });

    it.each([
      ['network failure', new ServiceUnavailableError()],
      ['contract violation', new ContractViolationError('PortalSessionResult')],
    ])('start_with%s_isUnavailable', async (_name, error) => {
      gateway.refresh.mockRejectedValueOnce(error);

      await service.start();

      expect(service.current()).toEqual({ status: 'unavailable' });
    });

    it('start_afterUnavailable_canBeRetried', async () => {
      gateway.refresh
        .mockRejectedValueOnce(new ServiceUnavailableError())
        .mockResolvedValueOnce(grant('token-1'));
      await service.start();

      await service.start();

      expect(service.current().status).toBe('authenticated');
    });

    it('start_withAnotherRole_revokesAndStaysAnonymous', async () => {
      gateway.refresh.mockResolvedValueOnce(grant('patient-token', { role: 'patient' }));

      await service.start();

      expect(gateway.logout).toHaveBeenCalledWith('patient-token');
      expect(service.current()).toEqual({ status: 'anonymous', reason: null });
    });

    it('subscribe_notifiesEveryChangeUntilUnsubscribed', async () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);
      gateway.refresh.mockResolvedValueOnce(grant('token-1'));

      await service.start();
      unsubscribe();
      await service.logout();

      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('login', () => {
    it('login_withNutritionist_authenticatesWithoutBrowserStorage', async () => {
      await signIn();

      expect(service.current().status).toBe('authenticated');
      expect(localStorage).toHaveLength(0);
      expect(sessionStorage).toHaveLength(0);
    });

    it('login_withAnotherRole_revokesTheTokenAndRejectsAsInvalidCredentials', async () => {
      gateway.login.mockResolvedValueOnce(grant('patient-token', { role: 'patient' }));

      await expect(service.login('paciente.prueba@cauce.test', 'synthetic')).rejects.toEqual(
        new LoginError({ kind: 'invalid-credentials' }),
      );
      expect(gateway.logout).toHaveBeenCalledWith('patient-token');
      expect(service.current().status).not.toBe('authenticated');
    });

    it('login_rejectedByTheServer_propagatesTheFailure', async () => {
      const failure = new LoginError({ kind: 'invalid-credentials' });
      gateway.login.mockRejectedValueOnce(failure);

      await expect(service.login('nutri.prueba@cauce.test', 'wrong')).rejects.toBe(failure);
    });

    it('login_withContractViolation_propagatesIt', async () => {
      gateway.login.mockRejectedValueOnce(new ContractViolationError('PortalSessionResult'));

      await expect(service.login('nutri.prueba@cauce.test', 'synthetic')).rejects.toBeInstanceOf(
        ContractViolationError,
      );
    });
  });

  describe('inactivity', () => {
    it('idle_after13Minutes_showsTheWarningWithTheLogoutTime', async () => {
      await signIn();
      const signedInAt = Date.now();

      await vi.advanceTimersByTimeAsync(13 * MINUTE);

      expect(service.current()).toMatchObject({
        status: 'authenticated',
        idleWarning: { logoutAt: signedInAt + 15 * MINUTE },
      });
    });

    it('idle_activityAt12Minutes_restartsTheCount', async () => {
      await signIn();
      await vi.advanceTimersByTimeAsync(12 * MINUTE);

      service.recordActivity();
      await vi.advanceTimersByTimeAsync(12 * MINUTE);

      expect(service.current()).toMatchObject({ idleWarning: null });
    });

    it('idle_activityInAnotherTab_restartsTheCount', async () => {
      await signIn();
      await vi.advanceTimersByTimeAsync(12 * MINUTE);

      channel.emitFromAnotherTab({ type: 'activity', at: Date.now() });
      await vi.advanceTimersByTimeAsync(12 * MINUTE);

      expect(service.current()).toMatchObject({ status: 'authenticated', idleWarning: null });
    });

    it('idle_activityDuringTheWarning_clearsIt', async () => {
      await signIn();
      await vi.advanceTimersByTimeAsync(14 * MINUTE);

      service.recordActivity();

      expect(service.current()).toMatchObject({ idleWarning: null });
    });

    it('idle_after15Minutes_renewsOnceThenLogsOutAndTellsOtherTabs', async () => {
      await signIn();
      gateway.refresh.mockResolvedValueOnce(grant('token-2'));

      await vi.advanceTimersByTimeAsync(15 * MINUTE);

      expect(gateway.refresh).toHaveBeenCalledTimes(1);
      expect(gateway.logout).toHaveBeenCalledWith('token-2');
      expect(service.current()).toEqual({ status: 'anonymous', reason: 'idle' });
      expect(channel.published.at(-1)).toEqual({ type: 'idle-timeout', at: Date.now() });
      expect(onSessionCleared).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('checkIdle_afterTheTabSlept16Minutes_logsOut', async () => {
      await signIn();
      gateway.refresh.mockResolvedValueOnce(grant('token-2'));
      vi.setSystemTime(Date.now() + 16 * MINUTE);

      service.checkIdle();
      await vi.advanceTimersByTimeAsync(0);

      expect(service.current()).toEqual({ status: 'anonymous', reason: 'idle' });
    });

    it('recordActivity_broadcastsAtMostEvery30Seconds', async () => {
      await signIn();

      service.recordActivity();
      await vi.advanceTimersByTimeAsync(10 * SECOND);
      service.recordActivity();
      await vi.advanceTimersByTimeAsync(20 * SECOND);
      service.recordActivity();

      expect(channel.published.filter((event) => event.type === 'activity')).toHaveLength(2);
      expect(channel.published.every((event) => Object.keys(event).length === 2)).toBe(true);
    });

    it('recordActivity_withoutSession_doesNothing', () => {
      service.recordActivity();

      expect(channel.published).toEqual([]);
    });
  });

  describe('logout', () => {
    it('logout_withFreshToken_callsLogoutWithoutRenewing', async () => {
      await signIn();

      await service.logout();

      expect(gateway.refresh).not.toHaveBeenCalled();
      expect(gateway.logout).toHaveBeenCalledWith('token-1');
      expect(service.current()).toEqual({ status: 'anonymous', reason: 'signed-out' });
      expect(channel.published.at(-1)?.type).toBe('signed-out');
      expect(onSessionCleared).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('logout_withExpiredToken_renewsOnceAndThenCallsLogout', async () => {
      await signIn(90);
      await vi.advanceTimersByTimeAsync(31 * SECOND);
      gateway.refresh.mockResolvedValueOnce(grant('token-2'));

      await service.logout();

      expect(gateway.refresh).toHaveBeenCalledTimes(1);
      expect(gateway.logout).toHaveBeenCalledWith('token-2');
    });

    it('logout_whenTheRenewalFails_clearsWithoutCallingLogout', async () => {
      await signIn(90);
      await vi.advanceTimersByTimeAsync(31 * SECOND);
      gateway.refresh.mockRejectedValueOnce(new ServiceUnavailableError());

      await service.logout();

      expect(gateway.logout).not.toHaveBeenCalled();
      expect(service.current()).toEqual({ status: 'anonymous', reason: 'signed-out' });
    });

    it('logout_withNetworkFailure_clearsLocally', async () => {
      await signIn();
      gateway.logout.mockRejectedValueOnce(new ServiceUnavailableError());

      await service.logout();

      expect(service.current()).toEqual({ status: 'anonymous', reason: 'signed-out' });
      expect(onSessionCleared).toHaveBeenCalledTimes(1);
    });

    it('logout_withoutSession_doesNothing', async () => {
      await service.logout();

      expect(gateway.logout).not.toHaveBeenCalled();
      expect(onSessionCleared).not.toHaveBeenCalled();
    });

    it('logout_twiceAtOnce_callsTheServerOnce', async () => {
      await signIn();

      await Promise.all([service.logout(), service.logout()]);

      expect(gateway.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('renewal', () => {
    it('proactiveRenewal_withActivity_renewsAMinuteBeforeExpiry', async () => {
      await signIn();
      gateway.refresh.mockResolvedValueOnce(grant('token-2'));
      await vi.advanceTimersByTimeAsync(5 * MINUTE);
      service.recordActivity();

      await vi.advanceTimersByTimeAsync(9 * MINUTE);

      expect(gateway.refresh).toHaveBeenCalledTimes(1);
      expect(await service.getAccessToken()).toBe('token-2');
    });

    it('proactiveRenewal_withoutActivity_doesNotRenew', async () => {
      await signIn();

      await vi.advanceTimersByTimeAsync(14 * MINUTE);

      expect(gateway.refresh).not.toHaveBeenCalled();
    });

    it('renewAfterUnauthorized_concurrentCalls_refreshOnce', async () => {
      await signIn();
      let resolveRefresh: (value: ReturnType<typeof grant>) => void = () => undefined;
      gateway.refresh.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
      );

      const first = service.renewAfterUnauthorized('token-1');
      const second = service.renewAfterUnauthorized('token-1');
      resolveRefresh(grant('token-2'));

      expect(await Promise.all([first, second])).toEqual(['token-2', 'token-2']);
      expect(gateway.refresh).toHaveBeenCalledTimes(1);
    });

    it('renewAfterUnauthorized_withAnOlderToken_returnsTheCurrentOne', async () => {
      await signIn();

      expect(await service.renewAfterUnauthorized('token-0')).toBe('token-1');
      expect(gateway.refresh).not.toHaveBeenCalled();
    });

    it('renewal_withEndedSession_signsOutAsExpiredAndTellsOtherTabs', async () => {
      await signIn();
      gateway.refresh.mockRejectedValueOnce(new SessionEndedError());

      expect(await service.renewAfterUnauthorized('token-1')).toBeNull();
      expect(service.current()).toEqual({ status: 'anonymous', reason: 'expired' });
      expect(channel.published.at(-1)?.type).toBe('session-expired');
    });

    it('renewal_withNetworkFailure_keepsTheSession', async () => {
      await signIn();
      gateway.refresh.mockRejectedValueOnce(new ServiceUnavailableError());

      expect(await service.renewAfterUnauthorized('token-1')).toBeNull();
      expect(service.current().status).toBe('authenticated');
    });

    it('renewal_withAnotherRole_signsOutAsExpired', async () => {
      await signIn();
      gateway.refresh.mockResolvedValueOnce(grant('patient-token', { role: 'patient' }));

      expect(await service.renewAfterUnauthorized('token-1')).toBeNull();
      expect(service.current()).toEqual({ status: 'anonymous', reason: 'expired' });
    });

    it('getAccessToken_lessThanAMinuteBeforeExpiry_renewsFirst', async () => {
      await signIn(90);
      await vi.advanceTimersByTimeAsync(31 * SECOND);
      gateway.refresh.mockResolvedValueOnce(grant('token-2'));

      expect(await service.getAccessToken()).toBe('token-2');
    });

    it('getAccessToken_withoutSession_isNull', async () => {
      expect(await service.getAccessToken()).toBeNull();
      expect(await service.renewAfterUnauthorized('token-1')).toBeNull();
    });
  });

  describe('other tabs', () => {
    it('signedOutInAnotherTab_endsThisSessionWithoutCallingTheServer', async () => {
      await signIn();

      channel.emitFromAnotherTab({ type: 'signed-out', at: Date.now() });

      expect(service.current()).toEqual({ status: 'anonymous', reason: 'signed-out' });
      expect(gateway.logout).not.toHaveBeenCalled();
      expect(onSessionCleared).toHaveBeenCalledTimes(1);
      expect(channel.published).toEqual([]);
    });

    it.each([
      ['idle-timeout', 'idle'],
      ['session-expired', 'expired'],
    ] as const)('%sInAnotherTab_endsWithReason_%s', async (type, reason) => {
      await signIn();

      channel.emitFromAnotherTab({ type, at: Date.now() });

      expect(service.current()).toEqual({ status: 'anonymous', reason });
    });

    it('signedOutInAnotherTab_whileAnonymous_stillClearsTheCache', () => {
      channel.emitFromAnotherTab({ type: 'signed-out', at: Date.now() });

      expect(onSessionCleared).toHaveBeenCalledTimes(1);
    });

    it('activityInAnotherTab_whileAnonymous_isIgnored', () => {
      channel.emitFromAnotherTab({ type: 'activity', at: Date.now() });

      expect(service.current()).toEqual({ status: 'restoring' });
    });
  });

  it('dispose_stopsTimersAndClosesTheChannel', async () => {
    await signIn();

    service.dispose();

    expect(vi.getTimerCount()).toBe(0);
    expect(channel.listenerCount).toBe(0);
    expect(channel.close).toHaveBeenCalled();
  });
});
