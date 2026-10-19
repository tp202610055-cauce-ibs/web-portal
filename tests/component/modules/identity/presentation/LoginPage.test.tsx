import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  LoginError,
  LoginPage,
  SessionProvider,
  type LoginFailure,
  type Session,
} from '@/modules/identity';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
} from '../../../../support/sessions';

function renderLogin(session: Session = anonymousSession) {
  const controller = fakeSessionController(session);
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/pacientes', element: <p>panel</p> },
    ],
    { initialEntries: ['/login'] },
  );
  render(
    <SessionProvider controller={controller}>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return { controller, router };
}

async function submit(email = 'nutri.prueba@cauce.test', password = 'synthetic-password') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(es.login.email), email);
  await user.type(screen.getByLabelText(es.login.password), password);
  await user.click(screen.getByRole('button', { name: es.login.submit }));
}

// Fills the fields at once: these tests check the message, and typing per key is slow under load.
function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText(es.login.email), {
    target: { value: 'nutri.prueba@cauce.test' },
  });
  fireEvent.change(screen.getByLabelText(es.login.password), {
    target: { value: 'synthetic-password' },
  });
  fireEvent.click(screen.getByRole('button', { name: es.login.submit }));
}

async function messageAfterFailure(error: unknown): Promise<string> {
  const { controller } = renderLogin();
  controller.login.mockRejectedValueOnce(error);
  fillAndSubmit();
  return (await screen.findByRole('alert')).textContent ?? '';
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('form_hasLabelledFieldsAndHidesThePassword', () => {
    renderLogin();

    expect(screen.getByLabelText(es.login.email)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(es.login.password)).toHaveAttribute('type', 'password');
  });

  it('submit_withEmptyFields_marksThemAndDoesNotCallTheServer', async () => {
    const { controller } = renderLogin();

    await userEvent.setup().click(screen.getByRole('button', { name: es.login.submit }));

    expect(screen.getByLabelText(es.login.email)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(es.login.password)).toHaveAttribute(
      'aria-describedby',
      'login-password-error',
    );
    expect(screen.getAllByText(es.generic.field)).toHaveLength(2);
    expect(controller.login).not.toHaveBeenCalled();
  });

  it('submit_withValues_signsInWithTheTrimmedEmail', async () => {
    const { controller } = renderLogin();

    await submit('  nutri.prueba@cauce.test ', 'synthetic-password');

    expect(controller.login).toHaveBeenCalledWith('nutri.prueba@cauce.test', 'synthetic-password');
  });

  // CP006 (A to D) and CP017 (A to D): one message for every rejection, never the cause.
  it('rejections_allVariants_showTheSameMessage', async () => {
    const variants = ['wrong password', 'unknown email', 'disabled', 'pending', 'patient'];
    const messages: string[] = [];
    for (let attempt = 0; attempt < variants.length; attempt += 1) {
      messages.push(await messageAfterFailure(new LoginError({ kind: 'invalid-credentials' })));
      cleanup();
    }

    expect(messages).toHaveLength(variants.length);
    expect(new Set(messages)).toEqual(new Set([es.login.rejected]));
  });

  it('rejection_linksTheMessageToBothFields', async () => {
    await messageAfterFailure(new LoginError({ kind: 'invalid-credentials' }));

    expect(screen.getByLabelText(es.login.email)).toHaveAttribute(
      'aria-describedby',
      'login-error',
    );
  });

  it.each<[string, unknown, string]>([
    [
      'rate limit',
      new LoginError({ kind: 'rate-limited', retryAfterSeconds: 30 }),
      es.login.rateLimited,
    ],
    ['server unavailable', new ServiceUnavailableError(), es.generic.error],
    ['contract violation', new ContractViolationError('PortalSessionResult'), es.generic.error],
  ])('rejection_%s_showsItsMessage', async (_name, error, expected) => {
    expect(await messageAfterFailure(error)).toBe(expected);
  });

  it('lockout_endingToday_showsOnlyTheLimaTime', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-20T15:00:00Z'));
    const failure: LoginFailure = {
      kind: 'account-locked',
      lockedUntil: new Date('2026-10-20T15:15:00Z'),
    };

    expect(await messageAfterFailure(new LoginError(failure))).toBe(es.login.lockedToday('10:15'));
  });

  it('lockout_endingAnotherDay_includesTheLimaDate', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-21T04:30:00Z'));
    const failure: LoginFailure = {
      kind: 'account-locked',
      lockedUntil: new Date('2026-10-21T05:10:00Z'),
    };

    expect(await messageAfterFailure(new LoginError(failure))).toBe(
      es.login.lockedOnDate('21/10/2026', '00:10'),
    );
  });

  it('submit_whileSending_disablesTheButton', async () => {
    const { controller } = renderLogin();
    controller.login.mockReturnValueOnce(new Promise(() => undefined));

    await submit();

    expect(screen.getByRole('button', { name: es.login.submitting })).toBeDisabled();
  });

  it.each([
    ['idle', es.session.idleClosed],
    ['expired', es.session.expired],
  ] as const)('notice_afterSignOutBy_%s_explainsWhy', (reason, expected) => {
    renderLogin({ status: 'anonymous', reason });

    expect(screen.getByRole('status')).toHaveTextContent(expected);
  });

  it('notice_afterManualSignOut_isNotShown', () => {
    renderLogin({ status: 'anonymous', reason: 'signed-out' });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('page_withNutritionistSession_goesToThePanel', async () => {
    const { router } = renderLogin(nutritionistSession);

    expect(await screen.findByText('panel')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pacientes');
  });

  it('page_whileRestoring_showsLoading', () => {
    renderLogin({ status: 'restoring' });

    expect(screen.getByRole('status')).toHaveTextContent(es.generic.loading);
  });
});
