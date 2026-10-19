import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@/shared/presentation/styles/tokens.css';
import '@/shared/presentation/styles/base.css';
import '@/shared/presentation/styles/components.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from '@/app/AppProviders';
import { createAppDependencies } from '@/app/composition';
import { routes } from '@/app/routes';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Missing #root element.');
}

const router = createBrowserRouter(routes);
const app = createAppDependencies();
void app.sessionService.start();

createRoot(container).render(
  <StrictMode>
    <AppProviders dependencies={app}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
