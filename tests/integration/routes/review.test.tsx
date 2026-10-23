import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { createAppDependencies, type AppComposition } from '@/app/composition';
import { es } from '@/shared/presentation/i18n/es';
import type { components } from '@/shared/infrastructure/api/generated/schema';

import { server } from '../../msw/server';
import { DAIRY_ID, dairyResults } from '../../support/foods';
import { detailBody as patientDetailBody } from '../../support/patientRecord';
import { portalSessionBody } from '../../support/portalSession';
import {
  CARROT_ID,
  cp086Pending,
  detailBody,
  expiredOnOpen,
  GARLIC_ID,
  NOTE_CP045,
  NOTE_CP046,
  NOTE_CP086,
  NOTE_NINE,
  NOTE_TEN,
  ONION_ID,
  OVERDUE_ID,
  PENDING_ID,
  pendingPageBody,
  queueItems,
  REVIEW_PATIENT_ID,
  STEP_CP086,
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
  const decide = (kind: 'approve' | 'reject' | 'modify') =>
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
    decide('modify'),
  );
  return decisions;
}

// The catalog answers every search with the same foods and records each query it received.
function foodCatalog() {
  const queries: (string | null)[] = [];
  server.use(
    http.get('*/api/v1/foods/search', ({ request }) => {
      queries.push(new URL(request.url).searchParams.get('q'));
      return HttpResponse.json(dairyResults);
    }),
    http.get(`*/api/v1/recommendations/${PENDING_ID}`, () => HttpResponse.json(cp086Pending)),
  );
  return queries;
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

  // CP047 steps 1 to 8: the queue, the modification kept across refused notes, then approved with changes.
  it('queueRow_cp047_modifiesOnlyWithAValidNote', async () => {
    const user = userEvent.setup();
    const decisions = reviewBackend();
    const queries = foodCatalog();
    startApp('/revisiones');

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
    await user.click(await screen.findByRole('button', { name: es.decision.modify }));
    await user.type(screen.getByRole('searchbox', { name: es.editor.addFood }), ' lá ');
    await user.click(await screen.findByRole('button', { name: /Lácteos con lactosa/ }));
    await user.click(screen.getByRole('button', { name: es.decision.confirmModify }));
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteEmpty);
    await user.type(noteField(), NOTE_NINE);
    await user.click(screen.getByRole('button', { name: es.decision.confirmModify }));
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteTooShort);
    expect(decisions).toHaveLength(0);

    await user.clear(noteField());
    await user.type(noteField(), NOTE_TEN);
    await user.click(screen.getByRole('button', { name: es.decision.confirmModify }));

    expect(await screen.findByText(es.reviews.modified)).toHaveAttribute('role', 'status');
    expect(queries).toEqual(['lá']);
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.path).toBe('modify');
    expect(decisions[0]?.key).toMatch(UUID);
    expect(decisions[0]?.body).toMatchObject({
      clinicalNote: NOTE_TEN,
      title: null,
      description: null,
      steps: null,
    });
    const table = await screen.findByRole('table');
    expect(within(table).queryByRole('link', { name: 'Paciente Prueba A' })).toBeNull();
  });

  // CP086 steps 3 to 7: dairy to reduce, the new step and the 36-character note reach the server.
  it('detail_cp086_sendsTheModifiedFoodsAndStep', async () => {
    const user = userEvent.setup();
    const decisions = reviewBackend();
    foodCatalog();
    startApp(`/recomendaciones/${PENDING_ID}`);

    await user.click(await screen.findByRole('button', { name: es.decision.modify }));
    await user.type(screen.getByRole('searchbox', { name: es.editor.addFood }), 'lácteos');
    await user.click(await screen.findByRole('button', { name: /Lácteos con lactosa/ }));
    const step = screen.getByRole('textbox', { name: es.editor.stepLabel(1) });
    await user.clear(step);
    await user.type(step, STEP_CP086);
    await user.type(noteField(), NOTE_CP086);
    await user.click(screen.getByRole('button', { name: es.decision.confirmModify }));

    expect(await screen.findByText(es.reviews.modified)).toHaveAttribute('role', 'status');
    expect(decisions[0]?.body).toEqual({
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
  });

  it('modify_withDomainRuleFromTheServer_showsItsDetail', async () => {
    const user = userEvent.setup();
    reviewBackend();
    foodCatalog();
    const detail =
      'Alimento sustituto inválido: el alimento sustituto no puede ser el mismo alimento.';
    server.use(
      http.post(`*/api/v1/recommendations/${PENDING_ID}/modify`, () =>
        HttpResponse.json({ errorCode: 'domain_rule_violation', detail }, { status: 400 }),
      ),
    );
    startApp(`/recomendaciones/${PENDING_ID}`);

    await user.click(await screen.findByRole('button', { name: es.decision.modify }));
    await user.click(screen.getByRole('button', { name: es.editor.removeItem('Ajo') }));
    await user.type(noteField(), NOTE_TEN);
    await user.click(screen.getByRole('button', { name: es.decision.confirmModify }));

    expect(await screen.findByRole('alert')).toHaveTextContent(detail);
    expect(app?.sessionService.current().status).toBe('authenticated');
  });

  // Back after a decision: the old detail is not kept, so no decision button is shown from it.
  it('back_afterApproving_neverShowsDecisionButtonsFromTheOldState', async () => {
    const user = userEvent.setup();
    reviewBackend();
    let detailRequests = 0;
    server.use(
      http.get(`*/api/v1/recommendations/${PENDING_ID}`, async () => {
        detailRequests += 1;
        if (detailRequests > 1) {
          await delay('infinite');
        }
        return HttpResponse.json(detailBody());
      }),
    );
    const { router } = startApp('/revisiones');

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));
    expect(await screen.findByText(es.reviews.approved)).toHaveAttribute('role', 'status');

    await router.navigate(-1);

    expect(await screen.findByText(es.generic.loading)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/recomendaciones/${PENDING_ID}`);
    expect(screen.queryByRole('button', { name: es.decision.approve })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: es.decision.modify })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: es.decision.reject })).not.toBeInTheDocument();
  });

  it('queueRow_opensTheDetailWithASingleRequest', async () => {
    const user = userEvent.setup();
    reviewBackend();
    let detailRequests = 0;
    server.use(
      http.get(`*/api/v1/recommendations/${PENDING_ID}`, () => {
        detailRequests += 1;
        return HttpResponse.json(detailBody());
      }),
    );
    startApp('/revisiones');

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
    await screen.findByRole('button', { name: es.decision.approve });
    await screen.findByText('Paciente Prueba A ·');

    expect(detailRequests).toBe(1);
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
