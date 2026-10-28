import type { AlertsPage } from '@/modules/notifications/domain/NutritionistAlert';

// Both throw ServiceUnavailableError when the server cannot answer; list also throws
// ContractViolationError when the response does not match the contract.
export interface AlertsGateway {
  list(page: number, pageSize: number): Promise<AlertsPage>;
  readAll(): Promise<void>;
}
