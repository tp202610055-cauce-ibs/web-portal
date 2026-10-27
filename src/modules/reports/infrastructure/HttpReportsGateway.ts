import { z } from 'zod';

import type { ReportsGateway } from '@/modules/reports/application/ReportsGateway';
import {
  ReportRefusedError,
  type CalendarDate,
  type GeneratedReport,
} from '@/modules/reports/domain/ClinicalReport';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';
import { toApiProblem } from '@/shared/infrastructure/problemReader';

const generated = z.object({
  presignedUrl: z.url(),
  presignedUrlExpiresAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
});

export class HttpReportsGateway implements ReportsGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async generate(
    patientId: string,
    periodStart: CalendarDate,
    periodEnd: CalendarDate,
    idempotencyKey: string,
  ): Promise<GeneratedReport> {
    let result;
    try {
      result = await this.api.POST('/api/v1/reports/patients/{id}', {
        params: { path: { id: patientId }, header: { 'Idempotency-Key': idempotencyKey } },
        body: { periodStart, periodEnd },
      });
    } catch {
      throw new ServiceUnavailableError();
    }
    const { data, error, response } = result;
    if (response.ok) {
      const parsed = generated.safeParse(data);
      if (!parsed.success) {
        throw new ContractViolationError('GenerateClinicalReportResult');
      }
      return {
        downloadUrl: parsed.data.presignedUrl,
        expiresAt: parsed.data.presignedUrlExpiresAt,
      };
    }
    const problem = toApiProblem(response.status, error);
    if (response.status === 403) {
      throw new ReportRefusedError('access-denied');
    }
    if (response.status === 422 && problem.errorCode === 'patient_has_no_data_in_period') {
      throw new ReportRefusedError('no-data');
    }
    if (response.status === 400 || response.status === 422) {
      throw new ReportRefusedError('invalid-period');
    }
    throw new ServiceUnavailableError();
  }
}
