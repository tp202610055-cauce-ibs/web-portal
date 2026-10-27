export type GlossaryCategory = 'Nutritional' | 'ClinicalIbs' | 'System';

export interface GlossaryTerm {
  readonly term: string;
  readonly definition: string;
  readonly category: GlossaryCategory | null;
  readonly normalizedTerm: string;
  readonly normalizedDefinition: string;
}

export interface Glossary {
  readonly terms: GlossaryTerm[];
  readonly isDraft: boolean;
}

// The only contentStatus the server sends today: the content still awaits clinical validation.
export const DRAFT_CONTENT_STATUS = 'draft-pending-clinical-review';
export const SIMILAR_PREFIX_LENGTH = 5;
export const MAX_SIMILAR_TERMS = 3;

// Lower case, no accents and single spaces, the same folding the mobile app uses.
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function glossaryFrom(
  terms: { term: string; definition: string; category: GlossaryCategory | null }[],
  contentStatus: string | null,
): Glossary {
  return {
    terms: terms.map((entry) => ({
      ...entry,
      normalizedTerm: normalizeText(entry.term),
      normalizedDefinition: normalizeText(entry.definition),
    })),
    isDraft: contentStatus === DRAFT_CONTENT_STATUS,
  };
}

// Terms whose name or definition contain the query; an empty query lists every term.
export function searchGlossary(glossary: Glossary, query: string): GlossaryTerm[] {
  const needle = normalizeText(query);
  if (needle === '') {
    return glossary.terms;
  }
  return glossary.terms.filter(
    (entry) => entry.normalizedTerm.includes(needle) || entry.normalizedDefinition.includes(needle),
  );
}

function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a[index] === b[index]) {
    index++;
  }
  return index;
}

// For a query with no match: up to three terms whose name shares a five-letter prefix with it.
export function similarTerms(glossary: Glossary, query: string): GlossaryTerm[] {
  const needle = normalizeText(query);
  if (needle.length < SIMILAR_PREFIX_LENGTH) {
    return [];
  }
  return glossary.terms
    .filter((entry) => commonPrefixLength(entry.normalizedTerm, needle) >= SIMILAR_PREFIX_LENGTH)
    .sort((a, b) => a.normalizedTerm.localeCompare(b.normalizedTerm))
    .slice(0, MAX_SIMILAR_TERMS);
}
