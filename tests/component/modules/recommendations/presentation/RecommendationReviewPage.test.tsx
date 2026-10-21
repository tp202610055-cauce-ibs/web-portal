import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PatientsProvider, type PatientsGateway } from '@/modules/patients';
import { PatientAccessDeniedError } from '@/modules/patients/domain/PatientRecord';
import { toPatientDetail } from '@/modules/patients/infrastructure/patientRecordMapper';
import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import {
  DecisionRefusedError,
  RecommendationAccessDeniedError,
  RecommendationNotFoundError,
  type DecisionFailure,
} from '@/modules/recommendations/domain/Recommendation';
import { toRecommendationDetail } from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationReviewPage } from '@/modules/recommendations/presentation/RecommendationReviewPage';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import { detailBody as patientDetailBody } from '../../../../support/patientRecord';
import { fakePatientsGateway } from '../../../../support/patients';
import {
  approvedR1,
  detailBody,
  expiredOnOpen,
  fakeRecommendationsGateway,
  manualR3,
  modifiedR2,
  NOTE_CP045,
  NOTE_CP046,
  NOTE_NINE,
  NOTE_TEN,
  PENDING_ID,
  rejectedR4,
  REVIEW_PATIENT_ID,
  supportingDataBody,
} from '../../../../support/recommendations';

const URL = `/recomendaciones/${PENDING_ID}`;
const pending = toRecommendationDetail(detailBody());

function renderReview(
  overrides: Partial<RecommendationsGateway>,
  patients: Partial<PatientsGateway> = {},
  url = URL,
) {
  const router = createMemoryRouter(
    [
      { path: '/recomendaciones/:recommendationId', element: <RecommendationReviewPage /> },
      { path: '/revisiones', element: <p>Cola</p> },
      { path: '/pacientes/:patientId', element: <p>Ficha</p> },
    ],
    { initialEntries: [url] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway(patients)}>
        <RecommendationsProvider gateway={fakeRecommendationsGateway(overrides)}>
          <RouterProvider router={router} />
        </RecommendationsProvider>
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return router;
}

function field(label: string): HTMLElement | null {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling as HTMLElement | null;
}

function noteField(): HTMLElement {
  return screen.getByRole('textbox', { name: es.decision.noteLabel });
}

function refused(failure: DecisionFailure) {
  return new DecisionRefusedError(failure);
}

describe('RecommendationReviewPage', () => {
  it('pendingRecommendation_showsItsContentAndSupportingData', async () => {
    renderReview({ getDetail: async () => pending });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reducir cebolla y ajo' }),
    ).toBeInTheDocument();
    expect(field(es.recommendation.status)).toHaveTextContent('Pendiente de revisión');
    expect(field(es.recommendation.confidence)).toHaveTextContent('Alta · 0.82');
    expect(field(es.recommendation.generatedAt)).toHaveTextContent('20/10/2026 a las 09:30');
    expect(field(es.recommendation.expiresAt)).toHaveTextContent('27/10/2026 a las 09:30');
    expect(field(es.recommendation.model)).toHaveTextContent('rule-v1.0.0');
    expect(
      screen.getByText('Ajuste de alimentos con FODMAP altos durante dos semanas.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((step) => step.textContent)).toEqual([
      'Cocina con aceite infusionado en lugar de ajo.',
      'Registra tus síntomas cada día.',
    ]);
    expect(
      screen.getByText(
        `${es.recommendation.explanationSource}: Redactada por el modelo de lenguaje`,
      ),
    ).toBeInTheDocument();
    expect(field(es.recommendation.window)).toHaveTextContent('Del 07/10/2026 al 21/10/2026');
    expect(field(es.recommendation.symptoms)).toHaveTextContent('9');
    expect(field(es.recommendation.meals)).toHaveTextContent('31');
    expect(field(es.recommendation.topFoods)).toHaveTextContent('Cebolla, Ajo');
    expect(field(es.recommendation.correlationWindow)).toHaveTextContent('4 horas');
  });

  // CP036: suggested, reduced and substituted foods, each with its FODMAP reason.
  it('pendingRecommendation_listsEachFoodWithItsActionReasonAndSubstitute', async () => {
    renderReview({ getDetail: async () => pending });

    const table = await screen.findByRole('table', { name: es.recommendation.itemsCaption });
    const [, ...rows] = within(table).getAllByRole('row');

    expect(rows.map((row) => Array.from(row.children, (cell) => cell.textContent))).toEqual([
      ['Zanahoria cocida', 'Sugerido', 'Bajo contenido de FODMAP.', es.recommendation.noSubstitute],
      ['Cebolla', 'Reducir', 'Alto contenido de fructanos.', es.recommendation.noSubstitute],
      [
        'Ajo',
        'Sustituir',
        'El aceite conserva el sabor sin los fructanos.',
        'Aceite infusionado con ajo',
      ],
    ]);
  });

  it('pendingRecommendation_offersOnlyApproveAndReject', async () => {
    renderReview({ getDetail: async () => pending });

    const panel = await screen.findByRole('complementary', { name: es.decision.title });

    expect(
      within(panel)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([es.decision.approve, es.decision.reject]);
    expect(within(panel).queryByRole('status')).not.toBeInTheDocument();
  });

  it('allowedActions_withOnlyReject_offersOnlyReject', async () => {
    const detail = toRecommendationDetail(detailBody({ allowedActions: ['Reject'] }));
    renderReview({ getDetail: async () => detail });

    const panel = await screen.findByRole('complementary', { name: es.decision.title });

    expect(
      within(panel)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([es.decision.reject]);
  });

  // The buttons never come from the status: a pending one without actions offers none.
  it('pendingStatus_withoutAllowedActions_offersNoDecision', async () => {
    const detail = toRecommendationDetail(detailBody({ allowedActions: [] }));
    renderReview({ getDetail: async () => detail });

    const panel = await screen.findByRole('complementary', { name: es.decision.title });

    expect(within(panel).queryByRole('button')).not.toBeInTheDocument();
  });

  it('patientName_whenItLoads_isShownBesideTheRecordLink', async () => {
    const user = userEvent.setup();
    const router = renderReview(
      { getDetail: async () => pending },
      { getDetail: async () => toPatientDetail(patientDetailBody()) },
    );

    await screen.findByText('Paciente Prueba A ·');
    await user.click(screen.getByRole('link', { name: es.recommendation.viewPatient }));

    expect(router.state.location.pathname).toBe(`/pacientes/${REVIEW_PATIENT_ID}`);
  });

  it('patientName_whenItFails_leavesTheLinkAndTheDecision', async () => {
    renderReview(
      { getDetail: async () => pending },
      {
        getDetail: async () => {
          throw new PatientAccessDeniedError();
        },
      },
    );

    expect(
      await screen.findByRole('link', { name: es.recommendation.viewPatient }),
    ).toBeInTheDocument();
    expect(field(es.recommendation.patient)).toHaveTextContent(es.recommendation.viewPatient);
    expect(screen.getByRole('button', { name: es.decision.approve })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('approve_opensTheNoteFieldWithFocus', async () => {
    const user = userEvent.setup();
    renderReview({ getDetail: async () => pending });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));

    expect(noteField()).toHaveFocus();
    expect(noteField()).toHaveAccessibleDescription(es.decision.noteHint);
    expect(screen.getByRole('button', { name: es.decision.approve })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('cancel_closesTheFormAndReturnsFocus', async () => {
    const user = userEvent.setup();
    renderReview({ getDetail: async () => pending });

    await user.click(await screen.findByRole('button', { name: es.decision.reject }));
    await user.click(screen.getByRole('button', { name: es.decision.cancel }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: es.decision.reject })).toHaveFocus();
  });

  // CP046 steps 3 to 7: empty, nine characters, then the valid 47-character note.
  it('reject_cp046_requiresAValidNoteBeforeSending', async () => {
    const user = userEvent.setup();
    const reject = vi.fn<RecommendationsGateway['reject']>().mockResolvedValue(undefined);
    const router = renderReview({ getDetail: async () => pending, reject });

    await user.click(await screen.findByRole('button', { name: es.decision.reject }));
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteEmpty);
    expect(noteField()).toHaveAttribute('aria-invalid', 'true');
    expect(noteField()).toHaveFocus();

    await user.type(noteField(), NOTE_NINE);
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteTooShort);
    expect(noteField()).toHaveAccessibleDescription(
      `${es.decision.noteHint} ${es.decision.noteTooShort}`,
    );

    await user.clear(noteField());
    await user.type(noteField(), NOTE_CP046);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(noteField()).toHaveAttribute('aria-invalid', 'false');

    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/revisiones'));
    expect(reject).toHaveBeenCalledTimes(1);
    expect(reject).toHaveBeenCalledWith(PENDING_ID, NOTE_CP046, expect.any(String));
    expect(router.state.location.state).toEqual({ reviewOutcome: 'rejected' });
  });

  // CP045 steps 5 to 7: the 45-character note approves and returns to the queue.
  it('approve_cp045_sendsTheNoteAndReturnsToTheQueue', async () => {
    const user = userEvent.setup();
    const approve = vi.fn<RecommendationsGateway['approve']>().mockResolvedValue(undefined);
    const router = renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/revisiones'));
    expect(approve).toHaveBeenCalledWith(PENDING_ID, NOTE_CP045, expect.any(String));
    expect(router.state.location.state).toEqual({ reviewOutcome: 'approved' });
  });

  it('approve_withExactlyTenCharacters_isSent', async () => {
    const user = userEvent.setup();
    const approve = vi.fn<RecommendationsGateway['approve']>().mockResolvedValue(undefined);
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_TEN);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    await vi.waitFor(() =>
      expect(approve).toHaveBeenCalledWith(PENDING_ID, NOTE_TEN, expect.any(String)),
    );
  });

  it('approve_withNoteOverTheMaximum_isNotSent', async () => {
    const user = userEvent.setup();
    const approve = vi.fn<RecommendationsGateway['approve']>();
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.click(noteField());
    await user.paste('a'.repeat(2001));
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.noteTooLong);
    expect(approve).not.toHaveBeenCalled();
  });

  it('approve_whileSending_disablesTheConfirmation', async () => {
    const user = userEvent.setup();
    renderReview({ getDetail: async () => pending });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(await screen.findByRole('button', { name: es.decision.sending })).toBeDisabled();
  });

  it('approve_whenTheServerRefusesTheNote_showsItsMessage', async () => {
    const user = userEvent.setup();
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValue(refused({ kind: 'invalid-note', messages: ['Falta la nota clínica.'] }));
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falta la nota clínica.');
    expect(noteField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('approve_whenTheServerRefusesWithoutMessage_asksToReviewTheField', async () => {
    const user = userEvent.setup();
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValue(refused({ kind: 'invalid-note', messages: [] }));
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(await screen.findByRole('alert')).toHaveTextContent(es.generic.field);
  });

  it('approve_afterAFailure_retriesWithTheSameKey', async () => {
    const user = userEvent.setup();
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValue(undefined);
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));
    expect(await screen.findByRole('alert')).toHaveTextContent(es.generic.error);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    await vi.waitFor(() => expect(approve).toHaveBeenCalledTimes(2));
    expect(approve.mock.calls[1]?.[2]).toBe(approve.mock.calls[0]?.[2]);
  });

  it('approve_afterChangingTheNote_usesANewKey', async () => {
    const user = userEvent.setup();
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValue(undefined);
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));
    await screen.findByRole('alert');
    await user.type(noteField(), '.');
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    await vi.waitFor(() => expect(approve).toHaveBeenCalledTimes(2));
    expect(approve.mock.calls[1]?.[2]).not.toBe(approve.mock.calls[0]?.[2]);
  });

  it('approve_afterIdempotencyMismatch_asksToConfirmAgainWithANewKey', async () => {
    const user = userEvent.setup();
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValueOnce(refused({ kind: 'idempotency-mismatch' }))
      .mockResolvedValue(undefined);
    renderReview({ getDetail: async () => pending, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));
    expect(await screen.findByRole('alert')).toHaveTextContent(es.decision.retryAgain);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    await vi.waitFor(() => expect(approve).toHaveBeenCalledTimes(2));
    expect(approve.mock.calls[1]?.[2]).not.toBe(approve.mock.calls[0]?.[2]);
  });

  // 409 conflict_state: the detail reloads and shows the state the server now has.
  it('approve_withStateConflict_reloadsAndShowsTheNewState', async () => {
    const user = userEvent.setup();
    const getDetail = vi
      .fn<RecommendationsGateway['getDetail']>()
      .mockResolvedValueOnce(pending)
      .mockResolvedValue(toRecommendationDetail(approvedR1));
    const approve = vi
      .fn<RecommendationsGateway['approve']>()
      .mockRejectedValue(refused({ kind: 'state-conflict' }));
    renderReview({ getDetail, approve });

    await user.click(await screen.findByRole('button', { name: es.decision.approve }));
    await user.type(noteField(), NOTE_CP045);
    await user.click(screen.getByRole('button', { name: es.decision.confirmApprove }));

    expect(await screen.findByText(es.recommendation.finalState)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(es.decision.stateConflict);
    expect(field(es.recommendation.status)).toHaveTextContent('Aprobada');
    expect(screen.queryByRole('button', { name: es.decision.approve })).not.toBeInTheDocument();
    expect(getDetail).toHaveBeenCalledTimes(2);
  });

  // 409 recommendation_expired: the expiry is said once and the decision disappears.
  it('reject_withExpiredRecommendation_saysItOnce', async () => {
    const user = userEvent.setup();
    const getDetail = vi
      .fn<RecommendationsGateway['getDetail']>()
      .mockResolvedValueOnce(pending)
      .mockResolvedValue(toRecommendationDetail(expiredOnOpen));
    const reject = vi
      .fn<RecommendationsGateway['reject']>()
      .mockRejectedValue(refused({ kind: 'expired' }));
    renderReview({ getDetail, reject });

    await user.click(await screen.findByRole('button', { name: es.decision.reject }));
    await user.type(noteField(), NOTE_CP046);
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    await vi.waitFor(() => expect(field(es.recommendation.status)).toHaveTextContent('Vencida'));
    expect(screen.getAllByText(es.decision.expired)).toHaveLength(1);
    expect(screen.queryByRole('button', { name: es.decision.reject })).not.toBeInTheDocument();
  });

  it.each([
    ['access-denied', es.decision.accessDenied],
    ['not-found', es.decision.notFound],
  ] as const)('reject_refusedAs%s_saysWhy', async (kind, message) => {
    const user = userEvent.setup();
    const reject = vi.fn<RecommendationsGateway['reject']>().mockRejectedValue(refused({ kind }));
    renderReview({ getDetail: async () => pending, reject });

    await user.click(await screen.findByRole('button', { name: es.decision.reject }));
    await user.type(noteField(), NOTE_CP046);
    await user.click(screen.getByRole('button', { name: es.decision.confirmReject }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  // CP048 steps 2 to 8: final states are read only and say how to replace them.
  it.each([
    ['R1 approved', approvedR1, 'Aprobada', es.recommendation.finalState],
    ['R2 modified', modifiedR2, 'Aprobada con cambios', es.recommendation.finalState],
    ['R3 manual', manualR3, 'Creada por ti y aprobada', es.recommendation.finalState],
    ['R4 rejected', rejectedR4, 'Rechazada', es.recommendation.rejectedState],
    [
      'delivered',
      detailBody({ status: 'Delivered', allowedActions: ['Archive'] }),
      'Entregada',
      es.recommendation.finalState,
    ],
    ['expired on open', expiredOnOpen, 'Vencida', es.recommendation.expiredState],
  ])('finalState_%s_isReadOnly', async (_name, body, status, notice) => {
    renderReview({ getDetail: async () => toRecommendationDetail(body) });

    const panel = await screen.findByRole('complementary', { name: es.decision.title });

    expect(field(es.recommendation.status)).toHaveTextContent(status);
    expect(within(panel).getByRole('status')).toHaveTextContent(notice);
    expect(within(panel).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('reviewedRecommendation_showsTheNoteAndTheReviewer', async () => {
    renderReview({ getDetail: async () => toRecommendationDetail(rejectedR4) });

    expect(
      await screen.findByRole('heading', { name: es.recommendation.noteTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(NOTE_CP046)).toBeInTheDocument();
    expect(field(es.recommendation.reviewedBy)).toHaveTextContent('Nutricionista Prueba');
    expect(field(es.recommendation.reviewedAt)).toHaveTextContent('20/10/2026 a las 11:00');
  });

  it('manualRecommendation_showsNoConfidenceModelOrGeneratedExplanation', async () => {
    renderReview({ getDetail: async () => toRecommendationDetail(manualR3) });

    await screen.findByRole('heading', { level: 1, name: 'Hidratación entre comidas' });

    expect(screen.queryByText(es.recommendation.confidence)).not.toBeInTheDocument();
    expect(screen.queryByText(es.recommendation.model)).not.toBeInTheDocument();
    expect(screen.getByText(es.recommendation.noExplanation)).toBeInTheDocument();
    expect(
      screen.getByText(`${es.recommendation.explanationSource}: Escrita por el nutricionista`),
    ).toBeInTheDocument();
  });

  it('sparseRecommendation_usesItsPlaceholders', async () => {
    const body = detailBody({
      title: null,
      description: null,
      steps: [],
      items: [],
      expiresAt: null,
      confidenceScore: 0.3,
      explanationSource: 'Fallback',
      supportingData: { ...supportingDataBody, topFodmapHighFoodsLast14d: [] },
    });
    renderReview({ getDetail: async () => toRecommendationDetail(body) });

    expect(await screen.findByText(es.recommendation.noSteps)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: es.recommendation.fallbackTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(es.recommendation.noItems)).toBeInTheDocument();
    expect(field(es.recommendation.expiresAt)).toHaveTextContent(es.recommendation.noExpiry);
    expect(field(es.recommendation.confidence)).toHaveTextContent('Baja · 0.30');
    expect(field(es.recommendation.topFoods)).toHaveTextContent(es.recommendation.noTopFoods);
    expect(
      screen.getByText(`${es.recommendation.explanationSource}: Texto de respaldo del motor`),
    ).toBeInTheDocument();
  });

  it('itemsWithoutNames_useTheirPlaceholders', async () => {
    const body = detailBody({
      items: [
        {
          recommendationItemId: '00000000-0000-4000-8000-0000000000e9',
          foodId: '00000000-0000-4000-8000-0000000000f9',
          foodName: null,
          category: null,
          actionType: 'Avoid',
          substituteFoodId: null,
          substituteFoodName: null,
          reasoning: null,
        },
      ],
    });
    renderReview({ getDetail: async () => toRecommendationDetail(body) });

    const table = await screen.findByRole('table', { name: es.recommendation.itemsCaption });

    expect(within(table).getByText(es.recommendation.unnamedFood)).toBeInTheDocument();
    expect(within(table).getByText('Evitar')).toBeInTheDocument();
    expect(within(table).getByText(es.recommendation.noReasoning)).toBeInTheDocument();
  });

  it('detail_whileLoading_announcesIt', () => {
    renderReview({});

    expect(screen.getByRole('status')).toHaveTextContent(es.generic.loading);
  });

  it.each([
    ['access denied', new RecommendationAccessDeniedError(), es.recommendation.accessDenied],
    ['not found', new RecommendationNotFoundError(), es.recommendation.notFound],
  ])('detail_%s_saysItWithoutRetry', async (_name, error, message) => {
    renderReview({
      getDetail: async () => {
        throw error;
      },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('button', { name: es.recommendation.retry })).not.toBeInTheDocument();
  });

  it('detail_withError_offersRetry', async () => {
    const user = userEvent.setup();
    const getDetail = vi
      .fn<RecommendationsGateway['getDetail']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValue(pending);
    renderReview({ getDetail });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.recommendation.loadError);
    await user.click(screen.getByRole('button', { name: es.recommendation.retry }));

    expect(await screen.findByRole('button', { name: es.decision.approve })).toBeInTheDocument();
  });

  it('routeWithoutUuid_saysNotFoundAndNeverAsks', async () => {
    const getDetail = vi.fn<RecommendationsGateway['getDetail']>();
    renderReview({ getDetail }, {}, '/recomendaciones/no-es-un-id');

    expect(
      await screen.findByRole('heading', { level: 1, name: es.recommendation.notFound }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.recommendation.backToReviews })).toBeInTheDocument();
    expect(getDetail).not.toHaveBeenCalled();
  });
});
