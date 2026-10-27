import type { Glossary } from '@/modules/clinical-registry/domain/Glossary';
import type { HistoryEvent } from '@/modules/clinical-registry/domain/PatientDiary';

// Both throw ServiceUnavailableError or ContractViolationError; the history adds
// HistoryAccessDeniedError (403) when the patient is not assigned to this nutritionist.
export interface ClinicalRegistryGateway {
  getPatientHistory(patientId: string, from: Date, to: Date): Promise<HistoryEvent[]>;
  getGlossary(): Promise<Glossary>;
}
