import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PatientsProvider, type PatientsGateway } from '@/modules/patients';
import {
  toPatientDetail,
  toPatientEvolution,
} from '@/modules/patients/infrastructure/patientRecordMapper';
import { RecordTabs } from '@/modules/patients/presentation/RecordTabs';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import { detailBody, evolutionCp056A, RECORD_PATIENT_ID } from '../../../../support/patientRecord';
import { fakePatientsGateway } from '../../../../support/patients';

function renderTabs(overrides: Partial<PatientsGateway>) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={fakePatientsGateway(overrides)}>
        <RecordTabs patientId={RECORD_PATIENT_ID} />
      </PatientsProvider>
    </QueryClientProvider>,
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('RecordTabs', () => {
  it('tabs_startOnSummaryWithOneTabStop', () => {
    renderTabs({});

    expect(tab(es.recordTabs.summary)).toHaveAttribute('aria-selected', 'true');
    expect(tab(es.recordTabs.summary)).toHaveAttribute('tabindex', '0');
    expect(tab(es.recordTabs.evolution)).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'record-tab-summary');
  });

  it('keyboard_arrowsHomeAndEnd_moveSelectionAndFocus', async () => {
    const user = userEvent.setup();
    renderTabs({});
    tab(es.recordTabs.summary).focus();

    await user.keyboard('{ArrowRight}');
    expect(tab(es.recordTabs.evolution)).toHaveFocus();
    expect(tab(es.recordTabs.evolution)).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(tab(es.recordTabs.summary)).toHaveFocus();

    await user.keyboard('{End}');
    expect(tab(es.recordTabs.evolution)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tab(es.recordTabs.summary)).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab(es.recordTabs.evolution)).toHaveAttribute('aria-selected', 'true');
  });

  it('summaryAndEvolution_shareOneEvolutionRequest', async () => {
    const user = userEvent.setup();
    const getEvolution = vi.fn(async () => toPatientEvolution(evolutionCp056A));
    renderTabs({ getDetail: async () => toPatientDetail(detailBody()), getEvolution });
    await screen.findByText(/245 puntos/);

    await user.click(tab(es.recordTabs.evolution));

    expect(await screen.findByRole('img', { name: es.evolution.chartTitle })).toBeInTheDocument();
    expect(getEvolution).toHaveBeenCalledTimes(1);
  });

  it('evolutionFailure_doesNotHideTheSummary', async () => {
    const user = userEvent.setup();
    renderTabs({
      getDetail: async () => toPatientDetail(detailBody()),
      getEvolution: () => Promise.reject(new ServiceUnavailableError()),
    });

    await user.click(tab(es.recordTabs.evolution));
    expect(await screen.findByText(es.evolution.loadError)).toBeInTheDocument();
    await user.click(tab(es.recordTabs.summary));

    expect(await screen.findByText(es.record.fields.age)).toBeInTheDocument();
  });
});
