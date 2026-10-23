import { expect, test } from '@playwright/test';

import { es } from '../../src/shared/presentation/i18n/es';
import { requiredEnv } from '../support/env';
import { FORM_REJECTED_INPUT, signIn } from '../support/login';

// CP017: every rejected sign-in shows the same message. Only smoke accounts are used, never CP accounts.
requiredEnv('PORTAL_BASE_URL');

const cases = [
  ['patient account', 'SMOKE_PATIENT_EMAIL', 'SMOKE_PATIENT_PASSWORD'],
  ['inactive account', 'SMOKE_INACTIVE_EMAIL', 'SMOKE_INACTIVE_PASSWORD'],
  ['account pending activation', 'SMOKE_PENDING_EMAIL', 'SMOKE_PENDING_PASSWORD'],
] as const;

for (const [name, emailVariable, passwordVariable] of cases) {
  test(`cp017_${name}_showsTheSingleRejection`, async ({ page }) => {
    await signIn(page, requiredEnv(emailVariable), requiredEnv(passwordVariable));

    await expect(page.getByRole('alert')).toHaveText(es.login.rejected);
    await expect(page).toHaveURL(/\/login$/);
  });
}

// Keycloak counts failed passwords, so a wrong one is tried once per run and only on the smoke account.
test('cp017_wrongPassword_showsTheSingleRejection', async ({ page }) => {
  const email = requiredEnv('SMOKE_NUTRITIONIST_EMAIL');
  const wrong = `${requiredEnv('SMOKE_NUTRITIONIST_PASSWORD')}-wrong`;

  // The wrong password derives from the real one, so a failure here never carries the original error.
  try {
    await signIn(page, email, wrong);
  } catch {
    throw new Error(FORM_REJECTED_INPUT);
  }

  await expect(page.getByRole('alert')).toHaveText(es.login.rejected);
  await expect(page).toHaveURL(/\/login$/);
});
