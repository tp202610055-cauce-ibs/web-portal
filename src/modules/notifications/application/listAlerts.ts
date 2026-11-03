import type { AlertsGateway } from '@/modules/notifications/application/AlertsGateway';
import type { AlertsPage } from '@/modules/notifications/domain/NutritionistAlert';

// The newest alerts only; the panel says how many older ones it leaves out.
export const ALERTS_PAGE_SIZE = 20;
// Light polling while the tab is visible (decision D4: every 60 to 120 s, no web push).
export const POLL_INTERVAL_MS = 90 * 1000;
// A navigation reads again only when the last read is older than this.
export const STALE_AFTER_MS = 30 * 1000;

export function listAlerts(gateway: AlertsGateway): Promise<AlertsPage> {
  return gateway.list(1, ALERTS_PAGE_SIZE);
}

export function markAllAlertsRead(gateway: AlertsGateway): Promise<void> {
  return gateway.readAll();
}
