import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
// Same entry point as the routes: under Vitest, react-router/dom resolves to another build copy.
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders, type AppDependencies } from '@/app/AppProviders';
import { routes } from '@/app/routes';
import type { FoodCatalogGateway } from '@/modules/clinical-registry';
import type { InvitationGateway, SessionController } from '@/modules/identity';
import type { PatientsGateway } from '@/modules/patients';
import type { RecommendationsGateway } from '@/modules/recommendations';

import { fakeFoodCatalogGateway } from './foods';
import { fakePatientsGateway } from './patients';
import { fakeRecommendationsGateway } from './recommendations';

// The panel is empty and the review screens keep loading unless a test provides its own gateway.
export function testDependencies(
  session: SessionController,
  patients: PatientsGateway = fakePatientsGateway(),
  invitations: InvitationGateway = { generate: () => new Promise(() => undefined) },
  recommendations: RecommendationsGateway = fakeRecommendationsGateway(),
  foods: FoodCatalogGateway = fakeFoodCatalogGateway(),
): AppDependencies {
  return {
    session,
    queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    patients,
    invitations,
    recommendations,
    foods,
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
