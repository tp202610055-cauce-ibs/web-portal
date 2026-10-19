import type { RequestHandler } from 'msw';

// Contract handlers; each block adds the endpoints it consumes, typed with the generated schema.
export const handlers: RequestHandler[] = [];
