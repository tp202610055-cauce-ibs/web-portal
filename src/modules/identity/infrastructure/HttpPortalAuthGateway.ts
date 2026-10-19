import createClient, { type Client } from 'openapi-fetch';

import type {
  PortalAuthGateway,
  PortalCredentials,
  PortalSessionGrant,
} from '@/modules/identity/application/PortalAuthGateway';
import { LoginError, SessionEndedError } from '@/modules/identity/domain/LoginError';
import { toPortalSessionGrant } from '@/modules/identity/infrastructure/portalSessionMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { paths } from '@/shared/infrastructure/api/generated/schema';
import { globalFetch, type FetchFunction } from '@/shared/infrastructure/apiClient';
import { toApiProblem, type ApiProblem } from '@/shared/infrastructure/problemReader';

// Required by refresh and logout as a CSRF defense; a cross-site form cannot add it.
const CSRF_HEADER = { 'X-Cauce-Portal': '1' } as const;

interface HttpPortalAuthGatewayOptions {
  readonly baseUrl: string;
  readonly fetch?: FetchFunction;
}

function loginFailure(problem: ApiProblem): Error {
  if (problem.status === 423 && problem.lockedUntil !== undefined) {
    const lockedUntil = new Date(problem.lockedUntil);
    if (!Number.isNaN(lockedUntil.getTime())) {
      return new LoginError({ kind: 'account-locked', lockedUntil });
    }
  }
  if (problem.status === 429) {
    return new LoginError({
      kind: 'rate-limited',
      retryAfterSeconds: problem.retryAfterSeconds ?? null,
    });
  }
  if (problem.status === 400 || problem.status === 401 || problem.status === 423) {
    return new LoginError({ kind: 'invalid-credentials' });
  }
  return new ServiceUnavailableError();
}

// Session routes of the portal (/auth/portal/*): its own client, without the Bearer middleware.
export class HttpPortalAuthGateway implements PortalAuthGateway {
  private readonly client: Client<paths>;

  constructor({ baseUrl, fetch = globalFetch }: HttpPortalAuthGatewayOptions) {
    this.client = createClient<paths>({ baseUrl, fetch, credentials: 'include' });
  }

  async login({ email, password }: PortalCredentials): Promise<PortalSessionGrant> {
    const { data, error, response } = await this.send(() =>
      this.client.POST('/api/v1/auth/portal/login', { body: { email, password } }),
    );
    if (response.ok) {
      return toPortalSessionGrant(data);
    }
    throw loginFailure(toApiProblem(response.status, error));
  }

  async refresh(): Promise<PortalSessionGrant> {
    const { data, response } = await this.send(() =>
      this.client.POST('/api/v1/auth/portal/refresh', { headers: CSRF_HEADER }),
    );
    if (response.ok) {
      return toPortalSessionGrant(data);
    }
    if (response.status === 401 || response.status === 403) {
      throw new SessionEndedError();
    }
    throw new ServiceUnavailableError();
  }

  async logout(accessToken: string): Promise<void> {
    const { response } = await this.send(() =>
      this.client.POST('/api/v1/auth/portal/logout', {
        headers: { ...CSRF_HEADER, Authorization: `Bearer ${accessToken}` },
      }),
    );
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
  }

  private async send<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch {
      throw new ServiceUnavailableError();
    }
  }
}
