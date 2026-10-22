import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { FoodCatalogProvider } from '@/modules/clinical-registry';
import { toFoodSummaries } from '@/modules/clinical-registry/infrastructure/foodSummaryMapper';
import { PatientsProvider } from '@/modules/patients';
import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { DecisionRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationReviewPage } from '@/modules/recommendations/presentation/RecommendationReviewPage';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { es } from '@/shared/presentation/i18n/es';

import { DAIRY_ID, dairyResults, foodBody, MILK_ID } from '../../../../support/foods';
import { fakePatientsGateway } from '../../../../support/patients';
import {
  CARROT_ID,
  cp086Pending,
  detailBody,
  fakeRecommendationsGateway,
  GARLIC_ID,
  NOTE_CP086,
  NOTE_NINE,
  NOTE_TEN,
  ONION_ID,
  PENDING_ID,
  STEP_CP086,
} from '../../../../support/recommendations';

const pending = toRecommendationDetail(cp086Pending);
const dairy = toFoodSummaries(dairyResults);

function renderModify(overrides: Partial<RecommendationsGateway>) {
  const router = createMemoryRouter(
    [
      { path: '/recomendaciones/:recommendationId', element: <RecommendationReviewPage /> },
      { path: '/revisiones', element: <p>Cola</p> },
    ],
    { initialEntries: [`/recomendaciones/${PENDING_ID}`] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway()}>
        <FoodCatalogProvider gateway={{ search: async () => dairy }}>
          <RecommendationsProvider
            gateway={fakeRecommendationsGateway({ getDetail: async () => pending, ...overrides })}
          >
            <RouterProvider router={router} />
          </RecommendationsProvider>
        </FoodCatalogProvider>
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return router;
}

function noteField(): HTMLElement {
  return screen.getByRole('textbox', { name: es.decision.noteLabel });
}

function confirm(user: UserEvent) {
  return user.click(screen.getByRole('button', { name: es.decision.confirmModify }));
}

function editedFoods(): string[] {
  const table = screen.getByRole('table', { name: es.editor.itemsCaption });
  return within(table)
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent ?? '');
}

async function openModify(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: es.decision.modify }));
}

async function addFood(user: UserEvent, name: RegExp, label: string = es.editor.addFood) {
  await user.type(screen.getByRole('searchbox', { name: label }), 'lác');
  await user.click(await screen.findByRole('button', { name: name }));
}

function modifySpy() {
  return vi.fn<RecommendationsGateway['modify']>().mockResolvedValue(undefined);
}

describe('modifying a recommendation', () => {
  it('modify_opensTheEditorBesideTheNoteField', async () => {
    const user = userEvent.setup();
    renderModify({});

    await openModify(user);

    expect(screen.getByRole('heading', { name: es.editor.title })).toBeInTheDocument();
    expect(noteField()).toHaveFocus();
    expect(screen.getByRole('textbox', { name: es.editor.titleLabel })).toHaveValue(
      'Reducir cebolla y ajo',
    );
    expect(screen.getByRole('textbox', { name: es.editor.stepLabel(1) })).toHaveValue(
      'Cocinar la zanahoria al vapor',
    );
    expect(editedFoods()).toEqual(['Zanahoria cocida', 'Cebolla', 'Ajo']);
    expect(screen.queryByText(es.recommendation.supportingTitle)).not.toBeInTheDocument();
  });

  it('allowedActions_withoutModify_offersNoModification', async () => {
    renderModify({
      getDetail: async () =>
        toRecommendationDetail(detailBody({ allowedActions: ['Approve', 'Reject'] })),
    });

    await screen.findByRole('button', { name: es.decision.approve });

    expect(screen.queryByRole('button', { name: es.decision.modify })).not.toBeInTheDocument();
  });

  // CP047 steps 3 to 8: empty and nine-character notes are refused, the change stays, ten passes.
  it('modify_cp047_keepsTheChangeUntilTheNoteIsValid', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    const router = renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    expect(editedFoods()).toEqual(['Zanahoria cocida', 'Cebolla', 'Ajo', 'Lácteos con lactosa']);

    await confirm(user);
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteEmpty);
    await user.type(noteField(), NOTE_NINE);
    await confirm(user);
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteTooShort);
    expect(modify).not.toHaveBeenCalled();
    expect(editedFoods()).toContain('Lácteos con lactosa');

    await user.clear(noteField());
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/revisiones'));
    expect(router.state.location.state).toEqual({ reviewOutcome: 'modified' });
    expect(modify).toHaveBeenCalledWith(
      PENDING_ID,
      {
        clinicalNote: NOTE_TEN,
        title: null,
        description: null,
        steps: null,
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
      },
      expect.any(String),
    );
  });

  // CP086 steps 3 to 7: dairy added to reduce, the step changed and the 36-character note.
  it('modify_cp086_sendsTheFoodsTheStepAndTheNote', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    const step = screen.getByRole('textbox', { name: es.editor.stepLabel(1) });
    await user.clear(step);
    await user.type(step, STEP_CP086);
    expect(NOTE_CP086).toHaveLength(36);
    await user.type(noteField(), NOTE_CP086);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: es.editor.actionLabel('Lácteos con lactosa') }),
    ).toHaveValue('Reduce');
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    const [, request] = modify.mock.calls[0] ?? [];
    expect(request).toMatchObject({ clinicalNote: NOTE_CP086, steps: [STEP_CP086] });
    expect(request?.items?.map((item) => item.foodId)).toEqual([
      CARROT_ID,
      ONION_ID,
      GARLIC_ID,
      DAIRY_ID,
    ]);
  });

  it('modify_withoutChanges_asksToApproveAsIs', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noChanges);
    expect(modify).not.toHaveBeenCalled();
  });

  it('modify_onlyChangingTheTitle_sendsTheTrimmedTitleAndKeepsTheList', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    const title = screen.getByRole('textbox', { name: es.editor.titleLabel });
    await user.clear(title);
    await user.type(title, '  Reducir cebolla  ');
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1]).toMatchObject({ title: 'Reducir cebolla', items: null });
  });

  it.each([
    ['empty', '   ', es.editor.titleEmpty],
    ['over 200 characters', 'a'.repeat(201), es.editor.titleTooLong],
  ])('title_%s_isRefusedInTheField', async (_name, value, message) => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    const title = screen.getByRole('textbox', { name: es.editor.titleLabel });
    await user.clear(title);
    await user.click(title);
    await user.paste(value);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription(message);
    expect(screen.getByText(es.decision.reviewChanges)).toBeInTheDocument();
    expect(modify).not.toHaveBeenCalled();
  });

  it('description_erased_isRefusedInTheField', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await user.clear(screen.getByRole('textbox', { name: es.editor.descriptionLabel }));
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(
      screen.getByRole('textbox', { name: es.editor.descriptionLabel }),
    ).toHaveAccessibleDescription(es.editor.descriptionEmpty);
    expect(modify).not.toHaveBeenCalled();
  });

  it('removingEveryFood_isRefused', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    for (const food of ['Zanahoria cocida', 'Cebolla', 'Ajo']) {
      await user.click(screen.getByRole('button', { name: es.editor.removeItem(food) }));
    }
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(screen.getByText(es.editor.noItems)).toBeInTheDocument();
    expect(modify).not.toHaveBeenCalled();
  });

  it('removingOneFood_sendsTheRemainingList', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await user.click(screen.getByRole('button', { name: es.editor.removeItem('Ajo') }));
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1].items?.map((item) => item.foodId)).toEqual([
      CARROT_ID,
      ONION_ID,
    ]);
  });

  // Substitute needs a substitute chosen with the same search; another action clears it.
  it('substitute_isRequiredAndClearedWhenTheActionChanges', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    const action = screen.getByRole('combobox', { name: es.editor.actionLabel('Cebolla') });
    await user.selectOptions(action, 'Substitute');
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);
    expect(action).toHaveAccessibleDescription(es.editor.substituteRequired);
    expect(modify).not.toHaveBeenCalled();

    await addFood(user, /Leche sin lactosa/, es.editor.substituteSearch('Cebolla'));
    expect(action).not.toHaveAttribute('aria-describedby');

    await user.selectOptions(action, 'Avoid');
    expect(
      screen.queryByRole('searchbox', { name: es.editor.substituteSearch('Cebolla') }),
    ).not.toBeInTheDocument();
    await user.selectOptions(action, 'Substitute');
    await addFood(user, /Leche sin lactosa/, es.editor.substituteSearch('Cebolla'));
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1].items?.[1]).toEqual({
      foodId: ONION_ID,
      actionType: 'Substitute',
      reasoning: 'Alto contenido de fructanos.',
      substituteFoodId: MILK_ID,
    });
  });

  it('actionAwayFromSubstitute_sendsNoSubstitute', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    const substituted = detailBody({
      items: [
        {
          recommendationItemId: '00000000-0000-4000-8000-0000000000e3',
          foodId: GARLIC_ID,
          foodName: 'Ajo',
          category: 'Verduras',
          actionType: 'Substitute',
          substituteFoodId: '00000000-0000-4000-8000-0000000000f4',
          substituteFoodName: 'Aceite infusionado con ajo',
          reasoning: null,
        },
      ],
    });
    renderModify({ modify, getDetail: async () => toRecommendationDetail(substituted) });

    await openModify(user);
    await user.selectOptions(
      screen.getByRole('combobox', { name: es.editor.actionLabel('Ajo') }),
      'Avoid',
    );
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1].items).toEqual([
      { foodId: GARLIC_ID, actionType: 'Avoid', reasoning: null, substituteFoodId: null },
    ]);
  });

  it('foodAlreadyInTheList_cannotBeAddedAgain', async () => {
    const user = userEvent.setup();
    renderModify({});

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.type(screen.getByRole('searchbox', { name: es.editor.addFood }), 'lác');

    const results = await screen.findByRole('list', { name: es.editor.addFood });
    expect(within(results).getByRole('button', { name: /Lácteos con lactosa/ })).toBeDisabled();
  });

  it('reasoning_editedIsSentTrimmed', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await user.type(
      screen.getByRole('textbox', { name: es.editor.reasoningLabel('Zanahoria cocida') }),
      '  Fibra suave.  ',
    );
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1].items?.[0]?.reasoning).toBe('Fibra suave.');
  });

  it('steps_canBeAddedAndRemoved', async () => {
    const user = userEvent.setup();
    const modify = modifySpy();
    renderModify({ modify });

    await openModify(user);
    await user.click(screen.getByRole('button', { name: es.editor.addStep }));
    await user.type(screen.getByRole('textbox', { name: es.editor.stepLabel(2) }), 'Beber agua.');
    await user.click(screen.getByRole('button', { name: es.editor.removeStep(1) }));
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(1));
    expect(modify.mock.calls[0]?.[1].steps).toEqual(['Beber agua.']);
  });

  // D4: cancelling closes the editor but the draft survives while the screen stays open.
  it('cancel_keepsTheDraftForTheNextOpening', async () => {
    const user = userEvent.setup();
    renderModify({});

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.click(screen.getByRole('button', { name: es.decision.cancel }));

    expect(screen.queryByRole('heading', { name: es.editor.title })).not.toBeInTheDocument();
    expect(screen.getByText(es.recommendation.supportingTitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: es.decision.modify })).toHaveFocus();

    await openModify(user);
    expect(editedFoods()).toContain('Lácteos con lactosa');
  });

  it('serverDomainRule_isShownInTheForm', async () => {
    const user = userEvent.setup();
    const detail =
      'Alimento sustituto inválido: un ítem de sustitución requiere un alimento sustituto.';
    const modify = vi
      .fn<RecommendationsGateway['modify']>()
      .mockRejectedValue(new DecisionRefusedError({ kind: 'invalid-content', messages: [detail] }));
    renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(detail);
    expect(editedFoods()).toContain('Lácteos con lactosa');
  });

  it('serverRefusalWithoutMessage_showsTheGenericError', async () => {
    const user = userEvent.setup();
    const modify = vi
      .fn<RecommendationsGateway['modify']>()
      .mockRejectedValue(new DecisionRefusedError({ kind: 'invalid-content', messages: [] }));
    renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(es.generic.error);
  });

  it('serverNoteRefusal_isShownInTheNoteField', async () => {
    const user = userEvent.setup();
    const modify = vi
      .fn<RecommendationsGateway['modify']>()
      .mockRejectedValue(
        new DecisionRefusedError({ kind: 'invalid-note', messages: ['Falta la nota clínica.'] }),
      );
    renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falta la nota clínica.');
    expect(noteField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('retryAfterAFailure_reusesTheKeyAndAChangedDraftGetsANewOne', async () => {
    const user = userEvent.setup();
    const modify = vi
      .fn<RecommendationsGateway['modify']>()
      .mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    renderModify({ modify });

    await openModify(user);
    await addFood(user, /Lácteos con lactosa/);
    await user.type(noteField(), NOTE_TEN);
    await confirm(user);
    await screen.findByText(es.generic.error);
    await confirm(user);
    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(2));
    await user.click(screen.getByRole('button', { name: es.editor.removeItem('Ajo') }));
    await confirm(user);

    await vi.waitFor(() => expect(modify).toHaveBeenCalledTimes(3));
    const keys = modify.mock.calls.map((call) => call[2]);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  it('searchWithoutNamedFood_addsItWithAPlaceholder', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [{ path: '/recomendaciones/:recommendationId', element: <RecommendationReviewPage /> }],
      { initialEntries: [`/recomendaciones/${PENDING_ID}`] },
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PatientsProvider gateway={fakePatientsGateway()}>
          <FoodCatalogProvider
            gateway={{ search: async () => toFoodSummaries([foodBody({ name: null })]) }}
          >
            <RecommendationsProvider
              gateway={fakeRecommendationsGateway({ getDetail: async () => pending })}
            >
              <RouterProvider router={router} />
            </RecommendationsProvider>
          </FoodCatalogProvider>
        </PatientsProvider>
      </QueryClientProvider>,
    );

    await openModify(user);
    await addFood(user, new RegExp(es.foodSearch.unnamed));

    expect(editedFoods()).toContain(es.recommendation.unnamedFood);
  });
});
