import type { components } from '@/shared/infrastructure/api/generated/schema';

type MealEvent = components['schemas']['MealHistoryEvent'];
type SymptomEvent = components['schemas']['SymptomHistoryEvent'];
type NoteEvent = components['schemas']['ClinicalNoteHistoryEvent'];
export type HistoryEventDto = MealEvent | SymptomEvent | NoteEvent;

// Synthetic diary of a synthetic patient; the literals are the ones CP034 and CP087 quote.
export const CAUSA_ID = '00000000-0000-4000-8000-0000000001f1';
export const MEAL_ID = '00000000-0000-4000-8000-000000000101';
export const SYMPTOM_ID = '00000000-0000-4000-8000-000000000102';
export const NOTE_MEAL = 'Tuve un día de mucho estrés laboral';
export const NOTE_SYMPTOM = 'Tomé un analgésico en la mañana';

export function mealEvent(
  consumedAt: string,
  overrides: Partial<NonNullable<MealEvent['meal']>> = {},
): MealEvent {
  return {
    eventType: 'meal',
    occurredAt: consumedAt,
    meal: {
      mealId: MEAL_ID,
      clientGuid: '00000000-0000-4000-8000-000000000111',
      mealTime: 'Lunch',
      consumedAt,
      clientCreatedAt: consumedAt,
      syncStatus: 'Synced',
      items: [{ foodId: CAUSA_ID, customFoodId: null, quantity: 150, unit: 'Grams' }],
      aggregatedFodmap: 'Moderate',
      ...overrides,
    },
  } as MealEvent;
}

export function symptomEvent(
  occurredAt: string,
  overrides: Partial<NonNullable<SymptomEvent['symptom']>> = {},
): SymptomEvent {
  return {
    eventType: 'symptom',
    occurredAt,
    symptom: {
      symptomId: SYMPTOM_ID,
      clientGuid: '00000000-0000-4000-8000-000000000112',
      symptomType: 'AbdominalPain',
      intensity: 65,
      occurredAt,
      associatedMealId: null,
      hasMealAssociation: false,
      syncStatus: 'Synced',
      ...overrides,
    },
  } as SymptomEvent;
}

export function noteEvent(
  createdAt: string,
  content: string,
  link: { mealId?: string | null; symptomId?: string | null },
  noteId = '00000000-0000-4000-8000-000000000121',
): NoteEvent {
  return {
    eventType: 'clinical_note',
    occurredAt: createdAt,
    note: {
      noteId,
      clientGuid: '00000000-0000-4000-8000-000000000131',
      mealId: link.mealId ?? null,
      symptomId: link.symptomId ?? null,
      content,
      createdAt,
    },
  } as NoteEvent;
}

// CP034: today's lunch and pain, each with its note, newest first as the server sends them.
export const cp034History: HistoryEventDto[] = [
  noteEvent('2026-10-26T17:20:00Z', NOTE_SYMPTOM, { symptomId: SYMPTOM_ID }, 'n2'),
  noteEvent('2026-10-26T17:10:00Z', NOTE_MEAL, { mealId: MEAL_ID }, 'n1'),
  symptomEvent('2026-10-26T16:00:00Z'),
  mealEvent('2026-10-26T15:00:00Z'),
];
