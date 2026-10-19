import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { NUTRITIONIST_ROLE } from '@/modules/identity/domain/Session';
import { useSession } from '@/modules/identity/presentation/SessionContext';

interface RequireNutritionistProps {
  readonly children: ReactNode;
}

// Route guard: without a nutritionist session every protected route goes to the login.
export function RequireNutritionist({ children }: RequireNutritionistProps) {
  const session = useSession();
  if (session.status !== 'authenticated' || session.user.role !== NUTRITIONIST_ROLE) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
