import type { SessionUser } from '@/modules/identity/domain/Session';

export interface PortalCredentials {
  readonly email: string;
  readonly password: string;
}

// What a successful login or refresh grants; the refresh token stays in the HttpOnly cookie.
export interface PortalSessionGrant {
  readonly accessToken: string;
  readonly expiresInSeconds: number;
  readonly user: SessionUser;
}

// login throws LoginError; refresh throws SessionEndedError; both may throw ServiceUnavailableError
// or ContractViolationError. logout throws on any failure, and callers treat it as best effort.
export interface PortalAuthGateway {
  login(credentials: PortalCredentials): Promise<PortalSessionGrant>;
  refresh(): Promise<PortalSessionGrant>;
  logout(accessToken: string): Promise<void>;
}
