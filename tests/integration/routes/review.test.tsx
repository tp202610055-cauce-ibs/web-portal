import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { createAppDependencies, type AppComposition } from '@/app/composition';
import { es } from '@/shared/presentation/i18n/es';
import type { components } from '@/shared/infrastructure/api/generated/schema';

import { server } from '../../msw/server';
import { detailBody as patientDetailBody } from '../../support/patientRecord';
import { portalSessionBody } from '../../support/portalSession';
import {
  detailBody,
  expiredOnOpen,
  NOTE_CP045,
  NOTE_CP046,
  NOTE_NINE,
  OVERDUE_ID,
  PENDING_ID,
  pendingPageBody,
  queueItems,
  REVIEW_PATIENT_ID,
} from '../../support/recommendations';
import { renderApp, testDependencies } from '../../support/renderApp';
import { anonymousSession, fakeSessionController } from '../../support/sessions';

type PendingReviewDto = components['schemas']['PendingReviewRecommendationDto'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Decision {
  readonly path: string;
  readonly key: string | null;
  readonly body: unknown;
}

// A small backend: the queue drops a recommendation once it is decided, as the server does.
function reviewBackend() {
  let pending: PendingReviewDto[] = [...queueItems];
  const decisions: Decision[] = [];
  const decide = (kind: 'approve' | 'reject') =>
    http.post(`*/api/v1/recommendations/:id/${kind}`, async ({ request, params }) => {
      decisions.push({
        path: kind,
        key: request.headers.get('Idempotency-Key'),
        body: await request.json(),
      });
      pending = pending.filter((item) => item.recommendationId !== params.id);
      return new HttpResponse(null, { status: 204 });
    });
  server.use(
    http.post('*/api/v1/auth/portal/refresh', () => HttpResponse.json(portalSessionBody())),
    http.get('*/api/v1/nutritionists/me/patients', () => HttpResponse.json([])),
    http.get(`*/api/v1/nutritionists/me/patients/${REVIEW_PATIENT_ID}`, () =>
      HttpResponse.json(patientDetailBody()),
    ),
    http.get('*/api/v1/recommendations/pending-review', () =>
      HttpResponse.json(pendingPageBody(pending)),
    ),
    http.get(`*/api/v1/recommendations/${PENDING_ID}`, () => HttpResponse.json(detailBody())),
    http.get(`*/api/v1/recommendations/${OVERDUE_ID}`, () =>
      HttpResponse.json(
        detailBody({
          recommendationId: OVERDUE_ID,
          patientId: REVIEW_PATIENT_ID,
          title: 'Eliminar todos los lácteos',
        }),
      ),
    ),
    decide('approve'),
    decide('reject'),
  );
  return decisions;
}

function noteField(): HTMLElement {
  return screen.getByRole('textbox', { name: es.decision.noteLabel });
}

describe('review screens from the root', () => {
  let app: AppComposition | null = null;

  afterEach(() => {
    app?.sessionService.dispose();
    app = null;
  });

  function startApp(url: string) {
    app = createAppDependencies();
    void app.sessionService.start();
    return renderApp(url, app);
  }

  // CP045 steps 2 to 8 and R10: menu, queue, detail, approval and back to the queue without it.
  it('menuEntry_cp045_approvesAndTheQueueNoLongerListsIt', async () => {
    const user = userEvent.setup();
    const decisions = reviewBackend();
    const { router } = startApp('/pacientes');

    await user.click(await screen.findByRole('link', { name: es.nav.reviews }));
    expect(
      await screen.findByRole('heading', { level: 1, name: es.reviews.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.nav.reviews })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reducir cebolla y ajo' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/recomendaciones/${PENDING_ID}`);
    expect(await screen.findByText('Paciente Prueba A ·')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(await screen.findByRole('status')).toHaveTextContent(es.reviews.approved);
    expect(router.state.location.pathname).toBe('/revisiones');
    const table = await screen.findByRole('table');
    expect(within(table).queryByRole('link', { name: 'Paciente Prueba A' })).toBeNull();
    expect(within(table).getByRole('link', { name: 'Paciente Prueba B' })).toBeInTheDocument();
    expect(decisions).toHaveLength(1);
    expect(decisions[0]).toMatchObject({ path: 'approve', body: { note: NOTE_CP045 } });
    expect(decisions[0]?.key).toMatch(UUID);
  });

  // CP046 steps 1 to 7: the short notes never reach the server; the valid one rejects.
  it('queueRow_cp046_rejectsOnlyWithAValidNote', async () => {
    const user = userEvent.setup();
    const decisions = reviewBackend();
    startApp('/revisiones');

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba B' }));
    await screen.findByRole('heading', { level: 1, name: 'Eliminar todos los lácteos' });
    await user.click(screen.getByRole('button', { name: es.decision.reject }));
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteEmpty);
    await user.type(noteField(), NOTE_NINE);
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteTooShort);
    expect(decisions).toHaveLength(0);

    await user.clear(noteField());
    await user.type(noteField(), NOTE_CP046);
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    expect(await screen.findByRole('status')).toHaveTextContent(es.reviews.rejected);
    expect(decisions).toEqual([
      { path: 'reject', key: expect.stringMatching(UUID), body: { reason: NOTE_CP046 } },
    ]);
    const table = await screen.findByRole('table');
    expect(within(table).queryByRole('link', { name: 'Paciente Prueba B' })).toBeNull();
  });

  // Opening the detail may expire it: the screen shows the state that arrives and no decision.
  it('detail_expiredOnOpen_isReadOnly', async () => {
    reviewBackend();
    server.use(
      http.get(`*/api/v1/recommendations/${PENDING_ID}`, () => HttpResponse.json(expiredOnOpen)),
    );
    startApp(`/recomendaciones/${PENDING_ID}`);

    expect(await screen.findByText(es.recommendation.expiredState)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: es.decision.approve })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: es.decision.reject })).not.toBeInTheDocument();
  });

  it.each([
    [
      'access denied',
      () => HttpResponse.json({ errorCode: 'recommendation_access_denied' }, { status: 403 }),
      es.recommendation.accessDenied,
    ],
    ['server error', () => new HttpResponse(null, { status: 503 }), es.recommendation.loadError],
  ])('detail_with%s_showsItsMessageAndKeepsTheSession', async (_name, failure, expected) => {
    reviewBackend();
    server.use(http.get(`*/api/v1/recommendations/${PENDING_ID}`, failure));
    startApp(`/recomendaciones/${PENDING_ID}`);

    expect(await screen.findByRole('alert')).toHaveTextContent(expected);
    expect(app?.sessionService.current().status).toBe('authenticated');
    expect(screen.getByRole('navigation', { name: es.nav.label })).toBeInTheDocument();
  });

  // Privacy: only the UUID travels in the URL, and nothing clinical reaches browser storage.
  it('detail_keepsClinicalDataOutOfUrlAndStorage', async () => {
    reviewBackend();
    const { router } = startApp(`/recomendaciones/${PENDING_ID}`);

    await screen.findByText('Paciente Prueba A ·');

    expect(router.state.location.pathname).toBe(`/recomendaciones/${PENDING_ID}`);
    expect(router.state.location.search).toBe('');
    expect(document.title).not.toContain('Paciente Prueba A');
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it.each(['/revisiones', `/recomendaciones/${PENDING_ID}`])(
    'route_%s_withoutSession_redirectsToLogin',
    async (url) => {
      const { router } = renderApp(url, testDependencies(fakeSessionController(anonymousSession)));

      expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/login');
    },
  );
});
