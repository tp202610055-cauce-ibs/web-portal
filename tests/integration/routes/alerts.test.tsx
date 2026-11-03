import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { POLL_INTERVAL_MS } from '@/modules/notifications/application/listAlerts';
import { toAlertsPage } from '@/modules/notifications/infrastructure/alertMapper';
import { es } from '@/shared/presentation/i18n/es';

import { alertBody, alertListBody, fakeAlertsGateway } from '../../support/alerts';
import { renderApp, testDependencies } from '../../support/renderApp';
import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
} from '../../support/sessions';

function withAlerts(
  session = nutritionistSession,
  list = vi.fn(async () => toAlertsPage(alertListBody())),
) {
  const controller = fakeSessionController(session);
  const deps = testDependencies(controller, undefined, undefined, undefined, undefined, {
    alerts: fakeAlertsGateway({ list }),
  });
  return { controller, deps, list };
}

afterEach(() => vi.useRealTimers());

describe('alerts bell from the root', () => {
  // CP009 steps 9 and 10: the bell is in the top bar of every signed-in screen.
  it('signedIn_showsTheBellOnEveryScreen_andOpensTheList', async () => {
    const user = userEvent.setup();
    const { deps } = withAlerts();
    renderApp('/gestion-pacientes', deps);

    await user.click(await screen.findByRole('button', { name: es.notifications.button(1) }));

    expect(await screen.findByText(alertBody().message ?? '')).toBeInTheDocument();
  });

  it('signedOut_neverReadsTheAlerts', async () => {
    const { deps, list } = withAlerts(anonymousSession);
    renderApp('/pacientes', deps);

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(list).not.toHaveBeenCalled();
  });

  // R12 and CP021: polling does not count as activity, and the session end stops it.
  it('polling_isNotActivity_andStopsWhenTheSessionEnds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { controller, deps, list } = withAlerts();
    renderApp('/pacientes', deps);
    await screen.findByRole('button', { name: es.notifications.button(1) });

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS));
    expect(list.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(controller.recordActivity).not.toHaveBeenCalled();

    act(() => controller.set(anonymousSession));
    await screen.findByRole('heading', { name: es.login.title });
    const calls = list.mock.calls.length;
    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3));
    expect(list.mock.calls.length).toBe(calls);
  });
});
