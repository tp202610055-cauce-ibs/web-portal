import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { PasswordResetGateway } from '@/modules/identity/application/PasswordResetGateway';
import { PasswordResetRefusedError } from '@/modules/identity/domain/PasswordReset';
import { ForgotPasswordPage } from '@/modules/identity/presentation/ForgotPasswordPage';
import { PasswordResetProvider } from '@/modules/identity/presentation/PasswordResetContext';
import { ResetPasswordPage } from '@/modules/identity/presentation/ResetPasswordPage';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

const text = es.passwordReset;

function fakeGateway(overrides: Partial<PasswordResetGateway> = {}): PasswordResetGateway {
  return {
    request: async () => undefined,
    validate: async () => undefined,
    confirm: async () => undefined,
    ...overrides,
  };
}

function renderAt(url: string, gateway: PasswordResetGateway) {
  const router = createMemoryRouter(
    [
      { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
      { path: '/auth/password-reset', element: <ResetPasswordPage /> },
      { path: '/login', element: <p>Login</p> },
    ],
    { initialEntries: [url] },
  );
  render(
    <PasswordResetProvider gateway={gateway}>
      <RouterProvider router={router} />
    </PasswordResetProvider>,
  );
  return router;
}

describe('ForgotPasswordPage', () => {
  // CP018 step 8: the same general confirmation, whether or not the email has an account.
  it('submittingAnEmail_showsTheGeneralConfirmation', async () => {
    const user = userEvent.setup();
    const request = vi.fn<PasswordResetGateway['request']>(async () => undefined);
    renderAt('/recuperar-contrasena', fakeGateway({ request }));

    await user.type(screen.getByLabelText(es.login.email), ' nutricionista.prueba@ejemplo.test ');
    await user.click(screen.getByRole('button', { name: text.submit }));

    expect(await screen.findByRole('status')).toHaveTextContent(text.sent);
    expect(request).toHaveBeenCalledWith('nutricionista.prueba@ejemplo.test');
  });

  it('emptyEmail_isNotSent', async () => {
    const user = userEvent.setup();
    const request = vi.fn<PasswordResetGateway['request']>();
    renderAt('/recuperar-contrasena', fakeGateway({ request }));

    await user.click(screen.getByRole('button', { name: text.submit }));

    expect(screen.getByText(es.generic.field)).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    [new PasswordResetRefusedError({ kind: 'rate-limited' }), es.login.rateLimited],
    [new PasswordResetRefusedError({ kind: 'invalid-email' }), es.generic.field],
    [new ServiceUnavailableError(), es.generic.error],
  ])('refusal_%#_showsItsMessage', async (error, message) => {
    const user = userEvent.setup();
    renderAt('/recuperar-contrasena', fakeGateway({ request: async () => Promise.reject(error) }));

    await user.type(screen.getByLabelText(es.login.email), 'a@b.test');
    await user.click(screen.getByRole('button', { name: text.submit }));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});

describe('ResetPasswordPage', () => {
  const URL = '/auth/password-reset?token=token-1';

  // Opening the link checks it first and, while valid, offers the new password form.
  it('validLink_savesTheNewPassword_andTakesTheTokenOutOfTheUrl', async () => {
    const user = userEvent.setup();
    const validate = vi.fn<PasswordResetGateway['validate']>(async () => undefined);
    const confirm = vi.fn<PasswordResetGateway['confirm']>(async () => undefined);
    const router = renderAt(URL, fakeGateway({ validate, confirm }));

    await user.type(await screen.findByLabelText(text.newPassword), 'Portal#2026');
    await user.type(screen.getByLabelText(text.confirmPassword), 'Portal#2026');
    await user.click(screen.getByRole('button', { name: text.save }));

    expect(await screen.findByText(text.done)).toBeInTheDocument();
    expect(validate).toHaveBeenCalledWith('token-1');
    expect(confirm).toHaveBeenCalledWith('token-1', 'Portal#2026');
    expect(router.state.location.search).toBe('');
    await user.click(screen.getByRole('link', { name: text.goToLogin }));
    expect(router.state.location.pathname).toBe('/login');
  });

  // CP079 step 4 and HU0007: a used or expired link says so and offers a new request.
  it('invalidLink_saysItIsNoLongerValid', async () => {
    renderAt(
      URL,
      fakeGateway({
        validate: async () => {
          throw new PasswordResetRefusedError({ kind: 'invalid-link' });
        },
      }),
    );

    expect(await screen.findByText(text.invalidLink)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: text.requestNew })).toBeInTheDocument();
    expect(screen.queryByLabelText(text.newPassword)).not.toBeInTheDocument();
  });

  it('withoutToken_isAnInvalidLinkWithoutAskingTheServer', async () => {
    const validate = vi.fn<PasswordResetGateway['validate']>();
    renderAt('/auth/password-reset', fakeGateway({ validate }));

    expect(await screen.findByText(text.invalidLink)).toBeInTheDocument();
    expect(validate).not.toHaveBeenCalled();
  });

  it('differentPasswords_areNotSent', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn<PasswordResetGateway['confirm']>();
    renderAt(URL, fakeGateway({ confirm }));

    await user.type(await screen.findByLabelText(text.newPassword), 'Portal#2026');
    await user.type(screen.getByLabelText(text.confirmPassword), 'Portal#2027');
    await user.click(screen.getByRole('button', { name: text.save }));

    expect(screen.getByText(text.mismatch)).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('weakPassword_showsTheServerMessages', async () => {
    const user = userEvent.setup();
    renderAt(
      URL,
      fakeGateway({
        confirm: async () => {
          throw new PasswordResetRefusedError({
            kind: 'invalid-password',
            messages: ['Debe tener 8 caracteres.'],
          });
        },
      }),
    );

    await user.type(await screen.findByLabelText(text.newPassword), 'corta');
    await user.type(screen.getByLabelText(text.confirmPassword), 'corta');
    await user.click(screen.getByRole('button', { name: text.save }));

    expect(await screen.findByText('Debe tener 8 caracteres.')).toBeInTheDocument();
  });

  it('linkExpiredWhileTyping_switchesToTheInvalidLinkNotice', async () => {
    const user = userEvent.setup();
    renderAt(
      URL,
      fakeGateway({
        confirm: async () => {
          throw new PasswordResetRefusedError({ kind: 'invalid-link' });
        },
      }),
    );

    await user.type(await screen.findByLabelText(text.newPassword), 'Portal#2026');
    await user.type(screen.getByLabelText(text.confirmPassword), 'Portal#2026');
    await user.click(screen.getByRole('button', { name: text.save }));

    expect(await screen.findByText(text.invalidLink)).toBeInTheDocument();
  });

  it('checkFailure_offersARetry', async () => {
    const user = userEvent.setup();
    const validate = vi
      .fn<PasswordResetGateway['validate']>()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(undefined);
    renderAt(URL, fakeGateway({ validate }));

    await user.click(await screen.findByRole('button', { name: es.session.retry }));

    expect(await screen.findByLabelText(text.newPassword)).toBeInTheDocument();
  });
});
