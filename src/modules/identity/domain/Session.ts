// Only this role may use the portal; the backend enforces it too (POST /auth/portal/login).
export const NUTRITIONIST_ROLE = 'nutritionist';

export interface SessionUser {
  readonly fullName: string;
  readonly role: string;
}

export type Session =
  | { readonly status: 'anonymous' }
  | { readonly status: 'authenticated'; readonly user: SessionUser };
