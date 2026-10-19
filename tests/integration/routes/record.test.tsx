import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppDependencies, type AppComposition } from '@/app/composition';
import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import {
  toPatientDetail,
  toPatientEvolution,
} from '@/modules/patients/infrastructure/patientRecordMapper';
import { es } from '@/shared/presentation/i18n/es';

import { server } from '../../msw/server';
import {
  baselineOnly245,
  detailBody,
  evolutionCp056A,
  RECORD_PATIENT_ID,
} from '../../support/patientRecord';
import { assignedPatientBody, fakePatientsGateway } from '../../support/patients';
import { portalSessionBody } from '../../support/portalSession';
import { renderApp, testDependencies } from '../../support/renderApp';
import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
} from '../../support/sessions';

const RECORD_URL = `/pacientes/${RECORD_PATIENT_ID}`;

describe('patient record from the root', () => {
  let app: AppComposition | null = null;

  afterEach(() => {
    app?.sessionService.dispose();
    app = null;
  });

  // R10: the record is reached from the name in the panel row.
  it('panelRowName_opensTheRecord', async () => {
    const user = userEvent.setup();
    const gateway = fakePatientsGateway({
      listAssigned: async () => toAssignedPatients([assignedPatientBody()]),
      getDetail: async () => toPatientDetail(detailBody()),
      getEvolution: async () => toPatientEvolution(baselineOnly245),
    });
    const { router } = renderApp(
      '/pacientes',
      testDependencies(fakeSessionController(nutritionistSession), gateway),
    );

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Paciente Prueba A' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RECORD_URL);
  });

  it('record_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp(
      RECORD_URL,
      testDependencies(fakeSessionController(anonymousSession)),
    );

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('record_withInvalidId_saysNotFoundWithoutAskingTheServer', async () => {
    const getDetail = vi.fn();
    renderApp(
      '/pacientes/paciente-prueba',
      testDependencies(
        fakeSessionController(nutritionistSession),
        fakePatientsGateway({ getDetail }),
      ),
    );

    expect(await screen.findByRole('heading', { name: es.record.notFound })).toBeInTheDocument();
    expect(getDetail).not.toHaveBeenCalled();
  });

  // Privacy: the patient name stays out of the URL, the tab title and browser storage.
  it('record_keepsThePatientNameOutOfUrlTitleAndStorage', async () => {
    const gateway = fakePatientsGateway({
      getDetail: async () => toPatientDetail(detailBody()),
      getEvolution: async () => toPatientEvolution(baselineOnly245),
    });
    const { router } = renderApp(
      RECORD_URL,
      testDependencies(fakeSessionController(nutritionistSession), gateway),
    );

    await screen.findByRole('heading', { level: 1, name: 'Paciente Prueba A' });

    expect(router.state.location.pathname).not.toContain('Paciente');
    expect(document.title).not.toContain('Paciente Prueba A');
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it.each([
    [
      'access denied',
      () => HttpResponse.json({ errorCode: 'unauthorized_patient_access' }, { status: 403 }),
      es.record.accessDenied,
    ],
    ['server error', () => new HttpResponse(null, { status: 503 }), es.record.loadError],
    ['network failure', () => HttpResponse.error(), es.record.loadError],
  ])('record_with%s_showsItsMessageAndKeepsTheSession', async (_name, failure, expected) => {
    server.use(
      http.post('*/api/v1/auth/portal/refresh', () => HttpResponse.json(portalSessionBody())),
      http.get(`*/api/v1/nutritionists/me/patients/${RECORD_PATIENT_ID}`, failure),
      http.get(`*/api/v1/nutritionists/me/patients/${RECORD_PATIENT_ID}/evolution`, failure),
    );
    app = createAppDependencies();
    void app.sessionService.start();
    renderApp(RECORD_URL, app);

    expect((await screen.findAllByText(expected)).length).toBeGreaterThan(0);
    expect(app.sessionService.current().status).toBe('authenticated');
    expect(screen.getByRole('navigation', { name: es.nav.label })).toBeInTheDocument();
  });
});

// R10 for the Evolution tab: panel, record, then the tab, all from the root.
describe('patient evolution from the root', () => {
  it('evolutionTab_fromThePanel_showsTheChart', async () => {
    const user = userEvent.setup();
    const gateway = fakePatientsGateway({
      listAssigned: async () => toAssignedPatients([assignedPatientBody()]),
      getDetail: async () => toPatientDetail(detailBody()),
      getEvolution: async () => toPatientEvolution(evolutionCp056A),
    });
    renderApp('/pacientes', testDependencies(fakeSessionController(nutritionistSession), gateway));

    await user.click(await screen.findByRole('link', { name: 'Paciente Prueba A' }));
    await user.click(await screen.findByRole('tab', { name: es.recordTabs.evolution }));

    expect(await screen.findByRole('img', { name: es.evolution.chartTitle })).toBeInTheDocument();
  });
});
