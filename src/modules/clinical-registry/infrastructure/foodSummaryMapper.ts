import { z } from 'zod';

import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';
import { ContractViolationError } from '@/shared/domain/errors';

const food = z.object({
  foodId: z.string().min(1),
  name: z.string().nullable(),
  fodmapLevel: z.enum(['Low', 'Moderate', 'High']),
});
const foods = z.array(food);

// The server already orders by name and caps the list; both are kept as they arrive.
export function toFoodSummaries(payload: unknown): FoodSummary[] {
  const parsed = foods.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('FoodItemSummary[]');
  }
  return parsed.data;
}

// The detail carries nutrients too; the portal only needs what a summary shows.
export function toFoodSummary(payload: unknown): FoodSummary {
  const parsed = food.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('FoodItemDetail');
  }
  return {
    foodId: parsed.data.foodId,
    name: parsed.data.name,
    fodmapLevel: parsed.data.fodmapLevel,
  };
}
