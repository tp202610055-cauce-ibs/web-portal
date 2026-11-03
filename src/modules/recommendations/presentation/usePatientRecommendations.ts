import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveRecommendation,
  createManualRecommendation,
  listPatientRecommendations,
} from '@/modules/recommendations/application/patientRecommendations';
import type { ManualRequest } from '@/modules/recommendations/domain/manualRecommendation';
import type { ArchiveReason } from '@/modules/recommendations/domain/Recommendation';
import { useRecommendationsGateway } from '@/modules/recommendations/presentation/RecommendationsContext';
import { RECOMMENDATIONS_QUERY_KEY } from '@/modules/recommendations/presentation/useReviewQueue';

function patientKey(patientId: string) {
  return [...RECOMMENDATIONS_QUERY_KEY, 'patient', patientId] as const;
}

export function usePatientRecommendations(patientId: string) {
  const gateway = useRecommendationsGateway();
  return useQuery({
    queryKey: patientKey(patientId),
    queryFn: () => listPatientRecommendations(gateway, patientId),
    retry: false,
  });
}

// After archiving or creating, the cached list of that patient is dropped so it is read again.
export function useArchiveRecommendation(recommendationId: string, patientId: string) {
  const gateway = useRecommendationsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: ArchiveReason) => archiveRecommendation(gateway, recommendationId, reason),
    onSuccess: () => queryClient.removeQueries({ queryKey: patientKey(patientId) }),
  });
}

export function useCreateManualRecommendation(patientId: string) {
  const gateway = useRecommendationsGateway();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ManualRequest) => createManualRecommendation(gateway, request),
    onSuccess: () => queryClient.removeQueries({ queryKey: patientKey(patientId) }),
  });
}
