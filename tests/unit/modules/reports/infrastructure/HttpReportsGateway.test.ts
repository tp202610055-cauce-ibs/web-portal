import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { checkPeriod, ReportRefusedError } from '@/modules/reports/domain/ClinicalReport';
import { HttpReportsGateway } from '@/modules/reports/infrastructure/HttpReportsGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';

const BASE = 'http://portal.test';
const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const URL_REPORT = `${BASE}/api/v1/reports/patients/${PATIENT}`;
const gateway = new HttpReportsGateway(
  createApiClient({
    baseUrl: BASE,
    tokens: { getAccessToken: async () => 'token', renewAfterUnauthorized: async () => null },
  }),
);

describe('checkPeriod', () => {
  it.each([
    ['', '2026-08-31', 'required'],
    ['2026-08-01', '', 'required'],
    ['2026-09-01', '2026-08-31', 'order'],
    ['2026-08-01', '2026-10-27', 'future'],
    ['2026-08-01', '2026-08-31', null],
    ['2026-10-26', '2026-10-26', null],
  ] as const)('%s to %s is %s', (start, end, problem) => {
    expect(checkPeriod(start, end, '2026-10-26')).toBe(problem);
  });
});

describe('HttpReportsGateway', () => {
  // CP058: the period travels as dates with an Idempotency-Key; the answer is a download link.
  it('generate_sendsThePeriodAndKey_andReturnsTheLink', async () => {
    let sent: { body: unknown; key: string | null } | null = null;
    server.use(
      http.post(URL_REPORT, async ({ request }) => {
        sent = { body: await request.json(), key: request.headers.get('Idempotency-Key') };
        return HttpResponse.json(
          {
            reportId: '00000000-0000-4000-8000-0000000000r1',
            presignedUrl: 'https://files.test/report.pdf',
            presignedUrlExpiresAt: '2026-10-26T16:00:00Z',
          },
          { status: 202 },
        );
      }),
    );

    const report = await gateway.generate(PATIENT, '2026-08-01', '2026-08-31', 'key-1');

    expect(sent).toEqual({
      body: { periodStart: '2026-08-01', periodEnd: '2026-08-31' },
      key: 'key-1',
    });
    expect(report).toEqual({
      downloadUrl: 'https://files.test/report.pdf',
      expiresAt: new Date('2026-10-26T16:00:00Z'),
    });
  });

  it.each([
    [422, 'patient_has_no_data_in_period', 'no-data'],
    [422, 'report_period_invalid', 'invalid-period'],
    [400, undefined, 'invalid-period'],
    [403, 'report_access_denied', 'access-denied'],
  ] as const)('generate_with%i_%s_isRefused', async (status, errorCode, reason) => {
    server.use(http.post(URL_REPORT, () => HttpResponse.json({ errorCode }, { status })));

    const error = await gateway.generate(PATIENT, '2026-07-01', '2026-07-31', 'k').catch((e) => e);

    expect(error).toBeInstanceOf(ReportRefusedError);
    expect((error as ReportRefusedError).reason).toBe(reason);
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 }), ServiceUnavailableError],
    ['network failure', () => HttpResponse.error(), ServiceUnavailableError],
    [
      'no link',
      () =>
        HttpResponse.json(
          { reportId: 'r', presignedUrl: null, presignedUrlExpiresAt: '2026-10-26T16:00:00Z' },
          { status: 202 },
        ),
      ContractViolationError,
    ],
  ])('generate_with%s_throws', async (_name, resolver, expected) => {
    server.use(http.post(URL_REPORT, resolver));

    await expect(gateway.generate(PATIENT, '2026-08-01', '2026-08-31', 'k')).rejects.toBeInstanceOf(
      expected,
    );
  });
});
