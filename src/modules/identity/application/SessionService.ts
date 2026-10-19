import type {
  CrossTabChannel,
  CrossTabEvent,
  CrossTabEventType,
} from '@/modules/identity/application/CrossTabChannel';
import { IdleMonitor } from '@/modules/identity/application/IdleMonitor';
import type {
  PortalAuthGateway,
  PortalSessionGrant,
} from '@/modules/identity/application/PortalAuthGateway';
import type { RefreshLock } from '@/modules/identity/application/RefreshLock';
import type { SessionController } from '@/modules/identity/application/SessionController';
import type { IdlePhase } from '@/modules/identity/domain/IdlePolicy';
import { LoginError, SessionEndedError } from '@/modules/identity/domain/LoginError';
import {
  NUTRITIONIST_ROLE,
  type Session,
  type SignedOutReason,
} from '@/modules/identity/domain/Session';
import type { Clock, TimerHandle } from '@/shared/application/Clock';
import type { TokenProvider } from '@/shared/application/TokenProvider';

const RENEW_MARGIN_MS = 60 * 1000;
const ACTIVITY_BROADCAST_INTERVAL_MS = 30 * 1000;

const EVENT_FOR_REASON: Record<SignedOutReason, CrossTabEventType> = {
  'signed-out': 'signed-out',
  idle: 'idle-timeout',
  expired: 'session-expired',
};

const REASON_FOR_EVENT: Partial<Record<CrossTabEventType, SignedOutReason>> = {
  'signed-out': 'signed-out',
  'idle-timeout': 'idle',
  'session-expired': 'expired',
};

export interface SessionServiceDependencies {
  readonly gateway: PortalAuthGateway;
  readonly clock: Clock;
  readonly channel: CrossTabChannel;
  readonly lock: RefreshLock;
  // Clears every cached query when the session ends, in this tab or in another one.
  readonly onSessionCleared: () => void;
}

// Portal session: the access token lives only here, in memory. Owns the proactive renewal timer
// and, through IdleMonitor, the inactivity timer; both start on sign-in and stop on sign-out.
export class SessionService implements SessionController, TokenProvider {
  private readonly deps: SessionServiceDependencies;
  private readonly idle: IdleMonitor;
  private readonly listeners = new Set<() => void>();
  private readonly unsubscribeChannel: () => void;
  private session: Session = { status: 'restoring' };
  private accessToken: string | null = null;
  private expiresAt = 0;
  private lastRenewalAt = 0;
  private lastActivityAt = 0;
  private lastBroadcastAt = Number.NEGATIVE_INFINITY;
  private renewal: Promise<string | null> | null = null;
  private renewTimer: TimerHandle | null = null;
  private closing = false;

  constructor(deps: SessionServiceDependencies) {
    this.deps = deps;
    this.idle = new IdleMonitor(deps.clock, (phase) => this.onIdlePhase(phase));
    this.unsubscribeChannel = deps.channel.subscribe((event) => this.onCrossTabEvent(event));
  }

  readonly current = (): Session => this.session;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Recovers the session from the cookie on load; also the "Reintentar" action.
  async start(): Promise<void> {
    this.setSession({ status: 'restoring' });
    try {
      const grant = await this.deps.lock.runExclusive(() => this.deps.gateway.refresh());
      if (grant.user.role !== NUTRITIONIST_ROLE) {
        await this.revokeQuietly(grant.accessToken);
        this.setSession({ status: 'anonymous', reason: null });
        return;
      }
      this.authenticate(grant);
    } catch (error) {
      this.setSession(
        error instanceof SessionEndedError
          ? { status: 'anonymous', reason: null }
          : { status: 'unavailable' },
      );
    }
  }

  async login(email: string, password: string): Promise<void> {
    const grant = await this.deps.gateway.login({ email, password });
    if (grant.user.role !== NUTRITIONIST_ROLE) {
      await this.revokeQuietly(grant.accessToken);
      throw new LoginError({ kind: 'invalid-credentials' });
    }
    this.authenticate(grant);
  }

  // Always ends the local session. The server logout is attempted only with a token that is still
  // valid for a minute, renewed once if needed, because an expired Bearer would leave the cookie alive.
  async logout(reason: 'signed-out' | 'idle' = 'signed-out'): Promise<void> {
    if (this.session.status !== 'authenticated' || this.closing) {
      return;
    }
    this.closing = true;
    try {
      const token = await this.tokenForLogout();
      if (token !== null) {
        await this.revokeQuietly(token);
      }
    } finally {
      this.closing = false;
      this.endSession(reason, true);
    }
  }

  // User activity in this tab: pointer, keyboard or wheel. Automatic requests never call it.
  recordActivity(): void {
    if (this.session.status !== 'authenticated') {
      return;
    }
    const now = this.deps.clock.now();
    this.markActivity(now);
    if (now - this.lastBroadcastAt >= ACTIVITY_BROADCAST_INTERVAL_MS) {
      this.lastBroadcastAt = now;
      this.deps.channel.publish({ type: 'activity', at: now });
    }
  }

  checkIdle(): void {
    this.idle.check();
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken === null) {
      return null;
    }
    if (this.expiresAt - this.deps.clock.now() < RENEW_MARGIN_MS) {
      return this.renew();
    }
    return this.accessToken;
  }

  async renewAfterUnauthorized(rejectedToken: string): Promise<string | null> {
    if (this.accessToken === null) {
      return null;
    }
    if (this.accessToken !== rejectedToken) {
      return this.accessToken;
    }
    return this.renew();
  }

  dispose(): void {
    this.clearRenewTimer();
    this.idle.stop();
    this.unsubscribeChannel();
    this.deps.channel.close();
  }

  private authenticate(grant: PortalSessionGrant): void {
    const now = this.deps.clock.now();
    this.applyGrant(grant, now);
    this.lastActivityAt = now;
    this.idle.start();
    this.setSession({ status: 'authenticated', user: grant.user, idleWarning: null });
  }

  private applyGrant(grant: PortalSessionGrant, now: number): void {
    this.accessToken = grant.accessToken;
    this.expiresAt = now + grant.expiresInSeconds * 1000;
    this.lastRenewalAt = now;
    this.scheduleRenewal(now);
  }

  // Proactive renewal a minute before expiry, only if the user did something since the last one.
  private scheduleRenewal(now: number): void {
    this.clearRenewTimer();
    const delay = Math.max(0, this.expiresAt - RENEW_MARGIN_MS - now);
    this.renewTimer = this.deps.clock.setTimeout(() => {
      this.renewTimer = null;
      if (this.lastActivityAt > this.lastRenewalAt) {
        void this.renew();
      }
    }, delay);
  }

  // A single renewal in flight per tab; the lock serializes it across tabs.
  private renew(): Promise<string | null> {
    this.renewal ??= this.performRenewal().finally(() => {
      this.renewal = null;
    });
    return this.renewal;
  }

  private async performRenewal(): Promise<string | null> {
    try {
      const grant = await this.deps.lock.runExclusive(() => this.deps.gateway.refresh());
      if (this.session.status !== 'authenticated') {
        return null;
      }
      if (grant.user.role !== NUTRITIONIST_ROLE) {
        this.endSession('expired', true);
        return null;
      }
      this.applyGrant(grant, this.deps.clock.now());
      return this.accessToken;
    } catch (error) {
      if (error instanceof SessionEndedError) {
        this.endSession('expired', true);
      }
      return null;
    }
  }

  private async tokenForLogout(): Promise<string | null> {
    if (this.renewal !== null) {
      return this.renewal;
    }
    if (this.accessToken !== null && this.expiresAt - this.deps.clock.now() >= RENEW_MARGIN_MS) {
      return this.accessToken;
    }
    try {
      const grant = await this.deps.lock.runExclusive(() => this.deps.gateway.refresh());
      return grant.accessToken;
    } catch {
      return null;
    }
  }

  private async revokeQuietly(accessToken: string): Promise<void> {
    try {
      await this.deps.gateway.logout(accessToken);
    } catch {
      // Best effort: the local session ends anyway and the server session expires by itself.
    }
  }

  private markActivity(at: number): void {
    this.lastActivityAt = Math.max(this.lastActivityAt, at);
    this.idle.recordActivity(at);
  }

  private onIdlePhase(phase: IdlePhase): void {
    if (this.session.status !== 'authenticated') {
      return;
    }
    if (phase.phase === 'expired') {
      void this.logout('idle');
      return;
    }
    const idleWarning = phase.phase === 'warning' ? { logoutAt: phase.logoutAt } : null;
    this.setSession({ ...this.session, idleWarning });
  }

  private onCrossTabEvent(event: CrossTabEvent): void {
    if (event.type === 'activity') {
      if (this.session.status === 'authenticated') {
        this.markActivity(event.at);
      }
      return;
    }
    const reason = REASON_FOR_EVENT[event.type];
    if (reason === undefined) {
      return;
    }
    if (this.session.status === 'authenticated') {
      this.endSession(reason, false);
    } else {
      this.deps.onSessionCleared();
    }
  }

  private endSession(reason: SignedOutReason, broadcast: boolean): void {
    if (this.session.status !== 'authenticated') {
      return;
    }
    this.clearRenewTimer();
    this.idle.stop();
    this.accessToken = null;
    this.expiresAt = 0;
    this.deps.onSessionCleared();
    this.setSession({ status: 'anonymous', reason });
    if (broadcast) {
      this.deps.channel.publish({ type: EVENT_FOR_REASON[reason], at: this.deps.clock.now() });
    }
  }

  private clearRenewTimer(): void {
    if (this.renewTimer !== null) {
      this.deps.clock.clearTimeout(this.renewTimer);
      this.renewTimer = null;
    }
  }

  private setSession(session: Session): void {
    this.session = session;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
