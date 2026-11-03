import { describe, expect, it } from 'vitest';

import { buildDiary, type HistoryEvent } from '@/modules/clinical-registry/domain/PatientDiary';

const meal: HistoryEvent = {
  kind: 'meal',
  mealId: 'm1',
  mealTime: 'Lunch',
  consumedAt: new Date('2026-10-23T15:00:00Z'),
  items: [],
  fodmapLevel: 'Moderate',
};
const symptom: HistoryEvent = {
  kind: 'symptom',
  symptomId: 's1',
  symptomType: 'AbdominalPain',
  intensity: 65,
  occurredAt: new Date('2026-10-26T16:00:00Z'),
};

function note(id: string, at: string, link: { mealId?: string; symptomId?: string }): HistoryEvent {
  return {
    kind: 'note',
    note: {
      noteId: id,
      mealId: link.mealId ?? null,
      symptomId: link.symptomId ?? null,
      content: `nota ${id}`,
      createdAt: new Date(at),
    },
  };
}

describe('buildDiary', () => {
  it('attachesEachNoteToItsMealOrSymptom_oldestNoteFirst', () => {
    const entries = buildDiary(
      [
        note('n3', '2026-10-26T18:00:00Z', { mealId: 'm1' }),
        note('n2', '2026-10-26T17:00:00Z', { symptomId: 's1' }),
        symptom,
        note('n1', '2026-10-24T10:00:00Z', { mealId: 'm1' }),
        meal,
      ],
      null,
    );

    expect(entries.map((entry) => entry.kind)).toEqual(['symptom', 'meal']);
    expect(entries[0]?.notes.map((n) => n.noteId)).toEqual(['n2']);
    expect(entries[1]?.notes.map((n) => n.noteId)).toEqual(['n1', 'n3']);
  });

  it('keepsANoteWithoutItsRecordAsItsOwnEntry', () => {
    const entries = buildDiary(
      [note('n1', '2026-10-25T10:00:00Z', { mealId: 'other' }), meal],
      null,
    );

    expect(entries.map((entry) => entry.kind)).toEqual(['note', 'meal']);
  });

  it('marksTheRecordsBeforeTheAssignment', () => {
    const entries = buildDiary([symptom, meal], new Date('2026-10-26T12:00:00Z'));

    expect(entries.map((entry) => entry.beforeLink)).toEqual([false, true]);
  });

  it('withoutAssignment_marksNothing', () => {
    expect(buildDiary([meal], null)[0]?.beforeLink).toBe(false);
  });
});
