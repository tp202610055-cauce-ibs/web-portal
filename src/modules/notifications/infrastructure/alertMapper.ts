import { z } from 'zod';

import type {
  AlertsPage,
  NutritionistAlert,
} from '@/modules/notifications/domain/NutritionistAlert';
import { ContractViolationError } from '@/shared/domain/errors';

const TYPES = ['PatientLinked', 'PatientSubtypeChanged'] as const;

const page = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.string(),
        patientId: z.string().min(1),
        patientName: z.string().nullable(),
        patientCode: z.string().nullable(),
        message: z.string().nullable(),
        occurredAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
        isRead: z.boolean(),
      }),
    )
    .nullable(),
  totalCount: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
});

function isKnownType(value: string): value is NutritionistAlert['type'] {
  return (TYPES as readonly string[]).includes(value);
}

// Newest first, as the server orders them; an alert type this client does not know is dropped.
export function toAlertsPage(payload: unknown): AlertsPage {
  const parsed = page.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('NutritionistAlertListResult');
  }
  const items = (parsed.data.items ?? []).flatMap((item) => {
    const { type } = item;
    return isKnownType(type)
      ? [
          {
            alertId: item.id,
            type,
            patientId: item.patientId,
            patientName: item.patientName,
            patientCode: item.patientCode,
            message: item.message,
            occurredAt: item.occurredAt,
            isRead: item.isRead,
          },
        ]
      : [];
  });
  return { items, totalCount: parsed.data.totalCount, unreadCount: parsed.data.unreadCount };
}
