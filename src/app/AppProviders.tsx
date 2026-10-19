import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { SessionProvider, type SessionController } from '@/modules/identity';

export interface AppDependencies {
  readonly session: SessionController;
  readonly queryClient: QueryClient;
}

interface AppProvidersProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

export function AppProviders({ dependencies, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={dependencies.queryClient}>
      <SessionProvider controller={dependencies.session}>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
