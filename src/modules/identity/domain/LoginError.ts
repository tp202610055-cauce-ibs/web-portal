export type LoginFailure =
  | { readonly kind: 'invalid-credentials' }
  | { readonly kind: 'account-locked'; readonly lockedUntil: Date }
  | { readonly kind: 'rate-limited'; readonly retryAfterSeconds: number | null };

// Every rejected login except lockout and rate limit is invalid-credentials, so no cause is revealed.
export class LoginError extends Error {
  readonly failure: LoginFailure;

  constructor(failure: LoginFailure) {
    super(`Login rejected: ${failure.kind}.`);
    this.name = 'LoginError';
    this.failure = failure;
  }
}

// The server no longer accepts the session (refresh answered 401 or 403).
export class SessionEndedError extends Error {
  constructor() {
    super('The portal session has ended.');
    this.name = 'SessionEndedError';
  }
}
