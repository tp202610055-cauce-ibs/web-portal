import type { InvitationCode } from '@/modules/identity/domain/InvitationCode';

// Throws InvitationRefusedError (409), ServiceUnavailableError or ContractViolationError.
export interface InvitationGateway {
  generate(): Promise<InvitationCode>;
}
