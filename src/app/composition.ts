import { QueryClient } from '@tanstack/react-query';

import type { AppDependencies } from '@/app/AppProviders';
import { AnonymousSessionReader } from '@/modules/identity';

// Composition root: the only place that chooses the adapter behind each port.
export function createAppDependencies(): AppDependencies {
  return {
    sessionReader: new AnonymousSessionReader(),
    queryClient: new QueryClient(),
  };
}
