import type { CalendarDate, GeneratedReport } from '@/modules/reports/domain/ClinicalReport';

// Throws ReportRefusedError when the server refuses the period or the patient, and
// ServiceUnavailableError or ContractViolationError otherwise.
export interface ReportsGateway {
  generate(
    patientId: string,
    periodStart: CalendarDate,
    periodEnd: CalendarDate,
    idempotencyKey: string,
  ): Promise<GeneratedReport>;
}
