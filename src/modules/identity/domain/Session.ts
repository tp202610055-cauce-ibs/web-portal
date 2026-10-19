// Only this role may use the portal; the backend enforces it too (POST /auth/portal/login).
export const NUTRITIONIST_ROLE = 'nutritionist';

export interface SessionUser {
  readonly userId: string;
  readonly fullName: string;
  readonly role: string;
}

// Why the portal is signed out; it picks the message shown on the login screen.
export type SignedOutReason = 'signed-out' | 'idle' | 'expired';

export interface IdleWarning {
  readonly logoutAt: number;
}

export type Session =
  | { readonly status: 'restoring' }
  | { readonly status: 'unavailable' }
  | { readonly status: 'anonymous'; readonly reason: SignedOutReason | null }
  | {
      readonly status: 'authenticated';
      readonly user: SessionUser;
      readonly idleWarning: IdleWarning | null;
    };
