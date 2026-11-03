import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';
import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';
import {
  toFoodSummaries,
  toFoodSummary,
} from '@/modules/clinical-registry/infrastructure/foodSummaryMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';

export class HttpFoodCatalogGateway implements FoodCatalogGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  // Any failure, including a 401 that could not be renewed, is a search that could not run.
  async search(query: string): Promise<FoodSummary[]> {
    let result;
    try {
      result = await this.api.GET('/api/v1/foods/search', { params: { query: { q: query } } });
    } catch {
      throw new ServiceUnavailableError();
    }
    if (!result.response.ok) {
      throw new ServiceUnavailableError();
    }
    return toFoodSummaries(result.data);
  }

  // A food that cannot be read (404 included) only loses its name; the meal is still shown.
  async getFood(foodId: string): Promise<FoodSummary> {
    let result;
    try {
      result = await this.api.GET('/api/v1/foods/{foodId}', { params: { path: { foodId } } });
    } catch {
      throw new ServiceUnavailableError();
    }
    if (!result.response.ok) {
      throw new ServiceUnavailableError();
    }
    return toFoodSummary(result.data);
  }
}
