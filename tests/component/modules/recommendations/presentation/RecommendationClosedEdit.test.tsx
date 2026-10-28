import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ClinicalRegistryProvider, FoodCatalogProvider } from '@/modules/clinical-registry';
import { PatientsProvider } from '@/modules/patients';
import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { DecisionRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationReviewPage } from '@/modules/recommendations/presentation/RecommendationReviewPage';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { es } from '@/shared/presentation/i18n/es';

import { fakeClinicalRegistryGateway } from '../../../../support/clinicalRegistry';
import { fakeFoodCatalogGateway } from '../../../../support/foods';
import { fakePatientsGateway } from '../../../../support/patients';
import {
  approvedR1,
  detailBody,
  expiredOnOpen,
  fakeRecommendationsGateway,
  manualR3,
  modifiedR2,
  PENDING_ID,
  rejectedR4,
} from '../../../../support/recommendations';

type Body = ReturnType<typeof detailBody>;

function renderReview(body: Body, modify: RecommendationsGateway['modify']) {
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
        <RecommendationsProvider
          gateway={fakeRecommendationsGateway({
            getDetail: async () => toRecommendationDetail(body),
            modify,
          })}
        >
          <ClinicalRegistryProvider gateway={fakeClinicalRegistryGateway()}>
            <FoodCatalogProvider gateway={fakeFoodCatalogGateway()}>
              <RouterProvider router={router} />
            </FoodCatalogProvider>
          </ClinicalRegistryProvider>
        </RecommendationsProvider>
      </PatientsProvider>
    </QueryClientProvider>,
  );
}

function refused() {
  return vi
    .fn<RecommendationsGateway['modify']>()
    .mockRejectedValue(new DecisionRefusedError({ kind: 'state-conflict' }));
}

function panel() {
  return screen.findByRole('complementary', { name: es.decision.title });
}

describe('editing a closed recommendation (CP048)', () => {
  // Steps 2 to 7: the attempt reaches the server, which refuses it, and the portal says why.
  it.each([
    ['R1 approved', approvedR1, es.recommendation.finalState],
    ['R2 modified', modifiedR2, es.recommendation.finalState],
    ['R3 manual', manualR3, es.recommendation.finalState],
    ['R4 rejected', rejectedR4, es.recommendation.rejectedState],
  ])('%s_sendsTheAttempt_andShowsTheRefusal', async (_name, body, message) => {
    const user = userEvent.setup();
    const modify = refused();
    renderReview(body, modify);

    const aside = await panel();
    expect(within(aside).getByText(es.decision.closedWarning)).toBeInTheDocument();
    await user.click(within(aside).getByRole('button', { name: es.decision.editClosed }));
    const title = screen.getByLabelText(es.editor.titleLabel);
    expect(title).toHaveValue(body.title);
    expect(screen.getByLabelText(es.decision.noteLabel)).toHaveValue(body.nutritionistNote);
    expect(screen.getByText(es.decision.explanationLocked)).toBeInTheDocument();
    await user.clear(title);
    await user.type(title, 'Título de prueba');
    await user.click(screen.getByRole('button', { name: es.decision.confirmEdit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(modify).toHaveBeenCalledTimes(1);
    expect(modify.mock.calls[0]?.[1]).toMatchObject({
      title: 'Título de prueba',
      clinicalNote: body.nutritionistNote,
    });
    expect(screen.queryByLabelText(es.editor.titleLabel)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: body.title ?? '' })).toBeInTheDocument();
  });

  it('changingOnlyTheNote_stillReachesTheServer_withANewKeyPerClick', async () => {
    const user = userEvent.setup();
    const modify = refused();
    renderReview(approvedR1, modify);

    for (let attempt = 0; attempt < 2; attempt++) {
      await user.click(within(await panel()).getByRole('button', { name: es.decision.editClosed }));
      const note = screen.getByLabelText(es.decision.noteLabel);
      await user.clear(note);
      await user.type(note, 'Texto de prueba');
      await user.click(screen.getByRole('button', { name: es.decision.confirmEdit }));
      await screen.findByRole('alert');
    }

    expect(modify).toHaveBeenCalledTimes(2);
    expect(modify.mock.calls[0]?.[1].clinicalNote).toBe('Texto de prueba');
    expect(modify.mock.calls[0]?.[2]).not.toBe(modify.mock.calls[1]?.[2]);
  });

  it('aShortNote_isRejectedByTheClient', async () => {
    const user = userEvent.setup();
    const modify = refused();
    renderReview(approvedR1, modify);

    await user.click(within(await panel()).getByRole('button', { name: es.decision.editClosed }));
    const note = screen.getByLabelText(es.decision.noteLabel);
    await user.clear(note);
    await user.type(note, 'Muy poco.');
    await user.click(screen.getByRole('button', { name: es.decision.confirmEdit }));

    expect(screen.getByText(es.decision.noteTooShort)).toBeInTheDocument();
    expect(modify).not.toHaveBeenCalled();
  });

  // Regression: pending ones keep their decisions; archived and expired ones offer no edit.
  it.each([
    ['pending', detailBody()],
    [
      'archived',
      detailBody({
        status: 'Approved',
        isActive: false,
        archivedAt: '2026-10-26T15:00:00Z',
        archiveReason: 'ObjectiveMet',
        allowedActions: [],
      }),
    ],
    ['expired', expiredOnOpen],
  ])('%s_offersNoClosedEdit', async (_name, body) => {
    renderReview(body, vi.fn());

    const aside = await panel();
    expect(
      within(aside).queryByRole('button', { name: es.decision.editClosed }),
    ).not.toBeInTheDocument();
    expect(within(aside).queryByText(es.decision.closedWarning)).not.toBeInTheDocument();
  });
});
