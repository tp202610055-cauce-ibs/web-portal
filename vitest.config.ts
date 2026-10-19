import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/shared/infrastructure/api/generated/**',
          'src/app/main.tsx',
          'src/**/*.d.ts',
          'src/**/index.ts',
        ],
        reporter: ['text', 'html'],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  }),
);
