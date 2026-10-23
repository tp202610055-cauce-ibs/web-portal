import type { Page, Route } from '@playwright/test';

import { dairyResults } from '../../tests/support/foods';
import { assignedPatientBody } from '../../tests/support/patients';
import { detailBody, evolutionCp056A, RECORD_PATIENT_ID } from '../../tests/support/patientRecord';
import { cp086Pending, PENDING_ID, pendingPageBody } from '../../tests/support/recommendations';

// Synthetic session of the vitest fixtures, repeated here because that file imports vitest.
const session = {
  accessToken: 'access-token-1',
  expiresIn: 900,
  tokenType: 'Bearer',
  user: {
    userId: '00000000-0000-4000-8000-000000000001',
    keycloakId: 'keycloak-subject-1',
    email: 'nutri.prueba@cauce.test',
    role: 'nutritionist',
    fullName: 'Nutricionista Prueba',
    emailVerified: true,
    isInActivePilot: false,
  },
};

const PATIENT = `/api/v1/nutritionists/me/patients/${RECORD_PATIENT_ID}`;

const answers: Record<string, unknown> = {
  'GET /api/v1/nutritionists/me/patients': [assignedPatientBody()],
  [`GET ${PATIENT}`]: detailBody(),
  [`GET ${PATIENT}/evolution`]: evolutionCp056A,
  'GET /api/v1/recommendations/pending-review': pendingPageBody(),
  [`GET /api/v1/recommendations/${PENDING_ID}`]: cp086Pending,
  'GET /api/v1/foods/search': dairyResults,
};

// The image has no backend: the browser's API calls are answered here, and any other call is recorded.
export async function mockPortalApi(page: Page, signedIn: boolean): Promise<string[]> {
  const unexpected: string[] = [];
  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    const key = `${request.method()} ${new URL(request.url()).pathname}`;
    if (key === 'POST /api/v1/auth/portal/refresh') {
      await (signedIn
        ? route.fulfill({ json: session })
        : route.fulfill({ status: 401, json: { errorCode: 'invalid_refresh_token' } }));
      return;
    }
    if (key in answers) {
      await route.fulfill({ json: answers[key] });
      return;
    }
    unexpected.push(key);
    await route.fulfill({ status: 404, json: {} });
  });
  return unexpected;
}

export { PENDING_ID, RECORD_PATIENT_ID };
