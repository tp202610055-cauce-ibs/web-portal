import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { glossaryFrom } from '@/modules/clinical-registry/domain/Glossary';
import { toHistoryEvents } from '@/modules/clinical-registry/infrastructure/historyMapper';
import type { PasswordResetGateway } from '@/modules/identity';
import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import { toPatientDetail } from '@/modules/patients/infrastructure/patientRecordMapper';
import {
  toPatientRecommendationsPage,
  toRecommendationDetail,
} from '@/modules/recommendations/infrastructure/recommendationMapper';
import { es } from '@/shared/presentation/i18n/es';

import { fakeClinicalRegistryGateway } from '../../support/clinicalRegistry';
import { fakeFoodCatalogGateway } from '../../support/foods';
import { cp034History, NOTE_MEAL } from '../../support/history';
import { detailBody as patientDetailBody, RECORD_PATIENT_ID } from '../../support/patientRecord';
import { assignedPatientBody, fakePatientsGateway } from '../../support/patients';
import {
  approvedR1,
  fakeRecommendationsGateway,
  patientRecommendationsAfterArchive,
} from '../../support/recommendations';
import { renderApp, testDependencies } from '../../support/renderApp';
import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
} from '../../support/sessions';

const patients = fakePatientsGateway({
  listAssigned: async () => toAssignedPatients([assignedPatientBody()]),
  getDetail: async () => toPatientDetail(patientDetailBody()),
});

async function openRecord(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
  await screen.findByRole('heading', { level: 1, name: 'Paciente Prueba A' });
}

describe('record sections from the root', () => {
  // CP034 and CP087: panel, record, then the Diario tab.
  it('diaryTab_showsTheNotesNextToTheirRecords', async () => {
    const user = userEvent.setup();
    renderApp(
      '/pacientes',
      testDependencies(
        fakeSessionController(nutritionistSession),
        patients,
        undefined,
        undefined,
        fakeFoodCatalogGateway({
          getFood: async (foodId) => ({ foodId, name: 'Causa rellena', fodmapLevel: 'Moderate' }),
        }),
        {
          clinicalRegistry: fakeClinicalRegistryGateway({
            getPatientHistory: async () => toHistoryEvents(cp034History),
          }),
        },
      ),
    );

    await openRecord(user);
    await user.click(screen.getByRole('tab', { name: es.recordTabs.diary }));

    expect(await screen.findByText(`«${NOTE_MEAL}»`)).toBeInTheDocument();
  });

  // CP072, CP074 and CP075: the Recommendations tab, the manual form and back.
  it('recommendationsTab_listsThemAndOpensTheManualForm', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(
      '/pacientes',
      testDependencies(
        fakeSessionController(nutritionistSession),
        patients,
        undefined,
        fakeRecommendationsGateway({
          listForPatient: async () =>
            toPatientRecommendationsPage(patientRecommendationsAfterArchive),
        }),
      ),
    );

    await openRecord(user);
    await user.click(screen.getByRole('tab', { name: es.recordTabs.recommendations }));
    const archived = await screen.findByRole('table', {
      name: es.patientRecommendations.archivedCaption,
    });
    expect(within(archived).getByText(es.archiveReason.ObjectiveMet)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: es.patientRecommendations.create }));

    expect(await screen.findByRole('heading', { name: es.manual.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(
      `/pacientes/${RECORD_PATIENT_ID}/recomendaciones/nueva`,
    );
  });

  // CP074 steps 3 to 6: archiving returns to the record on its Recommendations tab.
  it('archive_returnsToTheRecordWithTheConfirmation', async () => {
    const user = userEvent.setup();
    const archive = vi.fn(async () => undefined);
    renderApp(
      `/recomendaciones/${approvedR1.recommendationId}`,
      testDependencies(
        fakeSessionController(nutritionistSession),
        patients,
        undefined,
        fakeRecommendationsGateway({
          getDetail: async () => toRecommendationDetail(approvedR1),
          archive,
          listForPatient: async () =>
            toPatientRecommendationsPage(patientRecommendationsAfterArchive),
        }),
      ),
    );

    await user.click(await screen.findByRole('button', { name: es.archive.open }));
    await user.selectOptions(
      screen.getByLabelText(es.archive.reasonLabel),
      es.archiveReason.ObjectiveMet,
    );
    await user.click(screen.getByRole('button', { name: es.archive.confirm }));

    expect(await screen.findByText(es.patientRecommendations.archived)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: es.recordTabs.recommendations })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  // CP058 step 2: the record offers the report.
  it('record_offersTheReport', async () => {
    const user = userEvent.setup();
    renderApp('/pacientes', testDependencies(fakeSessionController(nutritionistSession), patients));

    await openRecord(user);
    await user.click(screen.getByRole('button', { name: es.reports.open }));

    expect(screen.getByLabelText(es.reports.from)).toBeInTheDocument();
  });

  it('manualForm_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp(
      `/pacientes/${RECORD_PATIENT_ID}/recomendaciones/nueva`,
      testDependencies(fakeSessionController(anonymousSession)),
    );

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});

describe('glossary from the root', () => {
  // CP068 step 9 and CP069 part B: the Ayuda menu opens the glossary.
  it('helpMenu_opensTheGlossary', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(
      '/pacientes',
      testDependencies(
        fakeSessionController(nutritionistSession),
        patients,
        undefined,
        undefined,
        undefined,
        {
          clinicalRegistry: fakeClinicalRegistryGateway({
            getGlossary: async () =>
              glossaryFrom(
                [{ term: 'FODMAP', definition: 'Definición.', category: 'Nutritional' }],
                null,
              ),
          }),
        },
      ),
    );

    const help = await screen.findByRole('button', { name: es.nav.help });
    expect(help).toHaveAttribute('aria-expanded', 'false');
    await user.click(help);
    await user.click(screen.getByRole('link', { name: es.nav.glossary }));

    expect(
      await screen.findByRole('heading', { level: 1, name: es.glossary.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/glosario');
    expect(screen.queryByRole('link', { name: es.nav.glossary })).not.toBeInTheDocument();
  });

  it('glossary_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp(
      '/glosario',
      testDependencies(fakeSessionController(anonymousSession)),
    );

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});

describe('password recovery from the root', () => {
  // CP018 part B: the login links to the recovery form.
  it('login_linksToTheRecoveryForm', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(
      '/login',
      testDependencies(fakeSessionController(anonymousSession)),
    );

    await user.click(await screen.findByRole('link', { name: es.passwordReset.forgot }));

    expect(
      await screen.findByRole('heading', { name: es.passwordReset.requestTitle }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/recuperar-contrasena');
  });

  // The email link opens without a session and is checked against the server.
  it('emailLink_opensWithoutSession_andValidatesTheToken', async () => {
    const validate = vi.fn<PasswordResetGateway['validate']>(async () => undefined);
    renderApp(
      '/auth/password-reset?token=token-1',
      testDependencies(
        fakeSessionController(anonymousSession),
        undefined,
        undefined,
        undefined,
        undefined,
        {
          passwordReset: {
            request: async () => undefined,
            validate,
            confirm: async () => undefined,
          },
        },
      ),
    );

    expect(await screen.findByLabelText(es.passwordReset.newPassword)).toBeInTheDocument();
    expect(validate).toHaveBeenCalledWith('token-1');
  });
});
