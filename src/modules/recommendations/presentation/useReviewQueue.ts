import { useQuery } from '@tanstack/react-query';

import { listPendingReview } from '@/modules/recommendations/application/reviewRecommendations';
import { useRecommendationsGateway } from '@/modules/recommendations/presentation/RecommendationsContext';

// Every recommendation query starts with this key, so a decision refreshes the queue and the detail.
export const RECOMMENDATIONS_QUERY_KEY = ['recommendations'] as const;

// No automatic retries: a failure shows the error state at once and the user decides when to retry.
export function useReviewQueue(page: number) {
  const gateway = useRecommendationsGateway();
  return useQuery({
    queryKey: [...RECOMMENDATIONS_QUERY_KEY, 'pending-review', page],
    queryFn: () => listPendingReview(gateway, page),
    retry: false,
  });
}
