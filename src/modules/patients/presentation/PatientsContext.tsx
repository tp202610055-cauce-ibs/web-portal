import { createContext, useContext, type ReactNode } from 'react';

import type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';

const PatientsGatewayContext = createContext<PatientsGateway | null>(null);

interface PatientsProviderProps {
  readonly gateway: PatientsGateway;
  readonly children: ReactNode;
}

export function PatientsProvider({ gateway, children }: PatientsProviderProps) {
  return (
    <PatientsGatewayContext.Provider value={gateway}>{children}</PatientsGatewayContext.Provider>
  );
}

export function usePatientsGateway(): PatientsGateway {
  const gateway = useContext(PatientsGatewayContext);
  if (gateway === null) {
    throw new Error('usePatientsGateway must be used inside PatientsProvider.');
  }
  return gateway;
}
