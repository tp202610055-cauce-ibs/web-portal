import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PatientsProvider, type PatientsGateway } from '@/modules/patients';
import {
  PatientAccessDeniedError,
  PatientNotFoundError,
} from '@/modules/patients/domain/PatientRecord';
import {
  toPatientDetail,
  toPatientEvolution,
} from '@/modules/patients/infrastructure/patientRecordMapper';
import { PatientSummary } from '@/modules/patients/presentation/PatientSummary';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  assessment,
  baselineOnly245,
  detailBody,
  detailWithoutProfile,
  evolutionBody,
  RECORD_PATIENT_ID,
} from '../../../../support/patientRecord';
import { fakePatientsGateway } from '../../../../support/patients';

function renderSummary(overrides: Partial<PatientsGateway>) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway(overrides)}>
        <PatientSummary patientId={RECORD_PATIENT_ID} />
      </PatientsProvider>
    </QueryClientProvider>,
  );
}

const withData = {
  getDetail: async () => toPatientDetail(detailBody()),
  getEvolution: async () => toPatientEvolution(baselineOnly245),
};

function field(label: string): HTMLElement | null | undefined {
  return screen.getByText(label).nextElementSibling as HTMLElement | null;
}

describe('PatientSummary', () => {
  it('summary_withProfile_showsTheClinicalData', async () => {
    renderSummary(withData);

    await screen.findByText(es.record.fields.age);
    expect(field(es.record.fields.age)).toHaveTextContent('34 años');
    expect(field(es.record.fields.sex)).toHaveTextContent('Femenino');
    expect(field(es.record.fields.subtype)).toHaveTextContent('SII-D');
    expect(field(es.record.fields.bmi)).toHaveTextContent('22.9 kg/m² · Peso normal');
    expect(field(es.record.fields.diagnosisDate)).toHaveTextContent('14/03/2025');
    expect(field(es.record.fields.medications)).toHaveTextContent('Ninguna');
    expect(
      screen.getByText('Lactosa · Intolerancia · Moderada · Molestias con leche entera'),
    ).toBeInTheDocument();
    expect(screen.queryByText(es.record.profilePending)).toBeNull();
  });

  it('summary_withoutProfile_saysSoWithoutInventingData', async () => {
    renderSummary({ ...withData, getDetail: async () => toPatientDetail(detailWithoutProfile) });

    expect(await screen.findByText(es.record.profilePending)).toBeInTheDocument();
    for (const label of Object.values(es.record.fields)) {
      expect(field(label)).toHaveTextContent(es.record.noData);
    }
    expect(screen.getByText(es.record.noAllergies)).toBeInTheDocument();
  });

  it('summary_withUnknownBmiCategory_showsOnlyTheNumber', async () => {
    renderSummary({
      ...withData,
      getDetail: async () => toPatientDetail(detailBody({ bmiCategory: 'very-low' })),
    });

    await screen.findByText(es.record.fields.bmi);
    expect(field(es.record.fields.bmi)?.textContent).toBe('22.9 kg/m²');
  });

  // CP012 step 11: the baseline score and its date, without opening another tab.
  it('latestIbsSss_withOnlyTheBaseline_showsScoreDateAndType', async () => {
    renderSummary(withData);

    const card = (await screen.findByRole('heading', { name: es.record.latestIbsSss }))
      .parentElement as HTMLElement;

    expect(
      await within(card).findByText(es.record.latestIbsSssValue(245, '19/10/2026', 'Línea base')),
    ).toBeInTheDocument();
  });

  // CP030 step 10: the newest result is the periodic one.
  it('latestIbsSss_withAPeriodicResult_showsTheNewest', async () => {
    renderSummary({
      ...withData,
      getEvolution: async () =>
        toPatientEvolution(
          evolutionBody({
            ibsSssTimeline: [
              assessment(0, 320, '2026-10-05T15:00:00Z'),
              assessment(1, 245, '2026-10-19T15:00:00Z'),
            ],
          }),
        ),
    });

    expect(
      await screen.findByText(
        es.record.latestIbsSssValue(245, '19/10/2026', 'Evaluación periódica'),
      ),
    ).toBeInTheDocument();
  });

  it('latestIbsSss_withoutAssessments_saysSo', async () => {
    renderSummary({ ...withData, getEvolution: async () => toPatientEvolution(evolutionBody()) });

    expect(await screen.findByText(es.record.noAssessments)).toBeInTheDocument();
  });

  it('latestIbsSss_failing_keepsTheRestOfTheSummaryAndRetries', async () => {
    const getEvolution = vi
      .fn<PatientsGateway['getEvolution']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(toPatientEvolution(baselineOnly245));
    renderSummary({ ...withData, getEvolution });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.record.ibsSssLoadError);
    expect(await screen.findByText(es.record.fields.age)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: es.record.retry }));

    expect(await screen.findByText(/245 puntos/)).toBeInTheDocument();
  });

  it.each([
    ['access denied', new PatientAccessDeniedError(), es.record.accessDenied],
    ['not found', new PatientNotFoundError(), es.record.notFound],
  ])('detail_%s_showsItsMessageWithoutRetry', async (_name, error, expected) => {
    renderSummary({ ...withData, getDetail: () => Promise.reject(error) });

    await screen.findByText(expected);
    expect(screen.queryByRole('button', { name: es.record.retry })).toBeNull();
  });

  it('detail_unavailable_offersRetryThatRecovers', async () => {
    const getDetail = vi
      .fn<PatientsGateway['getDetail']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(toPatientDetail(detailBody()));
    renderSummary({ ...withData, getDetail });

    await screen.findByText(es.record.loadError);
    await userEvent.setup().click(screen.getByRole('button', { name: es.record.retry }));

    expect(await screen.findByText(es.record.fields.age)).toBeInTheDocument();
  });
});
