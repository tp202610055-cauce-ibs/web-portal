import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AlertsGateway } from '@/modules/notifications/application/AlertsGateway';
import { POLL_INTERVAL_MS } from '@/modules/notifications/application/listAlerts';
import { toAlertsPage } from '@/modules/notifications/infrastructure/alertMapper';
import { AlertsProvider } from '@/modules/notifications/presentation/AlertsContext';
import { NotificationBell } from '@/modules/notifications/presentation/NotificationBell';
import { es } from '@/shared/presentation/i18n/es';

import { alertBody, alertListBody, fakeAlertsGateway } from '../../../../support/alerts';

const text = es.notifications;

function renderBell(gateway: AlertsGateway) {
  const router = createMemoryRouter(
    [
      { path: '/pacientes', element: <NotificationBell /> },
      { path: '/pacientes/:patientId', element: <p>Ficha</p> },
    ],
    { initialEntries: ['/pacientes'] },
  );
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <AlertsProvider gateway={gateway}>
        <RouterProvider router={router} />
      </AlertsProvider>
    </QueryClientProvider>,
  );
  return { ...view, router };
}

afterEach(() => {
  vi.useRealTimers();
  focusManager.setFocused(undefined);
});

describe('NotificationBell', () => {
  // CP054 step 6 and CP087 step 5: the counter names the unread alerts; the list shows the message.
  it('open_showsTheMessages_andMarksAllAsReadOnceLoaded', async () => {
    const user = userEvent.setup();
    const readAll = vi.fn<AlertsGateway['readAll']>(async () => undefined);
    const subtype = alertBody({
      id: 'a2',
      type: 'PatientSubtypeChanged',
      patientName: 'Paciente Prueba E',
      patientCode: 'P-0007',
      message: 'Paciente Prueba E cambió su subtipo de SII.',
      isRead: true,
    });
    renderBell(
      fakeAlertsGateway({
        list: async () => toAlertsPage(alertListBody([alertBody(), subtype])),
        readAll,
      }),
    );

    const button = await screen.findByRole('button', { name: text.button(1) });
    expect(button).toHaveTextContent('1');
    await user.click(button);

    const panel = await screen.findByRole('region', { name: text.title });
    expect(within(panel).getByText(alertBody().message ?? '')).toBeInTheDocument();
    expect(
      within(panel).getByText('Paciente Prueba E cambió su subtipo de SII.'),
    ).toBeInTheDocument();
    expect(within(panel).getByText(text.patientCode('P-0007'))).toBeInTheDocument();
    expect(within(panel).getAllByText(text.unread)).toHaveLength(1);
    expect(readAll).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: text.button(0) })).toBeInTheDocument();
    expect(within(panel).getAllByText(text.unread)).toHaveLength(1);
  });

  it('tenOrMore_showNinePlus_andHiddenOnesAreCounted', async () => {
    const user = userEvent.setup();
    renderBell(
      fakeAlertsGateway({
        list: async () =>
          toAlertsPage(alertListBody([alertBody()], { totalCount: 25, unreadCount: 12 })),
      }),
    );

    const button = await screen.findByRole('button', { name: text.button(12) });
    expect(button).toHaveTextContent('9+');
    await user.click(button);

    expect(await screen.findByText(text.hidden(1, 25))).toBeInTheDocument();
  });

  it('nothingUnread_doesNotCallReadAll', async () => {
    const user = userEvent.setup();
    const readAll = vi.fn<AlertsGateway['readAll']>();
    renderBell(fakeAlertsGateway({ readAll }));

    await user.click(await screen.findByRole('button', { name: text.button(0) }));

    expect(await screen.findByText(text.empty)).toBeInTheDocument();
    expect(readAll).not.toHaveBeenCalled();
  });

  it('escape_closesThePanel_andReturnsTheFocus', async () => {
    const user = userEvent.setup();
    renderBell(fakeAlertsGateway());
    const button = await screen.findByRole('button', { name: text.button(0) });

    await user.click(button);
    await screen.findByText(text.empty);
    expect(screen.getByRole('heading', { name: text.title })).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('region', { name: text.title })).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('alertLink_opensTheRecord_andClosesThePanel', async () => {
    const user = userEvent.setup();
    const { router } = renderBell(
      fakeAlertsGateway({
        list: async () => toAlertsPage(alertListBody([alertBody({ isRead: true })])),
      }),
    );

    await user.click(await screen.findByRole('button', { name: text.button(0) }));
    await user.click(await screen.findByRole('link', { name: text.openRecord }));

    expect(router.state.location.pathname).toBe(`/pacientes/${alertBody().patientId}`);
  });

  it('aFailedList_offersARetryInsideThePanel', async () => {
    const user = userEvent.setup();
    const list = vi
      .fn<AlertsGateway['list']>()
      .mockResolvedValueOnce(toAlertsPage(alertListBody([])))
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue(toAlertsPage(alertListBody([])));
    renderBell(fakeAlertsGateway({ list }));

    await user.click(await screen.findByRole('button', { name: text.button(0) }));
    await user.click(await screen.findByRole('button', { name: text.retry }));

    expect(await screen.findByText(text.empty)).toBeInTheDocument();
  });

  // R12: the poll runs every 90 s while the tab is visible and stops with the session.
  it('polls_whileVisible_announcesNewAlerts_andStopsWhenUnmounted', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const list = vi
      .fn<AlertsGateway['list']>()
      .mockResolvedValueOnce(toAlertsPage(alertListBody([])))
      .mockResolvedValue(toAlertsPage(alertListBody([alertBody()])));
    const { unmount } = renderBell(fakeAlertsGateway({ list }));
    await screen.findByRole('button', { name: text.button(0) });

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS));

    expect(await screen.findByRole('button', { name: text.button(1) })).toBeInTheDocument();
    expect(screen.getByText(text.announce(1))).toBeInTheDocument();
    const calls = list.mock.calls.length;
    focusManager.setFocused(false);
    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2));
    expect(list.mock.calls.length).toBe(calls);
    focusManager.setFocused(true);
    await act(() => vi.advanceTimersByTimeAsync(0));
    const beforeUnmount = list.mock.calls.length;
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2));
    expect(list.mock.calls.length).toBe(beforeUnmount);
  });
});
