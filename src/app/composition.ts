import { QueryClient } from '@tanstack/react-query';

import type { AppDependencies } from '@/app/AppProviders';
import {
  BroadcastCrossTabChannel,
  HttpInvitationGateway,
  HttpPortalAuthGateway,
  SessionService,
  WebLocksRefreshLock,
} from '@/modules/identity';
import { HttpPatientsGateway } from '@/modules/patients';
import { HttpRecommendationsGateway } from '@/modules/recommendations';
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
  const api = createApiClient({ baseUrl, tokens: sessionService });
  return {
    session: sessionService,
    sessionService,
    queryClient,
    api,
    patients: new HttpPatientsGateway(api),
    invitations: new HttpInvitationGateway(api),
    recommendations: new HttpRecommendationsGateway(api),
  };
}
