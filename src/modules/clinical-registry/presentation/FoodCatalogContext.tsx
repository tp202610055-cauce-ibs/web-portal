import { createContext, useContext, type ReactNode } from 'react';

import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';

const FoodCatalogGatewayContext = createContext<FoodCatalogGateway | null>(null);

interface FoodCatalogProviderProps {
  readonly gateway: FoodCatalogGateway;
  readonly children: ReactNode;
}

export function FoodCatalogProvider({ gateway, children }: FoodCatalogProviderProps) {
  return (
    <FoodCatalogGatewayContext.Provider value={gateway}>
      {children}
    </FoodCatalogGatewayContext.Provider>
  );
}

export function useFoodCatalogGateway(): FoodCatalogGateway {
  const gateway = useContext(FoodCatalogGatewayContext);
  if (gateway === null) {
    throw new Error('useFoodCatalogGateway must be used inside FoodCatalogProvider.');
  }
  return gateway;
}
