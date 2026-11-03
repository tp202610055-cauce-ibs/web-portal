import type { Glossary, TermRequestOutcome } from '@/modules/clinical-registry/domain/Glossary';
import type { HistoryEvent } from '@/modules/clinical-registry/domain/PatientDiary';

// All throw ServiceUnavailableError or ContractViolationError; the history adds
// HistoryAccessDeniedError (403) and requestTerm adds TermRequestRefusedError.
export interface ClinicalRegistryGateway {
  getPatientHistory(patientId: string, from: Date, to: Date): Promise<HistoryEvent[]>;
  getGlossary(): Promise<Glossary>;
  requestTerm(term: string): Promise<TermRequestOutcome>;
}
