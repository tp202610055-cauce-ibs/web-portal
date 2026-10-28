import type { AlertsGateway } from '@/modules/notifications';
import type { components } from '@/shared/infrastructure/api/generated/schema';

type AlertDto = components['schemas']['NutritionistAlertDto'];
type AlertListDto = components['schemas']['NutritionistAlertListResult'];

// Synthetic alerts; the messages follow the server text for each type.
export function alertBody(overrides: Partial<AlertDto> = {}): AlertDto {
  return {
    id: '00000000-0000-4000-8000-0000000004a1',
    type: 'PatientLinked',
    patientId: '00000000-0000-4000-8000-0000000000a1',
    patientName: 'María Fernanda López Quispe',
    patientCode: 'P-0042',
    message: 'María Fernanda López Quispe se vinculó a tu seguimiento.',
    occurredAt: '2026-10-27T15:00:00Z',
    isRead: false,
    readAt: null,
    ...overrides,
  };
}

export function alertListBody(
  items: AlertDto[] = [alertBody()],
  overrides: Partial<AlertListDto> = {},
): AlertListDto {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    unreadCount: items.filter((item) => !item.isRead).length,
    ...overrides,
  };
}

// The bell stays empty and never polls into a pending promise unless a test provides its own.
export function fakeAlertsGateway(overrides: Partial<AlertsGateway> = {}): AlertsGateway {
  return {
    list: async () => ({ items: [], totalCount: 0, unreadCount: 0 }),
    readAll: async () => undefined,
    ...overrides,
  };
}
