import {
  checkClinicalNote,
  type ClinicalNoteProblem,
} from '@/modules/recommendations/domain/clinicalNote';
import { TITLE_MAX_LENGTH } from '@/modules/recommendations/domain/recommendationDraft';

export const DESCRIPTION_MAX_LENGTH = 4000;
export const STEP_MAX_LENGTH = 500;

export interface ManualDraft {
  readonly title: string;
  readonly description: string;
  readonly steps: string[];
  readonly note: string;
}

export interface ManualRequest {
  readonly patientId: string;
  readonly title: string;
  readonly description: string;
  readonly steps: string[];
  readonly clinicalNote: string;
}

export interface ManualProblems {
  readonly title: 'empty' | 'too-long' | null;
  readonly description: 'empty' | 'too-long' | null;
  // Indexes of the steps over the limit; an empty step is dropped, never an error.
  readonly steps: number[];
  readonly note: ClinicalNoteProblem | null;
}

function lengthProblem(text: string, max: number): 'empty' | 'too-long' | null {
  const length = text.trim().length;
  if (length === 0) {
    return 'empty';
  }
  return length > max ? 'too-long' : null;
}

// The limits the server applies to a manual recommendation; it only warns before sending.
export function checkManualDraft(draft: ManualDraft): ManualProblems {
  return {
    title: lengthProblem(draft.title, TITLE_MAX_LENGTH),
    description: lengthProblem(draft.description, DESCRIPTION_MAX_LENGTH),
    steps: draft.steps.flatMap((step, index) =>
      step.trim().length > STEP_MAX_LENGTH ? [index] : [],
    ),
    note: checkClinicalNote(draft.note),
  };
}

export function hasManualProblems(problems: ManualProblems): boolean {
  return (
    problems.title !== null ||
    problems.description !== null ||
    problems.steps.length > 0 ||
    problems.note !== null
  );
}

// Everything travels trimmed, which is what the server measures and stores.
export function toManualRequest(patientId: string, draft: ManualDraft): ManualRequest {
  return {
    patientId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    steps: draft.steps.map((step) => step.trim()).filter((step) => step !== ''),
    clinicalNote: draft.note.trim(),
  };
}
