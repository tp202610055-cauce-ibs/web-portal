import type { FodmapLevel } from '@/modules/clinical-registry/domain/FoodSummary';

export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type MeasurementUnit = 'Grams' | 'Cups' | 'Units' | 'Ounces' | 'Tablespoons';
export type SymptomType =
  | 'AbdominalPain'
  | 'Bloating'
  | 'Flatulence'
  | 'Diarrhea'
  | 'Constipation'
  | 'Other'
  | 'Nausea'
  | 'Reflux'
  | 'Urgency';

// A catalog food has foodId; a food the patient created has customFoodId instead.
export interface MealItem {
  readonly foodId: string | null;
  readonly customFoodId: string | null;
  readonly quantity: number;
  readonly unit: MeasurementUnit;
}

// The patient's context note; it belongs to the meal or the symptom whose id it carries.
export interface DiaryNote {
  readonly noteId: string;
  readonly mealId: string | null;
  readonly symptomId: string | null;
  readonly content: string | null;
  readonly createdAt: Date;
}

export type HistoryEvent =
  | {
      readonly kind: 'meal';
      readonly mealId: string;
      readonly mealTime: MealTime;
      readonly consumedAt: Date;
      readonly items: MealItem[];
      readonly fodmapLevel: FodmapLevel | null;
    }
  | {
      readonly kind: 'symptom';
      readonly symptomId: string;
      readonly symptomType: SymptomType;
      readonly intensity: number;
      readonly occurredAt: Date;
    }
  | { readonly kind: 'note'; readonly note: DiaryNote };

type MealEvent = Extract<HistoryEvent, { kind: 'meal' }>;
type SymptomEvent = Extract<HistoryEvent, { kind: 'symptom' }>;

// One line of the diary with its notes; beforeLink marks what happened before the assignment.
export type DiaryEntry =
  | {
      readonly kind: 'meal';
      readonly meal: MealEvent;
      readonly at: Date;
      readonly beforeLink: boolean;
      readonly notes: DiaryNote[];
    }
  | {
      readonly kind: 'symptom';
      readonly symptom: SymptomEvent;
      readonly at: Date;
      readonly beforeLink: boolean;
      readonly notes: DiaryNote[];
    }
  | {
      readonly kind: 'note';
      readonly note: DiaryNote;
      readonly at: Date;
      readonly beforeLink: boolean;
      readonly notes: DiaryNote[];
    };

export class HistoryAccessDeniedError extends Error {
  constructor() {
    super('The nutritionist is not assigned to this patient.');
    this.name = 'HistoryAccessDeniedError';
  }
}

function recordKey(kind: 'meal' | 'symptom', id: string): string {
  return `${kind}:${id}`;
}

function noteOwner(note: DiaryNote): string | null {
  if (note.mealId !== null) {
    return recordKey('meal', note.mealId);
  }
  return note.symptomId === null ? null : recordKey('symptom', note.symptomId);
}

// Newest first; each note goes under its record, oldest note first, or stands alone if the record is
// outside the range. The assignment instant comes from the server; null marks nothing.
export function buildDiary(events: HistoryEvent[], assignedAt: Date | null): DiaryEntry[] {
  const before = (at: Date) => assignedAt !== null && at.getTime() < assignedAt.getTime();
  const owners = new Set<string>();
  for (const event of events) {
    if (event.kind === 'meal') {
      owners.add(recordKey('meal', event.mealId));
    } else if (event.kind === 'symptom') {
      owners.add(recordKey('symptom', event.symptomId));
    }
  }
  const notesByOwner = new Map<string, DiaryNote[]>();
  const entries: DiaryEntry[] = [];
  for (const event of events) {
    if (event.kind !== 'note') {
      continue;
    }
    const owner = noteOwner(event.note);
    if (owner !== null && owners.has(owner)) {
      notesByOwner.set(owner, [...(notesByOwner.get(owner) ?? []), event.note]);
    } else {
      const at = event.note.createdAt;
      entries.push({ kind: 'note', note: event.note, at, beforeLink: before(at), notes: [] });
    }
  }
  const notesOf = (key: string) =>
    [...(notesByOwner.get(key) ?? [])].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  for (const event of events) {
    if (event.kind === 'meal') {
      const at = event.consumedAt;
      entries.push({
        kind: 'meal',
        meal: event,
        at,
        beforeLink: before(at),
        notes: notesOf(recordKey('meal', event.mealId)),
      });
    } else if (event.kind === 'symptom') {
      const at = event.occurredAt;
      entries.push({
        kind: 'symptom',
        symptom: event,
        at,
        beforeLink: before(at),
        notes: notesOf(recordKey('symptom', event.symptomId)),
      });
    }
  }
  return entries.sort((a, b) => b.at.getTime() - a.at.getTime());
}
