import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { NUTRITIONIST_ROLE } from '@/modules/identity/domain/Session';
import { IdleWarningDialog } from '@/modules/identity/presentation/IdleWarningDialog';
import { useSession, useSessionController } from '@/modules/identity/presentation/SessionContext';
import {
  SessionLoading,
  SessionUnavailable,
} from '@/modules/identity/presentation/SessionStatusScreens';
import { useActivityTracker } from '@/modules/identity/presentation/useActivityTracker';

interface RequireNutritionistProps {
  readonly children: ReactNode;
}

// Route guard: without a nutritionist session every protected route goes to the login.
export function RequireNutritionist({ children }: RequireNutritionistProps) {
  const session = useSession();
  if (session.status === 'restoring') {
    return <SessionLoading />;
  }
  if (session.status === 'unavailable') {
    return <SessionUnavailable />;
  }
  if (session.status !== 'authenticated' || session.user.role !== NUTRITIONIST_ROLE) {
    return <Navigate to="/login" replace />;
  }
  return <ActiveSession>{children}</ActiveSession>;
}

// Tracks activity only while signed in, and re-checks inactivity on every navigation.
function ActiveSession({ children }: RequireNutritionistProps) {
  const controller = useSessionController();
  const { pathname } = useLocation();
  useActivityTracker(controller);
  useEffect(() => {
    controller.checkIdle();
  }, [controller, pathname]);
  return (
    <>
      {children}
      <IdleWarningDialog />
    </>
  );
}
