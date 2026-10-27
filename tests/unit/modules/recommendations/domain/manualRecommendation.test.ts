import { describe, expect, it } from 'vitest';

import {
  checkManualDraft,
  hasManualProblems,
  toManualRequest,
  type ManualDraft,
} from '@/modules/recommendations/domain/manualRecommendation';

const PATIENT = '00000000-0000-4000-8000-0000000000a1';
// CP072 data: title, description, three steps and the 45-character note.
const cp072: ManualDraft = {
  title: '  Reducción gradual de lácteos ',
  description:
    'Disminuir poco a poco los lácteos de la dieta durante tres semanas y observar los síntomas',
  steps: [
    'Semana 1: cambiar la leche entera por leche sin lactosa',
    '',
    'Semana 2: reducir el yogur a una porción diaria',
    'Semana 3: anotar en el diario los síntomas después de cada comida con lácteos',
  ],
  note: 'Reducir lácteos por intolerancia a la lactosa',
};

describe('manual recommendation draft', () => {
  it('cp072_hasNoProblems_andTravelsTrimmedWithoutEmptySteps', () => {
    expect(hasManualProblems(checkManualDraft(cp072))).toBe(false);
    expect(toManualRequest(PATIENT, cp072)).toEqual({
      patientId: PATIENT,
      title: 'Reducción gradual de lácteos',
      description: cp072.description,
      steps: [cp072.steps[0], cp072.steps[2], cp072.steps[3]],
      clinicalNote: cp072.note,
    });
  });

  // CP090: no steps at all is valid.
  it('withoutSteps_isValid', () => {
    expect(hasManualProblems(checkManualDraft({ ...cp072, steps: [] }))).toBe(false);
  });

  // CP073 variants A to D.
  it.each([
    [{ title: ' ' }, 'title', 'empty'],
    [{ title: 'x'.repeat(201) }, 'title', 'too-long'],
    [{ description: '' }, 'description', 'empty'],
    [{ description: 'x'.repeat(4001) }, 'description', 'too-long'],
    [{ note: '' }, 'note', 'empty'],
    [{ note: 'Muy poco.' }, 'note', 'too-short'],
  ] as const)('%o_reports %s as %s', (change, field, problem) => {
    const problems = checkManualDraft({ ...cp072, ...change });

    expect(problems[field]).toBe(problem);
    expect(hasManualProblems(problems)).toBe(true);
  });

  it('aStepOver500Characters_isMarked', () => {
    const problems = checkManualDraft({ ...cp072, steps: ['ok', 'x'.repeat(501)] });

    expect(problems.steps).toEqual([1]);
    expect(hasManualProblems(problems)).toBe(true);
  });
});
