import { createContext, useContext, type ReactNode } from 'react';

import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';

const RecommendationsGatewayContext = createContext<RecommendationsGateway | null>(null);

interface RecommendationsProviderProps {
  readonly gateway: RecommendationsGateway;
  readonly children: ReactNode;
}

export function RecommendationsProvider({ gateway, children }: RecommendationsProviderProps) {
  return (
    <RecommendationsGatewayContext.Provider value={gateway}>
      {children}
    </RecommendationsGatewayContext.Provider>
  );
}

export function useRecommendationsGateway(): RecommendationsGateway {
  const gateway = useContext(RecommendationsGatewayContext);
  if (gateway === null) {
    throw new Error('useRecommendationsGateway must be used inside RecommendationsProvider.');
  }
  return gateway;
}
