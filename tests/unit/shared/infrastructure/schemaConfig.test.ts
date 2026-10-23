import '@/shared/infrastructure/schemaConfig';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Under the portal CSP any use of Function is a violation, even when Zod catches it.
describe('schemaConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('config_isJitless', () => {
    expect(z.config().jitless).toBe(true);
  });

  it('objectSchema_isBuiltAndUsedWithoutFunction', () => {
    const functionSpy = vi.spyOn(globalThis, 'Function');

    const schema = z.object({ id: z.string().min(1), score: z.number().int() });
    const accepted = schema.safeParse({ id: 'a1', score: 245 });
    const refused = schema.safeParse({ id: '', score: 24.5 });

    expect(accepted.success).toBe(true);
    expect(refused.success).toBe(false);
    expect(functionSpy).not.toHaveBeenCalled();
  });
});
