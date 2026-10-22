import { describe, expect, it, vi } from 'vitest';

import {
  buildModification,
  hasChanges,
  submitModification,
} from '@/modules/recommendations/application/modifyRecommendation';
import {
  draftFrom,
  withAction,
  withFood,
  withoutItem,
} from '@/modules/recommendations/domain/recommendationDraft';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';

import {
  CARROT_ID,
  cp086Pending,
  fakeRecommendationsGateway,
  GARLIC_ID,
  NOTE_CP086,
  ONION_ID,
  PENDING_ID,
  STEP_CP086,
} from '../../../../support/recommendations';

const original = toRecommendationDetail(cp086Pending);
const DAIRY_ID = '00000000-0000-4000-8000-0000000000f9';

describe('buildModification', () => {
  it('untouchedDraft_keepsEverythingAndHasNoChanges', () => {
    const request = buildModification(original, draftFrom(original), `  ${NOTE_CP086}  `);

    expect(request).toEqual({
      clinicalNote: NOTE_CP086,
      title: null,
      description: null,
      steps: null,
      items: null,
    });
    expect(hasChanges(request)).toBe(false);
  });

  // CP086 steps 4 to 6: dairy added to reduce, the step edited and the note; title and description stay.
  it('cp086_sendsTheFullListAndTheNewStep', () => {
    const draft = {
      ...withFood(draftFrom(original), { foodId: DAIRY_ID, name: 'Lácteos con lactosa' }, 'n1'),
      steps: [STEP_CP086],
    };

    const request = buildModification(original, draft, NOTE_CP086);

    expect(request).toEqual({
      clinicalNote: NOTE_CP086,
      title: null,
      description: null,
      steps: [STEP_CP086],
      items: [
        { foodId: CARROT_ID, actionType: 'Suggest', reasoning: null, substituteFoodId: null },
        {
          foodId: ONION_ID,
          actionType: 'Reduce',
          reasoning: 'Alto contenido de fructanos.',
          substituteFoodId: null,
        },
        {
          foodId: GARLIC_ID,
          actionType: 'Reduce',
          reasoning: 'Alto contenido de fructanos.',
          substituteFoodId: null,
        },
        { foodId: DAIRY_ID, actionType: 'Reduce', reasoning: null, substituteFoodId: null },
      ],
    });
    expect(hasChanges(request)).toBe(true);
  });

  it('touchedListBackToItsStart_isStillSentAsAList', () => {
    const draft = withAction(
      withAction(draftFrom(original), '00000000-0000-4000-8000-0000000000c2', 'Avoid'),
      '00000000-0000-4000-8000-0000000000c2',
      'Reduce',
    );

    const request = buildModification(original, draft, NOTE_CP086);

    expect(request.items).toHaveLength(3);
  });

  it('removedItem_sendsTheRemainingList', () => {
    const draft = withoutItem(draftFrom(original), '00000000-0000-4000-8000-0000000000c1');

    expect(
      buildModification(original, draft, NOTE_CP086).items?.map((item) => item.foodId),
    ).toEqual([ONION_ID, GARLIC_ID]);
  });

  it('changedTitleAndDescription_travelTrimmed', () => {
    const draft = { ...draftFrom(original), title: '  Nuevo título  ', description: ' Nueva. ' };

    const request = buildModification(original, draft, NOTE_CP086);

    expect(request.title).toBe('Nuevo título');
    expect(request.description).toBe('Nueva.');
  });

  it('titleWithOnlyOuterSpacesAdded_isUnchanged', () => {
    const draft = { ...draftFrom(original), title: ' Reducir cebolla y ajo ' };

    expect(buildModification(original, draft, NOTE_CP086).title).toBeNull();
  });

  it('blankStepRows_areDropped', () => {
    const draft = { ...draftFrom(original), steps: ['Cocinar la zanahoria al vapor', '  '] };

    expect(buildModification(original, draft, NOTE_CP086).steps).toBeNull();
  });

  it('allStepsRemoved_sendsAnEmptyList', () => {
    const draft = { ...draftFrom(original), steps: [] };

    expect(buildModification(original, draft, NOTE_CP086).steps).toEqual([]);
  });

  it('reorderedSteps_areAChange', () => {
    const twoSteps = toRecommendationDetail({ ...cp086Pending, steps: ['Uno', 'Dos'] });
    const draft = { ...draftFrom(twoSteps), steps: ['Dos', 'Uno'] };

    expect(buildModification(twoSteps, draft, NOTE_CP086).steps).toEqual(['Dos', 'Uno']);
  });
});

describe('submitModification', () => {
  it('sendsTheRequestWithItsKey', async () => {
    const modify = vi.fn().mockResolvedValue(undefined);
    const request = buildModification(original, draftFrom(original), NOTE_CP086);

    await submitModification(fakeRecommendationsGateway({ modify }), PENDING_ID, request, 'k1');

    expect(modify).toHaveBeenCalledWith(PENDING_ID, request, 'k1');
  });
});
