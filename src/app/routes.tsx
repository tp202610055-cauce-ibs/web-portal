import { Navigate, type RouteObject } from 'react-router';

import { AppShell } from '@/app/AppShell';
import { NotFoundPage } from '@/app/NotFoundPage';
import { GlossaryPage } from '@/modules/clinical-registry';
import {
  ForgotPasswordPage,
  LoginPage,
  RequireNutritionist,
  ResetPasswordPage,
} from '@/modules/identity';
import {
  PatientManagementPage,
  PatientRecordPage,
  PatientsPage,
  type RecordTab,
} from '@/modules/patients';
import {
  ManualRecommendationPage,
  PatientRecommendations,
  RecommendationReviewPage,
  ReviewQueuePage,
} from '@/modules/recommendations';
import { es } from '@/shared/presentation/i18n/es';

// The record's Recommendations tab comes from another module, so it is composed here.
const RECORD_TABS: readonly RecordTab[] = [
  {
    key: 'recommendations',
    label: es.recordTabs.recommendations,
    render: (patientId) => <PatientRecommendations patientId={patientId} />,
  },
];

// Shared by the browser router and the tests, so every test enters through the real routes.
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  // Public like the login: the recovery request and the email link, which the backend builds.
  { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
  { path: '/auth/password-reset', element: <ResetPasswordPage /> },
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
      { path: 'pacientes/:patientId', element: <PatientRecordPage extraTabs={RECORD_TABS} /> },
      { path: 'pacientes/:patientId/recomendaciones/nueva', element: <ManualRecommendationPage /> },
      { path: 'gestion-pacientes', element: <PatientManagementPage /> },
      { path: 'revisiones', element: <ReviewQueuePage /> },
      { path: 'recomendaciones/:recommendationId', element: <RecommendationReviewPage /> },
      { path: 'glosario', element: <GlossaryPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
