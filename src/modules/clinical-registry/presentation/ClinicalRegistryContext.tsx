import { createContext, useContext, type ReactNode } from 'react';

import type { ClinicalRegistryGateway } from '@/modules/clinical-registry/application/ClinicalRegistryGateway';

const ClinicalRegistryGatewayContext = createContext<ClinicalRegistryGateway | null>(null);

interface ClinicalRegistryProviderProps {
  readonly gateway: ClinicalRegistryGateway;
  readonly children: ReactNode;
}

export function ClinicalRegistryProvider({ gateway, children }: ClinicalRegistryProviderProps) {
  return (
    <ClinicalRegistryGatewayContext.Provider value={gateway}>
      {children}
    </ClinicalRegistryGatewayContext.Provider>
  );
}

export function useClinicalRegistryGateway(): ClinicalRegistryGateway {
  const gateway = useContext(ClinicalRegistryGatewayContext);
  if (gateway === null) {
    throw new Error('useClinicalRegistryGateway must be used inside ClinicalRegistryProvider.');
  }
  return gateway;
}
