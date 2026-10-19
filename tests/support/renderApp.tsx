import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
// Same entry point as the routes: under Vitest, react-router/dom resolves to another build copy.
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders, type AppDependencies } from '@/app/AppProviders';
import { routes } from '@/app/routes';
import type { SessionReader } from '@/modules/identity';

export function testDependencies(sessionReader: SessionReader): AppDependencies {
  return {
    sessionReader,
    queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  };
}

// Mounts the real route table at a URL, as the browser would, with the given dependencies.
export function renderApp(url: string, dependencies: AppDependencies) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const view = render(
    <AppProviders dependencies={dependencies}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...view, router };
}
