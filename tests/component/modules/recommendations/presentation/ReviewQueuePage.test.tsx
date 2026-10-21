import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { toPendingReviewPage } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import {
  reviewOutcomeState,
  ReviewQueuePage,
} from '@/modules/recommendations/presentation/ReviewQueuePage';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  fakeRecommendationsGateway,
  OVERDUE_ID,
  pendingPageBody,
  pendingReviewBody,
} from '../../../../support/recommendations';

function renderQueue(overrides: Partial<RecommendationsGateway>, state: unknown = null) {
  const router = createMemoryRouter(
    [
      { path: '/revisiones', element: <ReviewQueuePage /> },
      { path: '/recomendaciones/:recommendationId', element: <p>Detalle</p> },
    ],
    { initialEntries: [{ pathname: '/revisiones', state }] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RecommendationsProvider gateway={fakeRecommendationsGateway(overrides)}>
        <RouterProvider router={router} />
      </RecommendationsProvider>
    </QueryClientProvider>,
  );
  return router;
}

function bodyRows(): HTMLElement[] {
  const [, ...rows] = within(screen.getByRole('table')).getAllByRole('row');
  return rows;
}

describe('ReviewQueuePage', () => {
  // The queue keeps the server order (oldest first) and shows each column of the mockup.
  it('queue_keepsTheServerOrderAndShowsEachColumn', async () => {
    renderQueue({ listPendingReview: async () => toPendingReviewPage(pendingPageBody()) });

    await screen.findByRole('table');
    const [overdue, recent] = bodyRows();

    expect(bodyRows().map((row) => within(row).getByRole('rowheader').textContent)).toEqual([
      'Paciente Prueba B',
      'Paciente Prueba A',
    ]);
    expect(overdue).toHaveTextContent('19/10/2026 03:00');
    expect(overdue).toHaveTextContent('Media · 0.55');
    expect(overdue).toHaveTextContent(es.reviews.noExpiry);
    expect(recent).toHaveTextContent('20/10/2026 09:30');
    expect(recent).toHaveTextContent('Alta · 0.82');
    expect(recent).toHaveTextContent('27/10/2026 09:30');
    expect(recent?.querySelectorAll('td')[2]).toHaveTextContent('3');
  });

  it('queue_withLowConfidence_saysLow', async () => {
    const body = pendingPageBody([pendingReviewBody({ confidenceScore: 0.3 })]);
    renderQueue({ listPendingReview: async () => toPendingReviewPage(body) });

    expect(await screen.findByText('Baja · 0.30')).toBeInTheDocument();
  });

  it('queueRow_opensTheRecommendation', async () => {
    const user = userEvent.setup();
    const router = renderQueue({
      listPendingReview: async () => toPendingReviewPage(pendingPageBody()),
    });

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba B' }));

    expect(router.state.location.pathname).toBe(`/recomendaciones/${OVERDUE_ID}`);
  });

  it('queueRow_withoutName_saysNameUnavailable', async () => {
    const body = pendingPageBody([pendingReviewBody({ patientFullName: null })]);
    renderQueue({ listPendingReview: async () => toPendingReviewPage(body) });

    expect(
      await screen.findByRole('link', { name: es.reviews.nameUnavailable }),
    ).toBeInTheDocument();
  });

  it('queue_whileLoading_announcesIt', () => {
    renderQueue({});

    expect(screen.getByRole('status')).toHaveTextContent(es.generic.loading);
  });

  it('queue_empty_saysThereIsNothingToReview', async () => {
    renderQueue({ listPendingReview: async () => toPendingReviewPage(pendingPageBody([])) });

    expect(await screen.findByText(es.reviews.empty)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('queue_withError_offersRetry', async () => {
    const user = userEvent.setup();
    const listPendingReview = vi
      .fn<RecommendationsGateway['listPendingReview']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValue(toPendingReviewPage(pendingPageBody()));
    renderQueue({ listPendingReview });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.reviews.loadError);
    await user.click(screen.getByRole('button', { name: es.reviews.retry }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it.each([
    ['approved', es.reviews.approved],
    ['rejected', es.reviews.rejected],
  ] as const)('queue_afterA%sDecision_confirmsIt', async (outcome, message) => {
    renderQueue(
      { listPendingReview: async () => toPendingReviewPage(pendingPageBody([])) },
      reviewOutcomeState(outcome),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(message);
  });

  it('queue_withUnknownNavigationState_showsNoConfirmation', async () => {
    renderQueue(
      { listPendingReview: async () => toPendingReviewPage(pendingPageBody([])) },
      { reviewOutcome: 'archived' },
    );

    await screen.findByText(es.reviews.empty);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('queue_overOnePage_movesBetweenPages', async () => {
    const user = userEvent.setup();
    const listPendingReview = vi.fn(async (page: number) =>
      toPendingReviewPage(
        pendingPageBody([pendingReviewBody({ patientFullName: `Paciente Prueba ${page}` })], {
          page,
          totalCount: 21,
        }),
      ),
    );
    renderQueue({ listPendingReview });

    const pager = await screen.findByRole('navigation', { name: es.reviews.pagerLabel });
    expect(pager).toHaveTextContent('Página 1 de 2');
    expect(within(pager).getByRole('button', { name: es.reviews.previous })).toBeDisabled();
    await user.click(within(pager).getByRole('button', { name: es.reviews.next }));

    expect(await screen.findByText('Paciente Prueba 2')).toBeInTheDocument();
    expect(listPendingReview).toHaveBeenLastCalledWith(2, 20);
    expect(screen.getByRole('button', { name: es.reviews.next })).toBeDisabled();
  });

  it('queue_inOnePage_hasNoPager', async () => {
    renderQueue({ listPendingReview: async () => toPendingReviewPage(pendingPageBody()) });

    await screen.findByRole('table');
    expect(
      screen.queryByRole('navigation', { name: es.reviews.pagerLabel }),
    ).not.toBeInTheDocument();
  });
});
