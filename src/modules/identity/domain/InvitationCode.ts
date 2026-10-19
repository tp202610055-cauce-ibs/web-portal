export interface InvitationCode {
  readonly code: string;
  readonly expiresAt: Date;
}

// Account states the backend reports when the nutritionist cannot issue codes (409 reason).
export type InvitationRefusalReason =
  'pending_activation' | 'inactive' | 'suspended' | 'unavailable';

export class InvitationRefusedError extends Error {
  readonly reason: InvitationRefusalReason;

  constructor(reason: InvitationRefusalReason) {
    super(`Invitation code refused: ${reason}.`);
    this.name = 'InvitationRefusedError';
    this.reason = reason;
  }
}
