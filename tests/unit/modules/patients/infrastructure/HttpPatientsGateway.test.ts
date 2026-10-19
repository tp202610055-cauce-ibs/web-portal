import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpPatientsGateway } from '@/modules/patients/infrastructure/HttpPatientsGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import { cp049Panel } from '../../../../support/patients';

const PATIENTS = '*/api/v1/nutritionists/me/patients';

describe('HttpPatientsGateway', () => {
  let renew: ReturnType<typeof vi.fn>;
  let gateway: HttpPatientsGateway;

  beforeEach(() => {
    renew = vi.fn().mockResolvedValue(null);
    gateway = new HttpPatientsGateway(
      createApiClient({
        baseUrl: window.location.origin,
        tokens: { getAccessToken: async () => 'token-1', renewAfterUnauthorized: renew },
      }),
    );
  });

  it('listAssigned_keepsTheServerOrder', async () => {
    server.use(http.get(PATIENTS, () => HttpResponse.json(cp049Panel)));

    const rows = await gateway.listAssigned();

    expect(rows.map((row) => row.fullName)).toEqual(cp049Panel.map((row) => row.patientFullName));
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 })],
    ['network failure', () => HttpResponse.error()],
    ['forbidden', () => HttpResponse.json({ errorCode: 'forbidden' }, { status: 403 })],
  ])('listAssigned_with%s_isUnavailable', async (_name, resolver) => {
    server.use(http.get(PATIENTS, resolver));

    await expect(gateway.listAssigned()).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('listAssigned_with401ThatCannotBeRenewed_isUnavailable', async () => {
    server.use(http.get(PATIENTS, () => new HttpResponse(null, { status: 401 })));

    await expect(gateway.listAssigned()).rejects.toBeInstanceOf(ServiceUnavailableError);
    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('listAssigned_withPayloadOutsideTheContract_isContractViolation', async () => {
    server.use(http.get(PATIENTS, () => HttpResponse.json([{ patientUserId: '' }])));

    await expect(gateway.listAssigned()).rejects.toBeInstanceOf(ContractViolationError);
  });
});
