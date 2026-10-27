import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { ClinicalRegistryGateway } from '@/modules/clinical-registry/application/ClinicalRegistryGateway';
import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';
import { ClinicalRegistryProvider } from '@/modules/clinical-registry/presentation/ClinicalRegistryContext';
import { FoodCatalogProvider } from '@/modules/clinical-registry/presentation/FoodCatalogContext';

import { fakeFoodCatalogGateway } from './foods';

// History and glossary never resolve unless a test provides its own.
export function fakeClinicalRegistryGateway(
  overrides: Partial<ClinicalRegistryGateway> = {},
): ClinicalRegistryGateway {
  return {
    getPatientHistory: () => new Promise(() => undefined),
    getGlossary: () => new Promise(() => undefined),
    ...overrides,
  };
}

export function ClinicalRegistryTestProviders({
  registry,
  foods = fakeFoodCatalogGateway(),
  children,
}: {
  readonly registry: ClinicalRegistryGateway;
  readonly foods?: FoodCatalogGateway;
  readonly children: ReactNode;
}) {
  return (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ClinicalRegistryProvider gateway={registry}>
        <FoodCatalogProvider gateway={foods}>{children}</FoodCatalogProvider>
      </ClinicalRegistryProvider>
    </QueryClientProvider>
  );
}
