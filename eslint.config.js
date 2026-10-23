import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const MODULES = [
  'identity',
  'patients',
  'clinical-registry',
  'recommendations',
  'reports',
  'notifications',
];

// Dependencies point inward: each layer lists the layers it must not import.
const OUTER_LAYERS = {
  domain: ['application', 'infrastructure', 'presentation'],
  application: ['infrastructure', 'presentation'],
  infrastructure: ['presentation'],
  presentation: ['infrastructure'],
};

const UI_AND_IO = '^(react|react-dom|react-router|openapi-fetch|zod|msw)(/|$)|^@tanstack/';
const FORBIDDEN_LIBRARIES = {
  domain: UI_AND_IO,
  application: UI_AND_IO,
  infrastructure: '^(react|react-dom|react-router)(/|$)|^@tanstack/',
  presentation: '^(openapi-fetch|zod|msw)(/|$)',
};

const PARENT_IMPORT = {
  regex: '^\\.\\./',
  message: 'Outside the own folder, import with the @/ alias.',
};
const APP_IMPORT = { regex: '^@/app(/|$)', message: 'Only src/app wires the modules.' };

function layerPatterns(owner, layer) {
  return [
    {
      regex: `^@/(${owner}|shared)/(${OUTER_LAYERS[layer].join('|')})(/|$)`,
      message: `The ${layer} layer must not import an outer layer.`,
    },
    {
      regex: FORBIDDEN_LIBRARIES[layer],
      message: `This library is not allowed in the ${layer} layer.`,
    },
  ];
}

function modulePatterns(name, layer) {
  const patterns = [
    PARENT_IMPORT,
    APP_IMPORT,
    {
      regex: `^@/modules/(?!${name}/)[^/]+/`,
      message: 'Import another module only through its index.',
    },
    {
      regex: `^@/modules/${name}$`,
      message: 'Inside a module, import the file, not the module index.',
    },
    ...layerPatterns(`modules/${name}`, layer),
  ];
  if (layer !== 'presentation') {
    patterns.push({
      regex: `^@/modules/(?!${name}$)[^/]+$`,
      message: 'Only the presentation layer may use another module.',
    });
  }
  return patterns;
}

function sharedPatterns(layer) {
  return [
    PARENT_IMPORT,
    APP_IMPORT,
    { regex: '^@/modules(/|$)', message: 'Shared code must not depend on a module.' },
    ...layerPatterns('shared', layer),
  ];
}

const restrictImports = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const layerBlocks = Object.keys(OUTER_LAYERS).flatMap((layer) => [
  ...MODULES.map((name) => ({
    files: [`src/modules/${name}/${layer}/**/*.{ts,tsx}`],
    rules: restrictImports(modulePatterns(name, layer)),
  })),
  {
    files: [`src/shared/${layer}/**/*.{ts,tsx}`],
    rules: restrictImports(sharedPatterns(layer)),
  },
]);

export default defineConfig([
  globalIgnores(['dist/', 'coverage/', 'src/shared/infrastructure/api/generated/']),
  js.configs.recommended,
  tseslint.configs.strict,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', 'e2e/**/*.ts', 'playwright.config.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    // No clinical data or tokens in browser storage; no dynamic imports; no inline styles (CSP).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Browser storage is not allowed.' },
        { name: 'sessionStorage', message: 'Browser storage is not allowed.' },
        { name: 'indexedDB', message: 'Browser storage is not allowed.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: 'Browser storage is not allowed.' },
        {
          object: 'window',
          property: 'sessionStorage',
          message: 'Browser storage is not allowed.',
        },
        { object: 'window', property: 'indexedDB', message: 'Browser storage is not allowed.' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'ImportExpression', message: 'Dynamic imports are not allowed.' },
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'Inline styles break the CSP; use a stylesheet.',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: restrictImports([
      PARENT_IMPORT,
      { regex: '^@/modules/[^/]+/', message: 'The app imports each module through its index.' },
    ]),
  },
  ...layerBlocks,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
]);
