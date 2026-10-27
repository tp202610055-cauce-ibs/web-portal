import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';

// Throws ServiceUnavailableError when it cannot read and ContractViolationError on a foreign payload.
export interface FoodCatalogGateway {
  search(query: string): Promise<FoodSummary[]>;
  getFood(foodId: string): Promise<FoodSummary>;
}
