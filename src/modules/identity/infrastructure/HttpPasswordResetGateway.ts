import type { PasswordResetGateway } from '@/modules/identity/application/PasswordResetGateway';
import {
  PasswordResetRefusedError,
  PORTAL_CLIENT_ID,
  type PasswordResetFailure,
} from '@/modules/identity/domain/PasswordReset';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';
import { toApiProblem } from '@/shared/infrastructure/problemReader';

interface ApiResult {
  readonly error?: unknown;
  readonly response: Response;
}

const LINK_CODES = new Set(['invalid_password_reset_token', 'expired_password_reset_token']);

// Success may come without a body, so it is read as text; an error body may arrive parsed or not.
function parseBody(text: unknown): unknown {
  if (typeof text !== 'string') {
    return text;
  }
  if (text.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function send<T extends ApiResult>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch {
    throw new ServiceUnavailableError();
  }
}

// A 429 is its own message; any other refusal is decided by the caller from the 400 body.
function check(
  { error, response }: ApiResult,
  onBadRequest: (body: unknown) => PasswordResetFailure,
): void {
  if (response.ok) {
    return;
  }
  if (response.status === 429) {
    throw new PasswordResetRefusedError({ kind: 'rate-limited' });
  }
  if (response.status === 400) {
    throw new PasswordResetRefusedError(onBadRequest(parseBody(error)));
  }
  throw new ServiceUnavailableError();
}

export class HttpPasswordResetGateway implements PasswordResetGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async request(email: string): Promise<void> {
    check(
      await send(() =>
        this.api.POST('/api/v1/auth/password-reset/request', {
          body: { email, clientId: PORTAL_CLIENT_ID },
          parseAs: 'text',
        }),
      ),
      () => ({ kind: 'invalid-email' }),
    );
  }

  async validate(token: string): Promise<void> {
    check(
      await send(() =>
        this.api.POST('/api/v1/auth/password-reset/validate', { body: { token }, parseAs: 'text' }),
      ),
      () => ({ kind: 'invalid-link' }),
    );
  }

  async confirm(token: string, newPassword: string): Promise<void> {
    check(
      await send(() =>
        this.api.POST('/api/v1/auth/password-reset/confirm', {
          body: { token, newPassword },
          parseAs: 'text',
        }),
      ),
      (body) => {
        const problem = toApiProblem(400, body);
        if (LINK_CODES.has(problem.errorCode ?? '')) {
          return { kind: 'invalid-link' };
        }
        return { kind: 'invalid-password', messages: Object.values(problem.errors ?? {}).flat() };
      },
    );
  }
}
