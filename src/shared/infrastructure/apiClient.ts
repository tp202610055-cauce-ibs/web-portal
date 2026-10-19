import createClient, { type Client } from 'openapi-fetch';

import type { TokenProvider } from '@/shared/application/TokenProvider';
import { readProblem } from '@/shared/infrastructure/problemReader';
import type { paths } from '@/shared/infrastructure/api/generated/schema';

export type ApiClient = Client<paths>;
export type FetchFunction = (request: Request) => Promise<Response>;

const PORTAL_SESSION_PATH = '/api/v1/auth/portal/';

interface ApiClientOptions {
  readonly baseUrl: string;
  readonly tokens: TokenProvider;
  readonly fetch?: FetchFunction;
}

export const globalFetch: FetchFunction = (request) => globalThis.fetch(request);

function withBearer(request: Request, token: string | null): Request {
  if (token !== null) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
}

// Adds the Bearer and, after a 401 without errorCode, renews once and repeats the request once.
// Session routes are excluded: a 401 there means bad credentials or an ended session.
export function createAuthorizedFetch(tokens: TokenProvider, send: FetchFunction): FetchFunction {
  return async (request) => {
    if (new URL(request.url).pathname.startsWith(PORTAL_SESSION_PATH)) {
      return send(request);
    }
    const retryCopy = request.clone();
    const token = await tokens.getAccessToken();
    const response = await send(withBearer(request, token));
    if (response.status !== 401 || token === null) {
      return response;
    }
    const problem = await readProblem(response);
    if (problem.errorCode !== undefined) {
      return response;
    }
    const renewed = await tokens.renewAfterUnauthorized(token);
    return renewed === null ? response : send(withBearer(retryCopy, renewed));
  };
}

export function createApiClient({
  baseUrl,
  tokens,
  fetch = globalFetch,
}: ApiClientOptions): ApiClient {
  return createClient<paths>({ baseUrl, fetch: createAuthorizedFetch(tokens, fetch) });
}
