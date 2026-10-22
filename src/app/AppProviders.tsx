import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { FoodCatalogProvider, type FoodCatalogGateway } from '@/modules/clinical-registry';
import {
  InvitationsProvider,
  SessionProvider,
  type InvitationGateway,
  type SessionController,
} from '@/modules/identity';
import { PatientsProvider, type PatientsGateway } from '@/modules/patients';
import { RecommendationsProvider, type RecommendationsGateway } from '@/modules/recommendations';

export interface AppDependencies {
  readonly session: SessionController;
  readonly queryClient: QueryClient;
  readonly patients: PatientsGateway;
  readonly invitations: InvitationGateway;
  readonly recommendations: RecommendationsGateway;
  readonly foods: FoodCatalogGateway;
}

interface AppProvidersProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

export function AppProviders({ dependencies, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={dependencies.queryClient}>
      <SessionProvider controller={dependencies.session}>
        <PatientsProvider gateway={dependencies.patients}>
          <InvitationsProvider gateway={dependencies.invitations}>
            <RecommendationsProvider gateway={dependencies.recommendations}>
              <FoodCatalogProvider gateway={dependencies.foods}>{children}</FoodCatalogProvider>
            </RecommendationsProvider>
          </InvitationsProvider>
        </PatientsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
