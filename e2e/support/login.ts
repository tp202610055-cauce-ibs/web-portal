import type { Page } from '@playwright/test';

import { es } from '../../src/shared/presentation/i18n/es';

// A failed fill prints the typed value in its call log, so the original error is dropped on purpose.
export const FORM_REJECTED_INPUT = 'the sign-in form did not accept the input';

// Signs in through the real form, as the nutritionist does.
export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  try {
    await page.getByLabel(es.login.email, { exact: true }).fill(email);
    await page.getByLabel(es.login.password, { exact: true }).fill(password);
    await page.getByRole('button', { name: es.login.submit }).click();
  } catch {
    throw new Error(FORM_REJECTED_INPUT);
  }
}
