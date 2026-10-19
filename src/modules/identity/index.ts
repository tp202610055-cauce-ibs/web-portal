export type {
  CrossTabChannel,
  CrossTabEvent,
} from '@/modules/identity/application/CrossTabChannel';
export type {
  PortalAuthGateway,
  PortalCredentials,
  PortalSessionGrant,
} from '@/modules/identity/application/PortalAuthGateway';
export type { RefreshLock } from '@/modules/identity/application/RefreshLock';
export type { SessionController } from '@/modules/identity/application/SessionController';
export type { SessionReader } from '@/modules/identity/application/SessionReader';
export { SessionService } from '@/modules/identity/application/SessionService';
export { LoginError, SessionEndedError } from '@/modules/identity/domain/LoginError';
export type { LoginFailure } from '@/modules/identity/domain/LoginError';
export { NUTRITIONIST_ROLE } from '@/modules/identity/domain/Session';
export type { Session, SessionUser, SignedOutReason } from '@/modules/identity/domain/Session';
export { BroadcastCrossTabChannel } from '@/modules/identity/infrastructure/BroadcastCrossTabChannel';
export { HttpPortalAuthGateway } from '@/modules/identity/infrastructure/HttpPortalAuthGateway';
export { WebLocksRefreshLock } from '@/modules/identity/infrastructure/WebLocksRefreshLock';
export { LoginPage } from '@/modules/identity/presentation/LoginPage';
export { LogoutButton } from '@/modules/identity/presentation/LogoutButton';
export { RequireNutritionist } from '@/modules/identity/presentation/RequireNutritionist';
export {
  SessionProvider,
  useSession,
  useSessionController,
} from '@/modules/identity/presentation/SessionContext';
