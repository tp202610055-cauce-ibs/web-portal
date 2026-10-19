import type { InvitationGateway } from '@/modules/identity/application/InvitationGateway';
import type { InvitationCode } from '@/modules/identity/domain/InvitationCode';

// Every call issues a new single-use code: the endpoint is not idempotent.
export function generateInvitationCode(gateway: InvitationGateway): Promise<InvitationCode> {
  return gateway.generate();
}
