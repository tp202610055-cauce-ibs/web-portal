import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';
import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';

export const MIN_FOOD_QUERY_LENGTH = 2;

// The trimmed text, or null when it is too short to search; an empty query never reaches the server.
export function foodQuery(text: string): string | null {
  const query = text.trim();
  return query.length >= MIN_FOOD_QUERY_LENGTH ? query : null;
}

export function searchFoods(gateway: FoodCatalogGateway, query: string): Promise<FoodSummary[]> {
  return gateway.search(query);
}
