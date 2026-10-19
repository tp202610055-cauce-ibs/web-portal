import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server';

// Vitest's jsdom environment replaces AbortSignal while Request stays Node's, which rejects that signal.
// Only the foreign signal is dropped; review this when upgrading vitest or jsdom.
const NodeRequest = globalThis.Request;

function acceptedByNode(signal: AbortSignal): boolean {
  try {
    new NodeRequest('http://localhost/', { signal });
    return true;
  } catch {
    return false;
  }
}

globalThis.Request = class extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const foreignSignal = init?.signal != null && !acceptedByNode(init.signal);
    super(input, foreignSignal ? { ...init, signal: null } : init);
  }
};

// Any request without a handler fails the test, so no test can reach a real backend.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
