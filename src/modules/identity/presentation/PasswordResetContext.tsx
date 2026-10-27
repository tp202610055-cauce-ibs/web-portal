import { createContext, useContext, type ReactNode } from 'react';

import type { PasswordResetGateway } from '@/modules/identity/application/PasswordResetGateway';

const PasswordResetGatewayContext = createContext<PasswordResetGateway | null>(null);

interface PasswordResetProviderProps {
  readonly gateway: PasswordResetGateway;
  readonly children: ReactNode;
}

export function PasswordResetProvider({ gateway, children }: PasswordResetProviderProps) {
  return (
    <PasswordResetGatewayContext.Provider value={gateway}>
      {children}
    </PasswordResetGatewayContext.Provider>
  );
}

export function usePasswordResetGateway(): PasswordResetGateway {
  const gateway = useContext(PasswordResetGatewayContext);
  if (gateway === null) {
    throw new Error('usePasswordResetGateway must be used inside PasswordResetProvider.');
  }
  return gateway;
}
