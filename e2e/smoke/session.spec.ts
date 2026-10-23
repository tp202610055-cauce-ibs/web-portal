import { expect, test } from '@playwright/test';

import { es } from '../../src/shared/presentation/i18n/es';
import { requiredEnv } from '../support/env';
import { signIn } from '../support/login';

// Deployed smoke: read-only navigation with the smoke nutritionist; it never approves or edits anything.
requiredEnv('PORTAL_BASE_URL');
const EMAIL = requiredEnv('SMOKE_NUTRITIONIST_EMAIL');
const PASSWORD = requiredEnv('SMOKE_NUTRITIONIST_PASSWORD');

const REFRESH_COOKIE = 'cauce_portal_rt';
const REFRESH_PATH = '/api/v1/auth/portal';

test('session_signInKeepRenewAndSignOut', async ({ page, context }) => {
  await test.step('sign in lands on the panel', async () => {
    await signIn(page, EMAIL, PASSWORD);
    await expect(page.getByRole('heading', { level: 1, name: es.patients.title })).toBeVisible();
    await expect(page).toHaveURL(/\/pacientes$/);
  });

  await test.step('the refresh cookie is HttpOnly, Secure, Strict and scoped to its path', async () => {
    // Only the flags are compared, so a failure never prints the token value.
    const cookie = (await context.cookies()).find((item) => item.name === REFRESH_COOKIE);
    const flags =
      cookie === undefined
        ? null
        : {
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            path: cookie.path,
          };
    expect(flags).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: REFRESH_PATH,
    });
  });

  await test.step('reloading keeps the session', async () => {
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: es.patients.title })).toBeVisible();
  });

  await test.step('a second tab starts signed in', async () => {
    const second = await context.newPage();
    await second.goto('/pacientes');
    await expect(second.getByRole('heading', { level: 1, name: es.patients.title })).toBeVisible();
    await second.close();
  });

  await test.step('a deep route reloads into its own screen', async () => {
    await page.goto('/revisiones');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: es.reviews.title })).toBeVisible();
  });

  await test.step('sign out removes the cookie and a later refresh is refused', async () => {
    await page.getByRole('button', { name: es.session.logout }).click();
    await expect(page.getByRole('heading', { name: es.login.title })).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.some((item) => item.name === REFRESH_COOKIE)).toBe(false);
    const refresh = await page.request.post(`${REFRESH_PATH}/refresh`, {
      headers: { 'X-Cauce-Portal': '1' },
    });
    expect(refresh.status()).toBe(401);
  });
});
