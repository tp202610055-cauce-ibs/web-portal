import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createAppDependencies } from '@/app/composition';
import { es } from '@/shared/presentation/i18n/es';

import { renderApp, testDependencies } from '../../support/renderApp';
import {
  anonymousSession,
  fakeSessionReader,
  nutritionistSession,
  patientSession,
} from '../../support/sessions';

const withSession = (session: Parameters<typeof fakeSessionReader>[0]) =>
  testDependencies(fakeSessionReader(session));

describe('routing from the root', () => {
  it('root_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp('/', withSession(anonymousSession));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('root_withNutritionistSession_redirectsToPatients', async () => {
    const { router } = renderApp('/', withSession(nutritionistSession));

    expect(
      await screen.findByRole('heading', { level: 1, name: es.patients.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pacientes');
  });

  it('menuLink_withNutritionistSession_opensPatients', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/', withSession(nutritionistSession));
    const menu = await screen.findByRole('navigation', { name: es.nav.label });
    const link = screen.getByRole('link', { name: es.nav.patients });

    await user.click(link);

    expect(menu).toContainElement(link);
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(router.state.location.pathname).toBe('/pacientes');
  });

  it('patients_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp('/pacientes', withSession(anonymousSession));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('patients_withAnotherRole_redirectsToLogin', async () => {
    const { router } = renderApp('/pacientes', withSession(patientSession));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('unknownRoute_anySession_showsNotFound', async () => {
    renderApp('/ruta-inexistente', withSession(anonymousSession));

    expect(await screen.findByRole('heading', { name: es.notFound.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.notFound.back })).toHaveAttribute('href', '/');
  });

  it('root_withProductionComposition_showsLogin', async () => {
    const { router } = renderApp('/', createAppDependencies());

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
