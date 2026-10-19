import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PatientsGateway } from '@/modules/patients';
import { PatientsProvider } from '@/modules/patients';
import { PatientAccessDeniedError } from '@/modules/patients/domain/PatientRecord';
import { toPatientEvolution } from '@/modules/patients/infrastructure/patientRecordMapper';
import { describeChange, PatientEvolution } from '@/modules/patients/presentation/PatientEvolution';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  assessment,
  evolutionBody,
  evolutionCp056A,
  RECORD_PATIENT_ID,
} from '../../../../support/patientRecord';
import { fakePatientsGateway } from '../../../../support/patients';

function renderEvolution(getEvolution: PatientsGateway['getEvolution']) {
  const { container } = render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway({ getEvolution })}>
        <PatientEvolution patientId={RECORD_PATIENT_ID} />
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return container;
}

const withServer = (payload: Parameters<typeof toPatientEvolution>[0]) => async () =>
  toPatientEvolution(payload);

describe('describeChange', () => {
  it.each([
    [-23.44, 'Reducción de 23.4 %'],
    [-9.38, 'Reducción de 9.4 %'],
    [12.5, 'Aumento de 12.5 %'],
    [-0.04, es.evolution.noChange],
    [0.04, es.evolution.noChange],
    [0, es.evolution.noChange],
    [-0.05, 'Reducción de 0.1 %'],
  ])('describeChange_%s_is_%s', (percent, expected) => {
    expect(describeChange(percent)).toBe(expected);
  });
});

describe('PatientEvolution', () => {
  // CP056 variant A, steps 4 and 5: three scores in order with their dates, and the server percentage.
  it('evolution_withThreeAssessments_showsTheTimelineAndTheServerChange', async () => {
    const container = renderEvolution(withServer(evolutionCp056A));

    const table = await screen.findByRole('table', { name: es.evolution.tableCaption });
    const rows = within(table).getAllByRole('row').slice(1);

    expect(rows.map((row) => row.children[1]?.textContent)).toEqual(['320', '280', '245']);
    expect(rows.map((row) => row.children[0]?.textContent)).toEqual([
      '21/09/2026',
      '05/10/2026',
      '19/10/2026',
    ]);
    expect(rows.map((row) => row.children[3]?.textContent)).toEqual([
      'Severo',
      'Moderado',
      'Moderado',
    ]);
    expect(
      screen.getByText(`${es.evolution.changeLabel}: Reducción de 23.4 %`),
    ).toBeInTheDocument();
    expect(screen.getByText(es.evolution.significantResponse)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: es.evolution.chartTitle })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  // CP056 step 6: neutral label until the backend counts days (B-3).
  it('evolution_showsTheFrequencyWithANeutralLabel', async () => {
    renderEvolution(withServer(evolutionCp056A));

    expect(await screen.findByText(es.evolution.frequency(26))).toBeInTheDocument();
  });

  // CP056 variant B, steps 7 and 8.
  it('evolution_withTwoAssessments_showsBothAndTheServerChange', async () => {
    renderEvolution(
      withServer(
        evolutionBody({
          ibsSssTimeline: [
            assessment(0, 320, '2026-10-05T15:00:00Z'),
            assessment(1, 290, '2026-10-19T15:00:00Z'),
          ],
          percentChangeFromBaseline: -9.38,
        }),
      ),
    );

    expect(
      await screen.findByText(`${es.evolution.changeLabel}: Reducción de 9.4 %`),
    ).toBeInTheDocument();
    expect(screen.queryByText(es.evolution.significantResponse)).toBeNull();
  });

  it('evolution_neverRecomputesThePercentage', async () => {
    renderEvolution(withServer({ ...evolutionCp056A, percentChangeFromBaseline: -10 }));

    expect(
      await screen.findByText(`${es.evolution.changeLabel}: Reducción de 10.0 %`),
    ).toBeInTheDocument();
  });

  it('evolution_withoutAPercentage_omitsTheChangeLine', async () => {
    renderEvolution(withServer({ ...evolutionCp056A, percentChangeFromBaseline: null }));

    await screen.findByRole('img', { name: es.evolution.chartTitle });
    expect(screen.queryByText(new RegExp(es.evolution.changeLabel))).toBeNull();
  });

  // CP057: only the baseline, the message and the expected date; no trend chart.
  it('evolution_withOnlyTheBaseline_showsScoreMessageAndNextDateWithoutChart', async () => {
    const container = renderEvolution(
      withServer(
        evolutionBody({
          ibsSssTimeline: [
            assessment(0, 310, '2026-10-14T15:00:00Z', { nextAssessmentDate: '2026-10-28' }),
          ],
          percentChangeFromBaseline: 0,
        }),
      ),
    );

    expect(await screen.findByText(es.evolution.baseline(310, '14/10/2026'))).toBeInTheDocument();
    expect(screen.getByText(es.evolution.onlyBaseline)).toBeInTheDocument();
    expect(screen.getByText(es.evolution.nextAssessment('28/10/2026'))).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByText(es.evolution.noChange)).toBeNull();
  });

  it('evolution_withoutAssessments_saysSo', async () => {
    renderEvolution(withServer(evolutionBody()));

    expect(await screen.findByText(es.record.noAssessments)).toBeInTheDocument();
  });

  it('evolution_withUnknownSeverity_leavesTheCategoryEmpty', async () => {
    renderEvolution(
      withServer(
        evolutionBody({
          ibsSssTimeline: [
            assessment(0, 320, '2026-10-05T15:00:00Z'),
            assessment(1, 40, '2026-10-19T15:00:00Z', { severityCategory: 'Remission' as never }),
          ],
        }),
      ),
    );

    const table = await screen.findByRole('table');

    expect(within(table).getAllByRole('row')[2]?.children[3]?.textContent).toBe('');
  });

  it.each([
    ['access denied', new PatientAccessDeniedError(), es.record.accessDenied],
    ['service down', new ServiceUnavailableError(), es.evolution.loadError],
  ])('evolution_%s_showsItsMessage', async (_name, error, expected) => {
    renderEvolution(() => Promise.reject(error));

    expect(await screen.findByRole('alert')).toHaveTextContent(expected);
  });
});
