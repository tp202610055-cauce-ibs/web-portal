import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppDependencies, type AppComposition } from '@/app/composition';
import { BroadcastCrossTabChannel } from '@/modules/identity';
import { es } from '@/shared/presentation/i18n/es';

import { server } from '../../msw/server';
import { portalSessionBody } from '../../support/portalSession';
import { renderApp } from '../../support/renderApp';

const LOGIN = '*/api/v1/auth/portal/login';
const REFRESH = '*/api/v1/auth/portal/refresh';
const LOGOUT = '*/api/v1/auth/portal/logout';
const MINUTE = 60 * 1000;

const ended = () => HttpResponse.json({ errorCode: 'invalid_refresh_token' }, { status: 401 });
const rejected = () => HttpResponse.json({ errorCode: 'invalid_credentials' }, { status: 401 });

// Production composition from the root: real SessionService, gateway and channel, backend in MSW.
describe('portal session from the root', () => {
  let app: AppComposition | null = null;

  function startApp(url = '/') {
    // Landing on the panel loads the patient list; these tests only need it to exist.
    server.use(http.get('*/api/v1/nutritionists/me/patients', () => HttpResponse.json([])));
    app = createAppDependencies();
    void app.sessionService.start();
    return { app, ...renderApp(url, app) };
  }

  afterEach(() => {
    app?.sessionService.dispose();
    app = null;
    vi.useRealTimers();
  });

  async function signIn(user = userEvent.setup()) {
    await user.type(await screen.findByLabelText(es.login.email), 'nutri.prueba@cauce.test');
    await user.type(screen.getByLabelText(es.login.password), 'synthetic-password');
    await user.click(screen.getByRole('button', { name: es.login.submit }));
  }

  // CP016 steps 1 to 6.
  it('login_withValidCredentials_landsOnThePanelWithoutBrowserStorage', async () => {
    server.use(
      http.post(REFRESH, ended),
      http.post(LOGIN, () => HttpResponse.json(portalSessionBody())),
    );
    const { router } = startApp();

    await signIn();

    expect(
      await screen.findByRole('heading', { level: 1, name: es.patients.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pacientes');
    expect(screen.getByText('Nutricionista Prueba')).toBeInTheDocument();
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  // CP006 and CP017: every rejected variant shows the same message.
  it('login_rejectedByTheServer_showsTheSingleMessage', async () => {
    server.use(http.post(REFRESH, ended), http.post(LOGIN, rejected));
    startApp();

    await signIn();

    expect(await screen.findByRole('alert')).toHaveTextContent(es.login.rejected);
  });

  it('login_withResponseOutsideTheContract_showsTheGenericError', async () => {
    server.use(
      http.post(REFRESH, ended),
      http.post(LOGIN, () => HttpResponse.json({ expiresIn: 900 })),
    );
    startApp();

    await signIn();

    expect(await screen.findByRole('alert')).toHaveTextContent(es.generic.error);
  });

  it('reload_withValidCookie_keepsTheSession', async () => {
    server.use(http.post(REFRESH, () => HttpResponse.json(portalSessionBody())));
    const { router } = startApp('/pacientes');

    expect(
      await screen.findByRole('heading', { level: 1, name: es.patients.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pacientes');
  });

  it('boot_withNetworkFailure_offersRetryAndRecovers', async () => {
    server.use(http.post(REFRESH, () => HttpResponse.error()));
    const user = userEvent.setup();
    startApp('/pacientes');

    expect(await screen.findByRole('alert')).toHaveTextContent(es.session.unavailable);
    server.use(http.post(REFRESH, () => HttpResponse.json(portalSessionBody())));
    await user.click(screen.getByRole('button', { name: es.session.retry }));

    expect(
      await screen.findByRole('heading', { level: 1, name: es.patients.title }),
    ).toBeInTheDocument();
  });

  it('boot_withResponseOutsideTheContract_isUnavailable', async () => {
    server.use(http.post(REFRESH, () => HttpResponse.json({ accessToken: '' })));
    startApp('/pacientes');

    expect(await screen.findByRole('alert')).toHaveTextContent(es.session.unavailable);
  });

  it('signOut_callsTheServerAndReturnsToLogin', async () => {
    const logout = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(
      http.post(REFRESH, () => HttpResponse.json(portalSessionBody())),
      http.post(LOGOUT, logout),
    );
    const user = userEvent.setup();
    const { router } = startApp('/pacientes');

    await user.click(await screen.findByRole('button', { name: es.session.logout }));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('signOutInAnotherTab_sendsThisTabToLogin', async () => {
    server.use(http.post(REFRESH, () => HttpResponse.json(portalSessionBody())));
    const { router } = startApp('/pacientes');
    await screen.findByRole('heading', { level: 1, name: es.patients.title });
    const otherTab = new BroadcastCrossTabChannel();

    otherTab.publish({ type: 'signed-out', at: Date.now() });

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    otherTab.close();
  });

  // CP021 part B, step 8: after 15 idle minutes the portal signs out and explains why.
  it('inactivity_warnsAt13AndSignsOutAt15WithTheReason', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const logout = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(
      http.post(REFRESH, () => HttpResponse.json(portalSessionBody())),
      http.post(LOGOUT, logout),
    );
    const { router } = startApp('/pacientes');
    await screen.findByRole('heading', { level: 1, name: es.patients.title });

    await act(() => vi.advanceTimersByTimeAsync(13 * MINUTE));
    expect(screen.getByRole('dialog', { name: es.idle.title })).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(2 * MINUTE));

    expect(await screen.findByRole('status')).toHaveTextContent(es.session.idleClosed);
    expect(router.state.location.pathname).toBe('/login');
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
