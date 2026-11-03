import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ClinicalRegistryProvider } from '@/modules/clinical-registry';
import { PatientsProvider } from '@/modules/patients';
import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { DecisionRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationReviewPage } from '@/modules/recommendations/presentation/RecommendationReviewPage';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { es } from '@/shared/presentation/i18n/es';

import { fakeClinicalRegistryGateway } from '../../../../support/clinicalRegistry';
import { fakePatientsGateway } from '../../../../support/patients';
import {
  approvedR1,
  detailBody,
  fakeRecommendationsGateway,
  PENDING_ID,
  REVIEW_PATIENT_ID,
  rejectedR4,
} from '../../../../support/recommendations';

function renderReview(overrides: Partial<RecommendationsGateway>) {
  const router = createMemoryRouter(
    [
      { path: '/recomendaciones/:recommendationId', element: <RecommendationReviewPage /> },
      { path: '/pacientes/:patientId', element: <p>Ficha</p> },
    ],
    { initialEntries: [`/recomendaciones/${PENDING_ID}`] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway()}>
        <RecommendationsProvider gateway={fakeRecommendationsGateway(overrides)}>
          <ClinicalRegistryProvider gateway={fakeClinicalRegistryGateway()}>
            <RouterProvider router={router} />
          </ClinicalRegistryProvider>
        </RecommendationsProvider>
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return router;
}

describe('archiving from the recommendation screen', () => {
  // CP074 steps 3 to 5: the three manual reasons, then the record confirms the archiving.
  it('approved_offersTheReasons_andArchivesWithTheChosenOne', async () => {
    const user = userEvent.setup();
    const archive = vi.fn<RecommendationsGateway['archive']>(async () => undefined);
    const router = renderReview({
      getDetail: async () => toRecommendationDetail(approvedR1),
      archive,
    });

    await user.click(await screen.findByRole('button', { name: es.archive.open }));
    const select = screen.getByLabelText(es.archive.reasonLabel);
    expect(
      Array.from((select as HTMLSelectElement).options).map((option) => option.textContent),
    ).toEqual([
      es.archive.reasonPlaceholder,
      es.archiveReason.ManualSubstitution,
      es.archiveReason.ObjectiveMet,
      es.archiveReason.PlanChange,
    ]);
    await user.selectOptions(select, es.archiveReason.ObjectiveMet);
    await user.click(screen.getByRole('button', { name: es.archive.confirm }));

    expect(await screen.findByText('Ficha')).toBeInTheDocument();
    expect(archive).toHaveBeenCalledWith(PENDING_ID, 'ObjectiveMet');
    expect(router.state.location.pathname).toBe(`/pacientes/${REVIEW_PATIENT_ID}`);
    expect(router.state.location.state).toEqual({
      tab: 'recommendations',
      notice: es.patientRecommendations.archived,
    });
  });

  it('withoutAReason_isNotSent', async () => {
    const user = userEvent.setup();
    const archive = vi.fn<RecommendationsGateway['archive']>();
    renderReview({ getDetail: async () => toRecommendationDetail(approvedR1), archive });

    await user.click(await screen.findByRole('button', { name: es.archive.open }));
    await user.click(screen.getByRole('button', { name: es.archive.confirm }));

    expect(screen.getByText(es.archive.reasonRequired)).toBeInTheDocument();
    expect(archive).not.toHaveBeenCalled();
  });

  it('notArchivable_saysSo', async () => {
    const user = userEvent.setup();
    renderReview({
      getDetail: async () => toRecommendationDetail(approvedR1),
      archive: async () => {
        throw new DecisionRefusedError({ kind: 'not-archivable' });
      },
    });

    await user.click(await screen.findByRole('button', { name: es.archive.open }));
    await user.selectOptions(
      screen.getByLabelText(es.archive.reasonLabel),
      es.archiveReason.PlanChange,
    );
    await user.click(screen.getByRole('button', { name: es.archive.confirm }));

    expect(await screen.findByText(es.archive.notArchivable)).toBeInTheDocument();
  });

  // CP048 variant D: a rejected one offers no archive.
  it('rejected_offersNoArchive', async () => {
    renderReview({ getDetail: async () => toRecommendationDetail(rejectedR4) });

    expect(await screen.findByText(es.recommendation.rejectedState)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: es.archive.open })).not.toBeInTheDocument();
  });

  it('archived_saysWhenAndWhy', async () => {
    renderReview({
      getDetail: async () =>
        toRecommendationDetail(
          detailBody({
            status: 'Approved',
            isActive: false,
            archivedAt: '2026-10-26T15:00:00Z',
            archiveReason: 'TemporalExpiration',
            allowedActions: [],
          }),
        ),
    });

    expect(
      await screen.findByText(
        es.archive.archivedState('26/10/2026', es.archiveReason.TemporalExpiration),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(es.recommendation.finalState)).not.toBeInTheDocument();
  });

  // CP045 step 4: the review screen shows the patient's recent history.
  it('showsThePatientsRecentHistory', async () => {
    renderReview({ getDetail: async () => toRecommendationDetail(detailBody()) });

    expect(
      await screen.findByRole('heading', { name: es.recommendation.historyTitle }),
    ).toBeInTheDocument();
  });
});
