import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { toPatientRecommendationsPage } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { PatientRecommendations } from '@/modules/recommendations/presentation/PatientRecommendations';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  fakeRecommendationsGateway,
  patientRecommendationBody,
  patientRecommendationsAfterArchive,
  PENDING_ID,
} from '../../../../support/recommendations';

const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const text = es.patientRecommendations;

function renderList(listForPatient: RecommendationsGateway['listForPatient']) {
  const router = createMemoryRouter(
    [
      { path: '/ficha', element: <PatientRecommendations patientId={PATIENT} /> },
      { path: '/recomendaciones/:recommendationId', element: <p>Detalle</p> },
      { path: '/pacientes/:patientId/recomendaciones/nueva', element: <p>Nueva</p> },
    ],
    { initialEntries: ['/ficha'] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RecommendationsProvider gateway={fakeRecommendationsGateway({ listForPatient })}>
        <RouterProvider router={router} />
      </RecommendationsProvider>
    </QueryClientProvider>,
  );
  return router;
}

describe('PatientRecommendations', () => {
  // CP074 steps 6 and 7, CP075 steps 4 and 5: active ones apart, archived ones with reason and date.
  it('splitsActiveAndArchived_withReasonAndDate', async () => {
    renderList(async () => toPatientRecommendationsPage(patientRecommendationsAfterArchive));

    const active = await screen.findByRole('table', { name: text.activeCaption });
    expect(within(active).getAllByRole('row')).toHaveLength(2);
    expect(within(active).getByText('Aumentar la fibra soluble')).toBeInTheDocument();
    expect(within(active).getByText(es.recommendationStatus.ManualApproved)).toBeInTheDocument();
    const archived = screen.getByRole('table', { name: text.archivedCaption });
    const rows = within(archived).getAllByRole('row');
    expect(rows[1]).toHaveTextContent(es.recommendation.fallbackTitle);
    expect(rows[1]).toHaveTextContent(es.archiveReason.ObjectiveMet);
    expect(rows[1]).toHaveTextContent('26/10/2026');
    expect(rows[2]).toHaveTextContent('Reducir legumbres');
    expect(rows[2]).toHaveTextContent(es.archiveReason.TemporalExpiration);
  });

  // CP036 step 1 and CP048 step 1: every state as the server sent it; the row opens the detail.
  it('eachRow_showsItsStatus_andOpensTheRecommendation', async () => {
    const user = userEvent.setup();
    const router = renderList(async () =>
      toPatientRecommendationsPage({
        items: [patientRecommendationBody({ status: 'PendingReview', reviewedAt: null })],
        page: 1,
        pageSize: 100,
        totalCount: 1,
      }),
    );

    expect(await screen.findByText(es.recommendationStatus.PendingReview)).toBeInTheDocument();
    expect(screen.getByText(text.noArchived)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: es.recommendation.fallbackTitle }));

    expect(router.state.location.pathname).toBe(`/recomendaciones/${PENDING_ID}`);
  });

  // CP072 step 2: the record offers creating an own recommendation.
  it('create_opensTheManualForm', async () => {
    const user = userEvent.setup();
    const router = renderList(async () =>
      toPatientRecommendationsPage({ items: [], page: 1, pageSize: 100, totalCount: 0 }),
    );

    expect(await screen.findByText(text.noActive)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: text.create }));

    expect(router.state.location.pathname).toBe(`/pacientes/${PATIENT}/recomendaciones/nueva`);
  });

  it('moreThanOnePage_saysOnlyTheNewestAreShown', async () => {
    renderList(async () =>
      toPatientRecommendationsPage({ ...patientRecommendationsAfterArchive, totalCount: 130 }),
    );

    expect(await screen.findByText(text.truncated(3, 130))).toBeInTheDocument();
  });

  it('aFailure_offersARetry', async () => {
    const user = userEvent.setup();
    const list = vi
      .fn<RecommendationsGateway['listForPatient']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(
        toPatientRecommendationsPage({ items: [], page: 1, pageSize: 100, totalCount: 0 }),
      );
    renderList(list);

    await user.click(await screen.findByRole('button', { name: text.retry }));

    expect(await screen.findByText(text.noActive)).toBeInTheDocument();
  });
});
