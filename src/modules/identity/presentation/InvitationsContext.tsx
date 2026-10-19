import { createContext, useContext, type ReactNode } from 'react';

import type { InvitationGateway } from '@/modules/identity/application/InvitationGateway';

const InvitationGatewayContext = createContext<InvitationGateway | null>(null);

interface InvitationsProviderProps {
  readonly gateway: InvitationGateway;
  readonly children: ReactNode;
}

export function InvitationsProvider({ gateway, children }: InvitationsProviderProps) {
  return (
    <InvitationGatewayContext.Provider value={gateway}>
      {children}
    </InvitationGatewayContext.Provider>
  );
}

export function useInvitationGateway(): InvitationGateway {
  const gateway = useContext(InvitationGatewayContext);
  if (gateway === null) {
    throw new Error('useInvitationGateway must be used inside InvitationsProvider.');
  }
  return gateway;
}
