import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = join(ROOT, 'openapi');
const OUTPUT = join(ROOT, 'src', 'shared', 'infrastructure', 'api', 'generated', 'schema.d.ts');
const SPEC_NAME = /^openapi-v\d+\.\d+\.\d+\.json$/;

const toLf = (text) => text.replace(/\r\n/g, '\n');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function findSpec() {
  const specs = readdirSync(SPEC_DIR).filter((name) => SPEC_NAME.test(name));
  if (specs.length !== 1) {
    fail(`Expected exactly one openapi-vX.Y.Z.json in openapi/, found ${specs.length}.`);
  }
  return specs[0];
}

// The hash is computed over LF content, so a CRLF checkout on Windows yields the same value.
async function render(specName) {
  const spec = toLf(readFileSync(join(SPEC_DIR, specName), 'utf8'));
  const hash = createHash('sha256').update(spec, 'utf8').digest('hex');
  const ast = await openapiTS(spec, { propertiesRequiredByDefault: true });
  const header =
    `// Generated from openapi/${specName} (sha256 ${hash}) by npm run api:generate.\n` +
    '// Do not edit by hand.\n';
  return header + toLf(astToString(ast));
}

const mode = process.argv[2];
if (mode !== 'generate' && mode !== 'check') {
  fail('Usage: node scripts/api.mjs generate|check');
}

const specName = findSpec();
const expected = await render(specName);

if (mode === 'generate') {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, expected, 'utf8');
  console.log(`schema.d.ts generated from openapi/${specName}.`);
} else {
  let current;
  try {
    current = toLf(readFileSync(OUTPUT, 'utf8'));
  } catch {
    fail('schema.d.ts is missing: run npm run api:generate.');
  }
  if (current !== expected) {
    fail('schema.d.ts is out of date with the vendored contract: run npm run api:generate.');
  }
  console.log(`schema.d.ts matches openapi/${specName}.`);
}
