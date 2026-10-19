import { vi } from 'vitest';

import type {
  CrossTabChannel,
  CrossTabEvent,
  PortalAuthGateway,
  PortalSessionGrant,
  RefreshLock,
} from '@/modules/identity';
import type { components } from '@/shared/infrastructure/api/generated/schema';

// Synthetic identities only (cauce.test is reserved for tests and never resolves).
export const NUTRITIONIST_ID = '00000000-0000-4000-8000-000000000001';

export function portalSessionBody(
  overrides: Partial<components['schemas']['PortalSessionResult']> = {},
): components['schemas']['PortalSessionResult'] {
  return {
    accessToken: 'access-token-1',
    expiresIn: 900,
    tokenType: 'Bearer',
    user: {
      userId: NUTRITIONIST_ID,
      keycloakId: 'keycloak-subject-1',
      email: 'nutri.prueba@cauce.test',
      role: 'nutritionist',
      fullName: 'Nutricionista Prueba',
      emailVerified: true,
      isInActivePilot: false,
    },
    ...overrides,
  };
}

export function grant(
  accessToken: string,
  { expiresInSeconds = 900, role = 'nutritionist' } = {},
): PortalSessionGrant {
  return {
    accessToken,
    expiresInSeconds,
    user: { userId: NUTRITIONIST_ID, fullName: 'Nutricionista Prueba', role },
  };
}

export function fakeGateway() {
  return {
    login: vi.fn<PortalAuthGateway['login']>(),
    refresh: vi.fn<PortalAuthGateway['refresh']>(),
    logout: vi.fn<PortalAuthGateway['logout']>().mockResolvedValue(undefined),
  } satisfies PortalAuthGateway;
}

export class FakeCrossTabChannel implements CrossTabChannel {
  readonly published: CrossTabEvent[] = [];
  readonly close = vi.fn();
  private readonly listeners = new Set<(event: CrossTabEvent) => void>();

  publish(event: CrossTabEvent): void {
    this.published.push(event);
  }

  subscribe(listener: (event: CrossTabEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emitFromAnotherTab(event: CrossTabEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  get listenerCount(): number {
    return this.listeners.size;
  }
}

export const directLock: RefreshLock = { runExclusive: (task) => task() };
