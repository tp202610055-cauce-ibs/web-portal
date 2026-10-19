import { QueryClient } from '@tanstack/react-query';

import type { AppDependencies } from '@/app/AppProviders';
import {
  BroadcastCrossTabChannel,
  HttpPortalAuthGateway,
  SessionService,
  WebLocksRefreshLock,
} from '@/modules/identity';
import { createApiClient, type ApiClient } from '@/shared/infrastructure/apiClient';
import { SystemClock } from '@/shared/infrastructure/SystemClock';

export interface AppComposition extends AppDependencies {
  readonly sessionService: SessionService;
  readonly api: ApiClient;
}

// Composition root: the only place that chooses the adapter behind each port.
export function createAppDependencies(): AppComposition {
  const queryClient = new QueryClient();
  const baseUrl = window.location.origin;
  const sessionService = new SessionService({
    gateway: new HttpPortalAuthGateway({ baseUrl }),
    clock: new SystemClock(),
    channel: new BroadcastCrossTabChannel(),
    lock: new WebLocksRefreshLock(),
    onSessionCleared: () => queryClient.clear(),
  });
  return {
    session: sessionService,
    sessionService,
    queryClient,
    api: createApiClient({ baseUrl, tokens: sessionService }),
  };
}
