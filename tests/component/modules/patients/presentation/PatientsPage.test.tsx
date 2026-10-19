import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PatientsPage, PatientsProvider, type PatientsGateway } from '@/modules/patients';
import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import { cp049Panel, fakePatientsGateway, patientWithoutData } from '../../../../support/patients';

function renderPanel(overrides: Partial<PatientsGateway>) {
  const gateway = fakePatientsGateway(overrides);
  const router = createMemoryRouter([{ path: '/pacientes', element: <PatientsPage /> }], {
    initialEntries: ['/pacientes'],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PatientsProvider gateway={gateway}>
        <RouterProvider router={router} />
      </PatientsProvider>
    </QueryClientProvider>,
  );
  return router;
}

function bodyRows(): HTMLElement[] {
  const [, ...rows] = within(screen.getByRole('table')).getAllByRole('row');
  return rows;
}

describe('PatientsPage', () => {
  // CP049: the panel shows the server order and priority, it never sorts or recomputes them.
  it('panel_keepsTheServerOrderAndShowsItsPriority', async () => {
    renderPanel({ listAssigned: async () => toAssignedPatients(cp049Panel) });

    await screen.findByRole('table');
    const rows = bodyRows();

    expect(rows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual([
      'Paciente Prueba A',
      'Paciente Prueba B',
      'Paciente Prueba E',
      'Paciente Prueba C',
      'Paciente Prueba D',
      'Paciente Prueba F',
    ]);
    expect(rows.map((row) => within(row).getByText(/^(Alta|Media|Normal)$/).textContent)).toEqual([
      'Alta',
      'Alta',
      'Media',
      'Normal',
      'Normal',
      'Normal',
    ]);
    expect(rows).toHaveLength(6);
  });

  it('row_withCompleteData_showsSubtypeScoreActivityAndProfile', async () => {
    renderPanel({ listAssigned: async () => toAssignedPatients(cp049Panel.slice(1, 2)) });

    const [row] = (await screen.findByRole('table'), bodyRows());

    expect(row).toHaveTextContent('SII-D');
    expect(row).toHaveTextContent('180');
    expect(row).toHaveTextContent('20/10/2026 10:15');
    expect(row).toHaveTextContent('1');
    expect(row).toHaveTextContent(es.patients.profileComplete);
  });

  it('row_withoutNameSubtypeScoreOrActivity_saysSoWithoutInventing', async () => {
    renderPanel({ listAssigned: async () => toAssignedPatients([patientWithoutData]) });

    const [row] = (await screen.findByRole('table'), bodyRows());

    expect(within(row as HTMLElement).getByRole('rowheader')).toHaveTextContent(
      es.patients.nameUnavailable,
    );
    expect(row).toHaveTextContent(es.patients.noSubtype);
    expect(row).toHaveTextContent(es.patients.noScore);
    expect(row).toHaveTextContent(es.patients.noActivity);
    expect(row).toHaveTextContent(es.patients.profilePending);
  });

  it('subtypes_useTheMobileLabels', async () => {
    const rows = (['IbsD', 'IbsC', 'IbsM', 'IbsU'] as const).map((ibsSubtype, index) => ({
      ...cp049Panel[index],
      patientUserId: `subtype-${index}`,
      ibsSubtype,
    }));
    renderPanel({ listAssigned: async () => toAssignedPatients(rows) });

    await screen.findByRole('table');

    expect(bodyRows().map((row) => row.children[1]?.textContent)).toEqual([
      'SII-D',
      'SII-C',
      'SII-M',
      'SII-NC',
    ]);
  });

  // CP050 steps 3 to 6: an empty panel explains how to receive patients, without any error.
  it('panel_withoutPatients_showsTheEmptyStateWithoutErrors', async () => {
    renderPanel({ listAssigned: async () => [] });

    expect(await screen.findByText(es.patients.empty)).toBeInTheDocument();
    expect(screen.getByText(es.patients.emptyHint)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('panel_whileLoading_showsTheSkeleton', () => {
    renderPanel({ listAssigned: () => new Promise(() => undefined) });

    expect(screen.getByRole('status')).toHaveTextContent(es.generic.loading);
  });

  // CP051: a clear message with "Reintentar"; retrying after recovery loads the list.
  it('panel_withLoadError_offersRetryThatRecovers', async () => {
    const listAssigned = vi
      .fn<PatientsGateway['listAssigned']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(toAssignedPatients(cp049Panel));
    renderPanel({ listAssigned });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.patients.loadError);
    await userEvent.setup().click(screen.getByRole('button', { name: es.patients.retry }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
