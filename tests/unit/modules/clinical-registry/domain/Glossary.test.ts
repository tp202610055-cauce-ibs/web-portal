import { describe, expect, it } from 'vitest';

import {
  glossaryFrom,
  searchGlossary,
  similarTerms,
} from '@/modules/clinical-registry/domain/Glossary';

const glossary = glossaryFrom(
  [
    {
      term: 'Disacáridos',
      definition: 'Azúcares formados por dos moléculas.',
      category: 'Nutritional',
    },
    {
      term: 'Disbiosis',
      definition: 'Desequilibrio de la flora intestinal.',
      category: 'ClinicalIbs',
    },
    { term: 'FODMAP', definition: 'Carbohidratos fermentables.', category: 'Nutritional' },
    { term: 'Línea base', definition: 'Tu primer puntaje IBS-SSS.', category: 'System' },
  ],
  'draft-pending-clinical-review',
);

describe('glossary search (same rule as the mobile app)', () => {
  it('matchesTheTermOrTheDefinition_ignoringCaseAndAccents', () => {
    expect(searchGlossary(glossary, 'fodmap').map((t) => t.term)).toEqual(['FODMAP']);
    expect(searchGlossary(glossary, 'LINEA BASE').map((t) => t.term)).toEqual(['Línea base']);
    expect(searchGlossary(glossary, 'flora').map((t) => t.term)).toEqual(['Disbiosis']);
  });

  it('withAnEmptyQuery_returnsEveryTerm', () => {
    expect(searchGlossary(glossary, '  ')).toHaveLength(4);
  });

  // CP069: «disacaridasas» shares «disacarid» with «Disacáridos»; «xyzqw» resembles nothing.
  it('similarTerms_shareAPrefixOfAtLeastFiveLetters', () => {
    expect(searchGlossary(glossary, 'disacaridasas')).toEqual([]);
    expect(similarTerms(glossary, 'disacaridasas').map((t) => t.term)).toEqual(['Disacáridos']);
    expect(similarTerms(glossary, 'xyzqw')).toEqual([]);
    expect(similarTerms(glossary, 'dis')).toEqual([]);
  });

  it('similarTerms_offersAtMostThree', () => {
    const many = glossaryFrom(
      ['Fibra a', 'Fibra b', 'Fibra c', 'Fibra d'].map((term) => ({
        term,
        definition: '',
        category: 'Nutritional' as const,
      })),
      null,
    );

    expect(similarTerms(many, 'fibras')).toHaveLength(3);
    expect(many.isDraft).toBe(false);
  });
});
