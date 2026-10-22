import { z } from 'zod';

import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';
import { ContractViolationError } from '@/shared/domain/errors';

const foods = z.array(
  z.object({
    foodId: z.string().min(1),
    name: z.string().nullable(),
    fodmapLevel: z.enum(['Low', 'Moderate', 'High']),
  }),
);

// The server already orders by name and caps the list; both are kept as they arrive.
export function toFoodSummaries(payload: unknown): FoodSummary[] {
  const parsed = foods.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('FoodItemSummary[]');
  }
  return parsed.data;
}
