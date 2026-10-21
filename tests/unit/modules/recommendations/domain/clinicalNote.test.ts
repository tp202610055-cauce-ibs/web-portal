import { describe, expect, it } from 'vitest';

import { checkClinicalNote } from '@/modules/recommendations/domain/clinicalNote';

import { NOTE_CP045, NOTE_CP046, NOTE_NINE, NOTE_TEN } from '../../../../support/recommendations';

describe('checkClinicalNote', () => {
  it.each([
    ['empty', ''],
    ['only spaces', '   \n  '],
  ])('note_%s_isEmpty', (_name, text) => {
    expect(checkClinicalNote(text)).toBe('empty');
  });

  // CP046 variant B: nine characters are one short of the minimum.
  it('note_withNineCharacters_isTooShort', () => {
    expect(NOTE_NINE).toHaveLength(9);
    expect(checkClinicalNote(NOTE_NINE)).toBe('too-short');
  });

  it('note_withSpacesAroundNineCharacters_isStillTooShort', () => {
    expect(checkClinicalNote(`   ${NOTE_NINE}   `)).toBe('too-short');
  });

  it('note_withExactlyTenCharacters_isAccepted', () => {
    expect(NOTE_TEN).toHaveLength(10);
    expect(checkClinicalNote(NOTE_TEN)).toBeNull();
  });

  it.each([
    ['CP045', NOTE_CP045, 45],
    ['CP046', NOTE_CP046, 47],
  ])('note_of%s_isAccepted', (_name, note, length) => {
    expect(note).toHaveLength(length);
    expect(checkClinicalNote(note)).toBeNull();
  });

  it('note_withTwoThousandCharacters_isAccepted', () => {
    expect(checkClinicalNote('a'.repeat(2000))).toBeNull();
  });

  it('note_overTwoThousandCharacters_isTooLong', () => {
    expect(checkClinicalNote('a'.repeat(2001))).toBe('too-long');
  });

  it('note_withSpacesAroundTwoThousandCharacters_isAccepted', () => {
    expect(checkClinicalNote(`  ${'a'.repeat(2000)}  `)).toBeNull();
  });
});
