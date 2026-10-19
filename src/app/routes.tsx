import { Navigate, type RouteObject } from 'react-router';

import { AppShell } from '@/app/AppShell';
import { NotFoundPage } from '@/app/NotFoundPage';
import { LoginPage, RequireNutritionist } from '@/modules/identity';
import { PatientsPage } from '@/modules/patients';

// Shared by the browser router and the tests, so every test enters through the real routes.
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireNutritionist>
        <AppShell />
      </RequireNutritionist>
    ),
    children: [
      { index: true, element: <Navigate to="/pacientes" replace /> },
      { path: 'pacientes', element: <PatientsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
