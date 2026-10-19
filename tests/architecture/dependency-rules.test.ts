// @vitest-environment node
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Lints virtual files with the real eslint.config.js; the paths decide which layer rules apply.
const eslint = new ESLint({ cwd: process.cwd() });

async function ruleIds(code: string, filePath: string): Promise<(string | null)[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result?.messages.map((message) => message.ruleId) ?? [];
}

const forbidden: [string, string, string, string][] = [
  [
    'domain importing react',
    "import react from 'react';\nexport { react };\n",
    'src/modules/patients/domain/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'application importing infrastructure',
    "import { HttpPortalAuthGateway } from '@/modules/identity/infrastructure/HttpPortalAuthGateway';\nexport { HttpPortalAuthGateway };\n",
    'src/modules/identity/application/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'presentation importing infrastructure',
    "import { HttpPortalAuthGateway } from '@/modules/identity/infrastructure/HttpPortalAuthGateway';\nexport { HttpPortalAuthGateway };\n",
    'src/modules/identity/presentation/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'deep import into another module',
    "import { PatientsPage } from '@/modules/patients/presentation/PatientsPage';\nexport { PatientsPage };\n",
    'src/modules/identity/presentation/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'domain importing another module',
    "import { PatientsPage } from '@/modules/patients';\nexport { PatientsPage };\n",
    'src/modules/identity/domain/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'shared importing a module',
    "import { LoginPage } from '@/modules/identity';\nexport { LoginPage };\n",
    'src/shared/presentation/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'parent relative import',
    "import { NUTRITIONIST_ROLE } from '../domain/Session';\nexport { NUTRITIONIST_ROLE };\n",
    'src/modules/identity/presentation/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'app importing a module internal',
    "import { LoginPage } from '@/modules/identity/presentation/LoginPage';\nexport { LoginPage };\n",
    'src/app/Probe.ts',
    'no-restricted-imports',
  ],
  [
    'dynamic import',
    "export const load = () => import('@/modules/patients');\n",
    'src/modules/identity/presentation/Probe.ts',
    'no-restricted-syntax',
  ],
  [
    'browser storage',
    "export const read = () => localStorage.getItem('key');\n",
    'src/modules/identity/infrastructure/Probe.ts',
    'no-restricted-globals',
  ],
];

describe('dependency rules', () => {
  it.each(forbidden)('rejects %s', async (_name, code, filePath, rule) => {
    expect(await ruleIds(code, filePath)).toContain(rule);
  });

  it('accepts inner layers and another module index from presentation', async () => {
    const code =
      "import type { SessionReader } from '@/modules/identity/application/SessionReader';\n" +
      "import { PatientsPage } from '@/modules/patients';\n" +
      'export type { SessionReader };\nexport { PatientsPage };\n';

    expect(await ruleIds(code, 'src/modules/identity/presentation/Probe.ts')).toEqual([]);
  });
});
