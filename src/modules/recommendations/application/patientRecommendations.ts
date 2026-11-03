import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import type { ManualRequest } from '@/modules/recommendations/domain/manualRecommendation';
import type {
  ArchiveReason,
  PatientRecommendation,
  PatientRecommendationsPage,
} from '@/modules/recommendations/domain/Recommendation';

// The contract maximum; a pilot patient has far fewer, and the screen says when more exist.
export const PATIENT_RECOMMENDATIONS_PAGE_SIZE = 100;

export function listPatientRecommendations(
  gateway: RecommendationsGateway,
  patientId: string,
): Promise<PatientRecommendationsPage> {
  return gateway.listForPatient(patientId, 1, PATIENT_RECOMMENDATIONS_PAGE_SIZE);
}

// Active ones carry isActive; the archived history is the rest, exactly as the server flags them.
export function splitByActivity(items: PatientRecommendation[]): {
  active: PatientRecommendation[];
  archived: PatientRecommendation[];
} {
  return {
    active: items.filter((item) => item.isActive),
    archived: items.filter((item) => !item.isActive),
  };
}

export function archiveRecommendation(
  gateway: RecommendationsGateway,
  recommendationId: string,
  reason: ArchiveReason,
): Promise<void> {
  return gateway.archive(recommendationId, reason);
}

export function createManualRecommendation(
  gateway: RecommendationsGateway,
  request: ManualRequest,
): Promise<string> {
  return gateway.createManual(request);
}
