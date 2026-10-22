import { describe, expect, it, vi } from 'vitest';

import { foodQuery, searchFoods } from '@/modules/clinical-registry/application/searchFoods';

import { fakeFoodCatalogGateway } from '../../../../support/foods';

describe('searchFoods', () => {
  it.each([
    ['', null],
    ['   ', null],
    ['l', null],
    [' l ', null],
    ['la', 'la'],
    ['  lácteos  ', 'lácteos'],
  ])('foodQuery_%j_is%j', (text, query) => {
    expect(foodQuery(text)).toBe(query);
  });

  it('searchFoods_asksTheCatalog', async () => {
    const search = vi.fn().mockResolvedValue([]);

    await searchFoods(fakeFoodCatalogGateway({ search }), 'lácteos');

    expect(search).toHaveBeenCalledWith('lácteos');
  });
});
