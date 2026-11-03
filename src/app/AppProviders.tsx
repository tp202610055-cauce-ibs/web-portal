import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import {
  ClinicalRegistryProvider,
  FoodCatalogProvider,
  type ClinicalRegistryGateway,
  type FoodCatalogGateway,
} from '@/modules/clinical-registry';
import {
  InvitationsProvider,
  PasswordResetProvider,
  SessionProvider,
  type InvitationGateway,
  type PasswordResetGateway,
  type SessionController,
} from '@/modules/identity';
import { AlertsProvider, type AlertsGateway } from '@/modules/notifications';
import { PatientsProvider, type PatientsGateway } from '@/modules/patients';
import { RecommendationsProvider, type RecommendationsGateway } from '@/modules/recommendations';
import { ReportsProvider, type ReportsGateway } from '@/modules/reports';

export interface AppDependencies {
  readonly session: SessionController;
  readonly queryClient: QueryClient;
  readonly patients: PatientsGateway;
  readonly invitations: InvitationGateway;
  readonly recommendations: RecommendationsGateway;
  readonly foods: FoodCatalogGateway;
  readonly clinicalRegistry: ClinicalRegistryGateway;
  readonly reports: ReportsGateway;
  readonly passwordReset: PasswordResetGateway;
  readonly alerts: AlertsGateway;
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
              <FoodCatalogProvider gateway={dependencies.foods}>
                <ClinicalRegistryProvider gateway={dependencies.clinicalRegistry}>
                  <ReportsProvider gateway={dependencies.reports}>
                    <PasswordResetProvider gateway={dependencies.passwordReset}>
                      <AlertsProvider gateway={dependencies.alerts}>{children}</AlertsProvider>
                    </PasswordResetProvider>
                  </ReportsProvider>
                </ClinicalRegistryProvider>
              </FoodCatalogProvider>
            </RecommendationsProvider>
          </InvitationsProvider>
        </PatientsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
