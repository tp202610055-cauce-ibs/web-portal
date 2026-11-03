import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ReportsGateway } from '@/modules/reports/application/ReportsGateway';
import { ReportRefusedError } from '@/modules/reports/domain/ClinicalReport';
import { ReportGenerator } from '@/modules/reports/presentation/ReportGenerator';
import { ReportsProvider } from '@/modules/reports/presentation/ReportsContext';
import { es } from '@/shared/presentation/i18n/es';

const PATIENT = '00000000-0000-4000-8000-0000000000a1';

function renderGenerator(generate: ReportsGateway['generate']) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ReportsProvider gateway={{ generate }}>
        <ReportGenerator patientId={PATIENT} today="2026-10-26" />
      </ReportsProvider>
    </QueryClientProvider>,
  );
}

async function fillAndSubmit(start: string, end: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: es.reports.open }));
  fireEvent.change(screen.getByLabelText(es.reports.from), { target: { value: start } });
  fireEvent.change(screen.getByLabelText(es.reports.to), { target: { value: end } });
  await user.click(screen.getByRole('button', { name: es.reports.submit }));
  return user;
}

describe('ReportGenerator', () => {
  // CP058 steps 2 and 3: the period is accepted and the PDF is offered for download.
  it('validPeriod_offersTheDownloadAndThePasswordNotice', async () => {
    const generate = vi.fn<ReportsGateway['generate']>(async () => ({
      downloadUrl: 'https://files.test/report.pdf',
      expiresAt: new Date('2026-10-26T16:00:00Z'),
    }));
    renderGenerator(generate);

    await fillAndSubmit('2026-08-01', '2026-08-31');

    const link = await screen.findByRole('link', { name: es.reports.download });
    expect(link).toHaveAttribute('href', 'https://files.test/report.pdf');
    expect(screen.getByText(es.reports.passwordByEmail)).toBeInTheDocument();
    expect(generate).toHaveBeenCalledWith(PATIENT, '2026-08-01', '2026-08-31', expect.any(String));
  });

  // CP059 steps 3 and 4: no data in the period, with the hint to widen it; nothing is downloaded.
  it('periodWithoutData_saysSoAndSuggestsWideningTheRange', async () => {
    renderGenerator(async () => {
      throw new ReportRefusedError('no-data');
    });

    await fillAndSubmit('2026-07-01', '2026-07-31');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(es.reports.noData);
    expect(alert).toHaveTextContent(es.reports.widenHint);
    expect(screen.queryByRole('link', { name: es.reports.download })).not.toBeInTheDocument();
  });

  it('retryingTheSamePeriod_reusesItsKey_andAnotherPeriodGetsANewOne', async () => {
    const generate = vi
      .fn<ReportsGateway['generate']>()
      .mockRejectedValue(new ReportRefusedError('no-data'));
    renderGenerator(generate);

    const user = await fillAndSubmit('2026-07-01', '2026-07-31');
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: es.reports.submit }));
    fireEvent.change(screen.getByLabelText(es.reports.to), { target: { value: '2026-10-26' } });
    await user.click(screen.getByRole('button', { name: es.reports.submit }));

    const keys = generate.mock.calls.map((call) => call[3]);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  it.each([
    ['', '', es.reports.required],
    ['2026-09-01', '2026-08-31', es.reports.order],
    ['2026-08-01', '2026-10-27', es.reports.future],
  ])('invalidPeriod_%s_%s_isCaughtBeforeSending', async (start, end, message) => {
    const generate = vi.fn<ReportsGateway['generate']>();
    renderGenerator(generate);

    await fillAndSubmit(start, end);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(generate).not.toHaveBeenCalled();
  });

  it('cancel_closesTheForm', async () => {
    const user = userEvent.setup();
    renderGenerator(vi.fn());

    await user.click(screen.getByRole('button', { name: es.reports.open }));
    await user.click(screen.getByRole('button', { name: es.reports.cancel }));

    expect(screen.queryByLabelText(es.reports.from)).not.toBeInTheDocument();
  });
});
