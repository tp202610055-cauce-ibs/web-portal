import { describe, expect, it } from 'vitest';

import {
  checkDraft,
  draftFrom,
  hasProblems,
  withAction,
  withFood,
  withoutItem,
  withReasoning,
  withSubstitute,
} from '@/modules/recommendations/domain/recommendationDraft';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';

import { CARROT_ID, cp086Pending, detailBody, ONION_ID } from '../../../../support/recommendations';

const original = toRecommendationDetail(cp086Pending);
const ONION_KEY = '00000000-0000-4000-8000-0000000000c2';
const DAIRY = { foodId: '00000000-0000-4000-8000-0000000000f9', name: 'Lácteos con lactosa' };

describe('recommendationDraft', () => {
  it('draftFrom_copiesTheEditableContentUntouched', () => {
    const draft = draftFrom(original);

    expect(draft.title).toBe('Reducir cebolla y ajo');
    expect(draft.steps).toEqual(['Cocinar la zanahoria al vapor']);
    expect(draft.items.map((item) => [item.foodId, item.action, item.reasoning])).toEqual([
      [CARROT_ID, 'Suggest', ''],
      [ONION_ID, 'Reduce', 'Alto contenido de fructanos.'],
      ['00000000-0000-4000-8000-0000000000f3', 'Reduce', 'Alto contenido de fructanos.'],
    ]);
    expect(draft.itemsTouched).toBe(false);
    expect(hasProblems(checkDraft(original, draft))).toBe(false);
  });

  it('draftFrom_withoutTitleOrDescription_startsEmpty', () => {
    const draft = draftFrom(toRecommendationDetail(detailBody({ title: null, description: null })));

    expect(draft.title).toBe('');
    expect(draft.description).toBe('');
  });

  // CP086 step 4: a food added from the search starts as Reduce and touches the list.
  it('withFood_addsItAsReduce', () => {
    const draft = withFood(draftFrom(original), DAIRY, 'new-1');

    expect(draft.items.at(-1)).toEqual({
      key: 'new-1',
      foodId: DAIRY.foodId,
      foodName: 'Lácteos con lactosa',
      action: 'Reduce',
      reasoning: '',
      substituteFoodId: null,
      substituteFoodName: null,
    });
    expect(draft.itemsTouched).toBe(true);
  });

  it('withFood_alreadyInTheList_isIgnored', () => {
    const draft = draftFrom(original);

    expect(withFood(draft, { foodId: ONION_ID, name: 'Cebolla' }, 'new-1')).toBe(draft);
  });

  it('withAction_awayFromSubstitute_clearsTheSubstitute', () => {
    const substituted = withSubstitute(
      withAction(draftFrom(original), ONION_KEY, 'Substitute'),
      ONION_KEY,
      { foodId: CARROT_ID, name: 'Zanahoria cocida' },
    );

    const avoided = withAction(substituted, ONION_KEY, 'Avoid');

    expect(substituted.items[1]?.substituteFoodId).toBe(CARROT_ID);
    expect(avoided.items[1]).toMatchObject({
      action: 'Avoid',
      substituteFoodId: null,
      substituteFoodName: null,
    });
  });

  it('substitute_withoutFood_isRequired', () => {
    const draft = withAction(draftFrom(original), ONION_KEY, 'Substitute');

    expect(checkDraft(original, draft).items).toEqual({ [ONION_KEY]: 'substitute-required' });
  });

  it('substitute_sameAsTheFood_isRefused', () => {
    const draft = withSubstitute(
      withAction(draftFrom(original), ONION_KEY, 'Substitute'),
      ONION_KEY,
      { foodId: ONION_ID, name: 'Cebolla' },
    );

    expect(checkDraft(original, draft).items).toEqual({ [ONION_KEY]: 'substitute-same' });
  });

  it('withReasoning_changesOnlyThatItem', () => {
    const draft = withReasoning(draftFrom(original), ONION_KEY, 'Nueva razón');

    expect(draft.items.map((item) => item.reasoning)).toEqual([
      '',
      'Nueva razón',
      'Alto contenido de fructanos.',
    ]);
    expect(draft.itemsTouched).toBe(true);
  });

  it('noItems_isAProblem', () => {
    let draft = draftFrom(original);
    for (const item of draft.items) {
      draft = withoutItem(draft, item.key);
    }

    expect(draft.items).toEqual([]);
    expect(checkDraft(original, draft).noItems).toBe(true);
  });

  it.each([
    ['empty', '', 'empty'],
    ['only spaces', '   ', 'empty'],
    ['over 200', 'a'.repeat(201), 'too-long'],
    ['exactly 200', 'a'.repeat(200), null],
  ])('title_%s_is%s', (_name, title, problem) => {
    expect(checkDraft(original, { ...draftFrom(original), title }).title).toBe(problem);
  });

  it('description_erasedWhenItHadText_isAProblem', () => {
    expect(checkDraft(original, { ...draftFrom(original), description: '  ' }).description).toBe(
      'empty',
    );
  });

  it('description_emptyWhenItHadNone_isAccepted', () => {
    const withoutDescription = toRecommendationDetail(detailBody({ description: null }));

    expect(checkDraft(withoutDescription, draftFrom(withoutDescription)).description).toBeNull();
  });
});
