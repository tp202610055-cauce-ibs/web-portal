import { z } from 'zod';

import type { InvitationGateway } from '@/modules/identity/application/InvitationGateway';
import {
  InvitationRefusedError,
  type InvitationCode,
  type InvitationRefusalReason,
} from '@/modules/identity/domain/InvitationCode';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';
import { toApiProblem } from '@/shared/infrastructure/problemReader';

const KNOWN_REASONS: readonly string[] = ['pending_activation', 'inactive', 'suspended'];

const generatedCode = z.object({
  code: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
});

export function toInvitationCode(payload: unknown): InvitationCode {
  const parsed = generatedCode.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('GenerateInvitationCodeResult');
  }
  return parsed.data;
}

function refusalReason(body: unknown): InvitationRefusalReason {
  const reason =
    typeof body === 'object' && body !== null && 'reason' in body ? body.reason : undefined;
  return typeof reason === 'string' && KNOWN_REASONS.includes(reason)
    ? (reason as InvitationRefusalReason)
    : 'unavailable';
}

export class HttpInvitationGateway implements InvitationGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async generate(): Promise<InvitationCode> {
    let result;
    try {
      result = await this.api.POST('/api/v1/invitations');
    } catch {
      throw new ServiceUnavailableError();
    }
    const { data, error, response } = result;
    if (response.ok) {
      return toInvitationCode(data);
    }
    const problem = toApiProblem(response.status, error);
    if (response.status === 409 && problem.errorCode === 'nutritionist_not_available') {
      throw new InvitationRefusedError(refusalReason(error));
    }
    throw new ServiceUnavailableError();
  }
}
