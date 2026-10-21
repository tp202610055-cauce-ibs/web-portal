import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { Session } from '@/modules/identity';
import { es } from '@/shared/presentation/i18n/es';

import { renderApp, testDependencies } from '../../support/renderApp';
import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
  patientSession,
} from '../../support/sessions';

const withSession = (session: Session) => testDependencies(fakeSessionController(session));

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

  // CP016 step 6: the menu shows only nutritionist entries, no administration.
  it('menu_withNutritionistSession_hasOnlyTheExistingNutritionistEntries', async () => {
    renderApp('/pacientes', withSession(nutritionistSession));
    const menu = await screen.findByRole('navigation', { name: es.nav.label });

    expect(Array.from(menu.querySelectorAll('a')).map((link) => link.textContent)).toEqual([
      es.nav.patients,
      es.nav.management,
      es.nav.reviews,
    ]);
  });

  // CP052 step 2: patient management is reached from the menu.
  it('managementMenuEntry_withNutritionistSession_opensPatientManagement', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/pacientes', withSession(nutritionistSession));

    await user.click(await screen.findByRole('link', { name: es.nav.management }));

    expect(
      await screen.findByRole('heading', { level: 1, name: es.management.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: es.invitations.generate })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/gestion-pacientes');
  });

  // CP050 step 7: the empty panel leads to patient management.
  it('emptyPanelLink_opensPatientManagement', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/pacientes', withSession(nutritionistSession));

    await user.click(await screen.findByRole('link', { name: es.management.goToManagement }));

    expect(router.state.location.pathname).toBe('/gestion-pacientes');
    expect(screen.getByRole('button', { name: es.invitations.generate })).toBeInTheDocument();
  });

  it('management_withoutSession_redirectsToLogin', async () => {
    const { router } = renderApp('/gestion-pacientes', withSession(anonymousSession));

    expect(await screen.findByRole('heading', { name: es.login.title })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('topBar_withNutritionistSession_showsTheNameAndSignOut', async () => {
    renderApp('/pacientes', withSession(nutritionistSession));

    expect(await screen.findByText('Nutricionista Prueba')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: es.session.logout })).toBeInTheDocument();
  });

  it('signOutButton_fromTheTopBar_asksTheSessionToSignOut', async () => {
    const user = userEvent.setup();
    const session = fakeSessionController(nutritionistSession);
    renderApp('/pacientes', testDependencies(session));

    await user.click(await screen.findByRole('button', { name: es.session.logout }));

    expect(session.logout).toHaveBeenCalledTimes(1);
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

  it('patients_whileRestoring_showsLoadingWithoutRedirecting', async () => {
    const { router } = renderApp('/pacientes', withSession({ status: 'restoring' }));

    expect(await screen.findByRole('status')).toHaveTextContent(es.generic.loading);
    expect(router.state.location.pathname).toBe('/pacientes');
  });

  it('patients_whenUnavailable_offersRetry', async () => {
    const user = userEvent.setup();
    const session = fakeSessionController({ status: 'unavailable' });
    renderApp('/pacientes', testDependencies(session));

    expect(await screen.findByRole('alert')).toHaveTextContent(es.session.unavailable);
    await user.click(screen.getByRole('button', { name: es.session.retry }));

    expect(session.start).toHaveBeenCalledTimes(1);
  });

  it('unknownRoute_anySession_showsNotFound', async () => {
    renderApp('/ruta-inexistente', withSession(anonymousSession));

    expect(await screen.findByRole('heading', { name: es.notFound.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.notFound.back })).toHaveAttribute('href', '/');
  });
});
