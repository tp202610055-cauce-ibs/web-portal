import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { createAppDependencies, type AppComposition } from '@/app/composition';
import { es } from '@/shared/presentation/i18n/es';

import { server } from '../../msw/server';
import { cp049Panel } from '../../support/patients';
import { portalSessionBody } from '../../support/portalSession';
import { renderApp } from '../../support/renderApp';

const REFRESH = '*/api/v1/auth/portal/refresh';
const PATIENTS = '*/api/v1/nutritionists/me/patients';

// Production composition from the root: real session, API client and gateway, backend in MSW.
describe('triage panel from the root', () => {
  let app: AppComposition | null = null;

  afterEach(() => {
    app?.sessionService.dispose();
    app = null;
  });

  async function openLoadedPanel() {
    server.use(
      http.post(REFRESH, () => HttpResponse.json(portalSessionBody())),
      http.get(PATIENTS, () => HttpResponse.json(cp049Panel)),
    );
    app = createAppDependencies();
    void app.sessionService.start();
    renderApp('/pacientes', app);
    expect(await screen.findByRole('table')).toBeInTheDocument();
    return app;
  }

  function expectSessionIntact(current: AppComposition) {
    expect(current.sessionService.current().status).toBe('authenticated');
    expect(screen.getByRole('navigation', { name: es.nav.label })).toBeInTheDocument();
    expect(screen.getByText('Nutricionista Prueba')).toBeInTheDocument();
  }

  // CP051 variants A (no connection) and B (service down), starting from a loaded list.
  it.each([
    ['network failure', () => HttpResponse.error()],
    ['server error', () => new HttpResponse(null, { status: 503 })],
  ])(
    'menuEntry_withLoadedListAnd%s_replacesTheListWithTheErrorAndRecovers',
    async (_name, failure) => {
      const user = userEvent.setup();
      const current = await openLoadedPanel();
      server.use(http.get(PATIENTS, failure));

      await user.click(screen.getByRole('link', { name: es.nav.patients }));

      expect(await screen.findByRole('alert')).toHaveTextContent(es.patients.loadError);
      expect(screen.queryByRole('table')).toBeNull();
      expectSessionIntact(current);

      server.use(http.get(PATIENTS, () => HttpResponse.json(cp049Panel)));
      await user.click(screen.getByRole('button', { name: es.patients.retry }));

      expect(await screen.findByRole('table')).toBeInTheDocument();
    },
  );

  // CP051 with an expired token: the renewal fails by network, the panel errs, the session stays.
  it('menuEntry_whenRenewalFailsByNetwork_showsTheErrorAndKeepsTheSession', async () => {
    const user = userEvent.setup();
    const current = await openLoadedPanel();
    server.use(
      http.get(PATIENTS, () => new HttpResponse(null, { status: 401 })),
      http.post(REFRESH, () => HttpResponse.error()),
    );

    await user.click(screen.getByRole('link', { name: es.nav.patients }));

    expect(await screen.findByRole('alert')).toHaveTextContent(es.patients.loadError);
    expectSessionIntact(current);
  });
});
