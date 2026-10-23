import { expect, test, type Page } from '@playwright/test';

import { es } from '../../src/shared/presentation/i18n/es';
import { requiredEnv } from '../support/env';
import { mockPortalApi, PENDING_ID, RECORD_PATIENT_ID } from './portalApi';

// Runs against the portal image started locally (PORTAL_BASE_URL) with its PORTAL_FILES_ORIGIN.
requiredEnv('PORTAL_BASE_URL');
const FILES_ORIGIN = requiredEnv('PORTAL_FILES_ORIGIN');

const CSP =
  "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; " +
  `connect-src 'self' ${FILES_ORIGIN}; base-uri 'none'; form-action 'self'; ` +
  "frame-ancestors 'none'; object-src 'none'";

const SERVICE_PATHS = [
  '/api',
  '/api/v1/health',
  '/realms/cauce',
  '/resources/x',
  '/mail',
  '/mail/',
  '/admin',
  '/admin/master/console',
];

function expectSecurityHeaders(headers: Record<string, string>) {
  expect(headers['content-security-policy']).toBe(CSP);
  expect(headers['referrer-policy']).toBe('no-referrer');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['permissions-policy']).toContain('camera=()');
}

// Collects CSP violations from the page event and from the console, which Chromium also uses.
async function watchCsp(page: Page): Promise<() => Promise<string[]>> {
  const fromConsole: string[] = [];
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) {
      fromConsole.push(message.text());
    }
  });
  await page.addInitScript(() => {
    const store = window as unknown as { cspViolations: string[] };
    store.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      store.cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return async () => [
    ...fromConsole,
    ...(await page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    )),
  ];
}

async function fontsLoaded(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((font) => font.status === 'loaded');
  });
}

test.describe('portal image: headers and caching', () => {
  test('shell_carriesTheSecurityHeadersAndIsRevalidated', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);
    expectSecurityHeaders(response.headers());
    expect(response.headers()['cache-control']).toBe('no-cache');
  });

  test('deepRoute_loadsTheShell', async ({ request }) => {
    const response = await request.get(`/pacientes/${RECORD_PATIENT_ID}`);

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('<div id="root"></div>');
    expect(response.headers()['cache-control']).toBe('no-cache');
  });

  test('hashedAssets_areImmutableAndCompressed', async ({ request }) => {
    const shell = await (await request.get('/')).text();
    const assets = [...shell.matchAll(/\/assets\/[^"]+\.(?:js|css)/g)].map((match) => match[0]);

    expect(assets).toHaveLength(2);
    for (const asset of assets) {
      const response = await request.get(asset, { headers: { 'Accept-Encoding': 'gzip' } });
      expect(response.status()).toBe(200);
      expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
      expect(response.headers()['content-encoding']).toBe('gzip');
      expectSecurityHeaders(response.headers());
    }
  });

  test('missingAsset_isA404ThatIsNeverCached', async ({ request }) => {
    for (const path of ['/assets/missing.js', '/assets/']) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
      expect(response.headers()['cache-control']).toBeUndefined();
      expectSecurityHeaders(response.headers());
    }
  });

  test('servicePaths_areA404NeverTheShell', async ({ request }) => {
    for (const path of SERVICE_PATHS) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(404);
      expect(await response.text(), path).not.toContain('<div id="root">');
      expectSecurityHeaders(response.headers());
    }
  });

  test('healthz_answersOkWithoutCaching', async ({ request }) => {
    const response = await request.get('/healthz');

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe('ok\n');
    expect(response.headers()['cache-control']).toBe('no-store');
  });
});

// Each screen loads only same-origin script, style and font; the API is simulated in the browser.
test.describe('portal image: no CSP violations', () => {
  test('login_rendersWithoutViolations', async ({ page }) => {
    const violations = await watchCsp(page);
    const unexpected = await mockPortalApi(page, false);

    await page.goto('/login');

    await expect(page.getByRole('heading', { name: es.login.title })).toBeVisible();
    expect(await fontsLoaded(page)).toBe(true);
    expect(await violations()).toEqual([]);
    expect(unexpected).toEqual([]);
  });

  test('panel_rendersWithoutViolations', async ({ page }) => {
    const violations = await watchCsp(page);
    const unexpected = await mockPortalApi(page, true);

    await page.goto('/pacientes');

    await expect(page.getByRole('heading', { level: 1, name: es.patients.title })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Paciente Prueba A' })).toBeVisible();
    expect(await violations()).toEqual([]);
    expect(unexpected).toEqual([]);
  });

  test('recordChart_rendersWithoutViolations', async ({ page }) => {
    const violations = await watchCsp(page);
    const unexpected = await mockPortalApi(page, true);

    await page.goto(`/pacientes/${RECORD_PATIENT_ID}`);
    await page.getByRole('tab', { name: es.recordTabs.evolution }).click();

    await expect(page.getByRole('img', { name: es.evolution.chartTitle })).toBeVisible();
    expect(await violations()).toEqual([]);
    expect(unexpected).toEqual([]);
  });

  test('modifyEditor_rendersWithoutViolations', async ({ page }) => {
    const violations = await watchCsp(page);
    const unexpected = await mockPortalApi(page, true);

    await page.goto(`/recomendaciones/${PENDING_ID}`);
    await page.getByRole('button', { name: es.decision.modify }).click();
    await page.getByRole('searchbox', { name: es.editor.addFood }).fill('lác');

    await expect(page.getByRole('heading', { name: es.editor.title })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lácteos con lactosa/ })).toBeVisible();
    expect(await violations()).toEqual([]);
    expect(unexpected).toEqual([]);
  });
});
