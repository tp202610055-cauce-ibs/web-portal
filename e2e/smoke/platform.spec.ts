import { expect, test } from '@playwright/test';

import { requiredEnv } from '../support/env';

// Deployed smoke of the outer proxy and the portal image; no account is used here.
requiredEnv('PORTAL_BASE_URL');

test('shell_carriesCspAndOneWeekHsts', async ({ request }) => {
  const response = await request.get('/');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
  expect(response.headers()['strict-transport-security']).toBe('max-age=604800');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
});

test('realmCauce_answersThroughTheProxy', async ({ request }) => {
  const response = await request.get('/realms/cauce');

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ realm: 'cauce' });
});

// /api/v1/admin is refused by the D-1 Caddyfile, not by deploy/caddy; both answers are checked here.
for (const path of [
  '/admin',
  '/admin/master/console/',
  '/realms/master',
  '/api/v1/admin/nutritionists',
]) {
  test(`privatePath_${path}_isA404FromTheInternet`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });

    expect(response.status()).toBe(404);
  });
}

test('mail_redirectsToItsRootAndAsksForCredentials', async ({ request }) => {
  const bare = await request.get('/mail', { maxRedirects: 0 });
  expect(bare.status()).toBe(308);
  expect(bare.headers()['location']).toBe('/mail/');

  const root = await request.get('/mail/', { maxRedirects: 0 });
  expect(root.status()).toBe(401);
});
