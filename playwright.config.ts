import { existsSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

// Local settings for the smoke runs; variables already set in the shell keep their value.
const LOCAL_SETTINGS = '.env.smoke.local';
if (existsSync(LOCAL_SETTINGS)) {
  process.loadEnvFile(LOCAL_SETTINGS);
}

// Traces, videos and screenshots stay off: they would record what is typed, passwords included.
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PORTAL_BASE_URL,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    { name: 'image', testDir: 'e2e/image' },
    { name: 'smoke', testDir: 'e2e/smoke' },
  ],
});
