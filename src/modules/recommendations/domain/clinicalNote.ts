export const CLINICAL_NOTE_MIN_LENGTH = 10;
export const CLINICAL_NOTE_MAX_LENGTH = 2000;

export type ClinicalNoteProblem = 'empty' | 'too-short' | 'too-long';

// Measured on the trimmed text, which is what the server stores. It only warns: the server decides.
export function checkClinicalNote(text: string): ClinicalNoteProblem | null {
  const length = text.trim().length;
  if (length === 0) {
    return 'empty';
  }
  if (length < CLINICAL_NOTE_MIN_LENGTH) {
    return 'too-short';
  }
  return length > CLINICAL_NOTE_MAX_LENGTH ? 'too-long' : null;
}
