import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PatientsProvider } from '@/modules/patients';
import { toPatientDetail } from '@/modules/patients/infrastructure/patientRecordMapper';
import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import { ManualRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { ManualRecommendationPage } from '@/modules/recommendations/presentation/ManualRecommendationPage';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import { es } from '@/shared/presentation/i18n/es';

import { detailBody as patientDetailBody } from '../../../../support/patientRecord';
import { fakePatientsGateway } from '../../../../support/patients';
import { fakeRecommendationsGateway } from '../../../../support/recommendations';

const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const URL = `/pacientes/${PATIENT}/recomendaciones/nueva`;
const TITLE = 'Reducción gradual de lácteos';
const DESCRIPTION = 'Repartir las porciones de lácteos durante el día';
const NOTE = 'Reducir lácteos por intolerancia a la lactosa';

function renderForm(createManual: RecommendationsGateway['createManual']) {
  const router = createMemoryRouter(
    [
      {
        path: '/pacientes/:patientId/recomendaciones/nueva',
        element: <ManualRecommendationPage />,
      },
      { path: '/pacientes/:patientId', element: <p>Ficha</p> },
    ],
    { initialEntries: [URL] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider
        gateway={fakePatientsGateway({
          getDetail: async () => toPatientDetail(patientDetailBody()),
        })}
      >
        <RecommendationsProvider gateway={fakeRecommendationsGateway({ createManual })}>
          <RouterProvider router={router} />
        </RecommendationsProvider>
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return router;
}

async function fill(values: {
  title?: string;
  description?: string;
  note?: string;
  steps?: string[];
}) {
  const user = userEvent.setup();
  if (values.title) await user.type(screen.getByLabelText(es.manual.titleLabel), values.title);
  if (values.description) {
    await user.type(screen.getByLabelText(es.manual.descriptionLabel), values.description);
  }
  for (const [index, step] of (values.steps ?? []).entries()) {
    await user.click(screen.getByRole('button', { name: es.editor.addStep }));
    await user.type(screen.getByLabelText(es.editor.stepLabel(index + 1)), step);
  }
  if (values.note) await user.type(screen.getByLabelText(es.decision.noteLabel), values.note);
  await user.click(screen.getByRole('button', { name: es.manual.submit }));
  return user;
}

describe('ManualRecommendationPage', () => {
  // CP072 steps 3 to 6: three steps in order, then the record confirms the creation.
  it('validForm_createsTheRecommendation_andGoesBackToTheRecord', async () => {
    const createManual = vi.fn<RecommendationsGateway['createManual']>(async () => 'new-id');
    const router = renderForm(createManual);
    expect(await screen.findByText('Paciente Prueba A')).toBeInTheDocument();

    await fill({
      title: TITLE,
      description: DESCRIPTION,
      note: NOTE,
      steps: ['Paso uno', 'Paso dos', 'Paso tres'],
    });

    expect(await screen.findByText('Ficha')).toBeInTheDocument();
    expect(createManual).toHaveBeenCalledWith({
      patientId: PATIENT,
      title: TITLE,
      description: DESCRIPTION,
      steps: ['Paso uno', 'Paso dos', 'Paso tres'],
      clinicalNote: NOTE,
    });
    expect(router.state.location.pathname).toBe(`/pacientes/${PATIENT}`);
    expect(router.state.location.state).toEqual({
      tab: 'recommendations',
      notice: es.patientRecommendations.created,
    });
  });

  // CP090: the steps are optional and their absence marks no error.
  it('withoutSteps_isCreated', async () => {
    const createManual = vi.fn<RecommendationsGateway['createManual']>(async () => 'new-id');
    renderForm(createManual);
    expect(screen.getByText(es.manual.stepsHint)).toBeInTheDocument();

    await fill({ title: 'Hidratación entre comidas', description: DESCRIPTION, note: NOTE });

    expect(await screen.findByText('Ficha')).toBeInTheDocument();
    expect(createManual.mock.calls[0]?.[0].steps).toEqual([]);
  });

  // CP073 variants A to D: nothing is sent, the message names the field and the rest is kept.
  it.each([
    [{ description: DESCRIPTION, note: NOTE }, es.manual.titleRequired],
    [{ title: TITLE, note: NOTE }, es.manual.descriptionRequired],
    [{ title: TITLE, description: DESCRIPTION }, es.decision.noteEmpty],
    [{ title: TITLE, description: DESCRIPTION, note: 'Muy poco.' }, es.decision.noteTooShort],
  ] as [{ title?: string; description?: string; note?: string }, string][])(
    'missingData_%o_isNotSent',
    async (values, message) => {
      const createManual = vi.fn<RecommendationsGateway['createManual']>();
      renderForm(createManual);

      await fill(values);

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(createManual).not.toHaveBeenCalled();
      if (values.description) {
        expect(screen.getByLabelText(es.manual.descriptionLabel)).toHaveValue(values.description);
      }
      if (values.title) {
        expect(screen.getByLabelText(es.manual.titleLabel)).toHaveValue(values.title);
      }
    },
  );

  it('serverRefusal_showsItsMessagesNextToTheFields', async () => {
    renderForm(async () => {
      throw new ManualRefusedError({
        kind: 'invalid',
        fields: { note: ['Nota rechazada.'] },
        other: ['Otro.'],
      });
    });

    await fill({ title: TITLE, description: DESCRIPTION, note: NOTE });

    expect(await screen.findByText('Nota rechazada.')).toBeInTheDocument();
    expect(screen.getByText('Otro.')).toBeInTheDocument();
  });

  it('patientNotAssigned_saysSo', async () => {
    renderForm(async () => {
      throw new ManualRefusedError({ kind: 'access-denied' });
    });

    await fill({ title: TITLE, description: DESCRIPTION, note: NOTE });

    expect(await screen.findByText(es.manual.accessDenied)).toBeInTheDocument();
  });

  it('removeStep_takesItOut', async () => {
    const createManual = vi.fn<RecommendationsGateway['createManual']>(async () => 'id');
    renderForm(createManual);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: es.editor.addStep }));
    await user.click(screen.getByRole('button', { name: es.editor.removeStep(1) }));

    expect(screen.queryByLabelText(es.editor.stepLabel(1))).not.toBeInTheDocument();
  });
});
