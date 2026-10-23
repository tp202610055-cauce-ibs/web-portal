import { z } from 'zod';

// The portal CSP forbids eval. Zod probes new Function when each object schema is built, so this must
// run before any module defines a schema: main.tsx imports this file first.
z.config({ jitless: true });
