import { createContext, useContext, type ReactNode } from 'react';

import type { AlertsGateway } from '@/modules/notifications/application/AlertsGateway';

const AlertsGatewayContext = createContext<AlertsGateway | null>(null);

interface AlertsProviderProps {
  readonly gateway: AlertsGateway;
  readonly children: ReactNode;
}

export function AlertsProvider({ gateway, children }: AlertsProviderProps) {
  return <AlertsGatewayContext.Provider value={gateway}>{children}</AlertsGatewayContext.Provider>;
}

export function useAlertsGateway(): AlertsGateway {
  const gateway = useContext(AlertsGatewayContext);
  if (gateway === null) {
    throw new Error('useAlertsGateway must be used inside AlertsProvider.');
  }
  return gateway;
}
