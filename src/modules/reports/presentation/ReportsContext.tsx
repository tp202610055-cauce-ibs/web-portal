import { createContext, useContext, type ReactNode } from 'react';

import type { ReportsGateway } from '@/modules/reports/application/ReportsGateway';

const ReportsGatewayContext = createContext<ReportsGateway | null>(null);

interface ReportsProviderProps {
  readonly gateway: ReportsGateway;
  readonly children: ReactNode;
}

export function ReportsProvider({ gateway, children }: ReportsProviderProps) {
  return (
    <ReportsGatewayContext.Provider value={gateway}>{children}</ReportsGatewayContext.Provider>
  );
}

export function useReportsGateway(): ReportsGateway {
  const gateway = useContext(ReportsGatewayContext);
  if (gateway === null) {
    throw new Error('useReportsGateway must be used inside ReportsProvider.');
  }
  return gateway;
}
