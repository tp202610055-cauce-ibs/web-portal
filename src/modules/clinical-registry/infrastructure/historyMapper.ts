import { z } from 'zod';

import type { HistoryEvent } from '@/modules/clinical-registry/domain/PatientDiary';
import { ContractViolationError } from '@/shared/domain/errors';

const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));
const FODMAP = ['Low', 'Moderate', 'High'] as const;

const meal = z.object({
  mealId: z.string().min(1),
  mealTime: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  consumedAt: instant,
  items: z
    .array(
      z.object({
        foodId: z.string().min(1).nullable(),
        customFoodId: z.string().min(1).nullable(),
        quantity: z.number(),
        unit: z.enum(['Grams', 'Cups', 'Units', 'Ounces', 'Tablespoons']),
      }),
    )
    .nullable(),
  aggregatedFodmap: z.enum(FODMAP).nullable().catch(null),
});

const symptom = z.object({
  symptomId: z.string().min(1),
  symptomType: z.enum([
    'AbdominalPain',
    'Bloating',
    'Flatulence',
    'Diarrhea',
    'Constipation',
    'Other',
    'Nausea',
    'Reflux',
    'Urgency',
  ]),
  intensity: z.number().int(),
  occurredAt: instant,
});

const note = z.object({
  noteId: z.string().min(1),
  mealId: z.string().min(1).nullable(),
  symptomId: z.string().min(1).nullable(),
  content: z.string().nullable(),
  createdAt: instant,
});

const event = z.discriminatedUnion('eventType', [
  z.object({ eventType: z.literal('meal'), meal }),
  z.object({ eventType: z.literal('symptom'), symptom }),
  z.object({ eventType: z.literal('clinical_note'), note }),
]);

const KNOWN = new Set(['meal', 'symptom', 'clinical_note']);
const events = z.array(z.looseObject({ eventType: z.string() }));

// An event type this client does not know is dropped; a known one outside the contract fails.
export function toHistoryEvents(payload: unknown): HistoryEvent[] {
  const list = events.safeParse(payload);
  if (!list.success) {
    throw new ContractViolationError('HistoryEvent[]');
  }
  return list.data
    .filter((item) => KNOWN.has(item.eventType))
    .map((item) => {
      const parsed = event.safeParse(item);
      if (!parsed.success) {
        throw new ContractViolationError('HistoryEvent');
      }
      const value = parsed.data;
      switch (value.eventType) {
        case 'meal':
          return {
            kind: 'meal',
            mealId: value.meal.mealId,
            mealTime: value.meal.mealTime,
            consumedAt: value.meal.consumedAt,
            items: value.meal.items ?? [],
            fodmapLevel: value.meal.aggregatedFodmap,
          };
        case 'symptom':
          return { kind: 'symptom', ...value.symptom };
        case 'clinical_note':
          return { kind: 'note', note: value.note };
      }
    });
}
