// The OIDC client the backend uses to build the link: it points to /auth/password-reset of the portal.
export const PORTAL_CLIENT_ID = 'cauce-web-portal';

// The server answers the same for an unknown, expired or used link, so the screen never says which.
export type PasswordResetFailure =
  | { readonly kind: 'invalid-email' }
  | { readonly kind: 'rate-limited' }
  | { readonly kind: 'invalid-link' }
  | { readonly kind: 'invalid-password'; readonly messages: string[] };

export class PasswordResetRefusedError extends Error {
  readonly failure: PasswordResetFailure;

  constructor(failure: PasswordResetFailure) {
    super(`The password reset was refused: ${failure.kind}.`);
    this.name = 'PasswordResetRefusedError';
    this.failure = failure;
  }
}
