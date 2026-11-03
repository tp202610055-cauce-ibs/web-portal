import type { AlertsGateway } from '@/modules/notifications/application/AlertsGateway';
import type { AlertsPage } from '@/modules/notifications/domain/NutritionistAlert';
import { toAlertsPage } from '@/modules/notifications/infrastructure/alertMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';

interface ApiResult {
  readonly data?: unknown;
  readonly response: Response;
}

// Network failures, 401s that could not be renewed and 5xx are all the same "could not load" state.
async function send<T extends ApiResult>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch {
    throw new ServiceUnavailableError();
  }
}

export class HttpAlertsGateway implements AlertsGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async list(page: number, pageSize: number): Promise<AlertsPage> {
    const { data, response } = await send(() =>
      this.api.GET('/api/v1/nutritionists/me/alerts', { params: { query: { page, pageSize } } }),
    );
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toAlertsPage(data);
  }

  async readAll(): Promise<void> {
    const { response } = await send(() =>
      this.api.POST('/api/v1/nutritionists/me/alerts/read-all', { parseAs: 'text' }),
    );
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
  }
}
