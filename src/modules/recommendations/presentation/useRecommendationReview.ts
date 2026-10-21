import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
  attemptFor,
  type DecisionAttempt,
} from '@/modules/recommendations/application/decisionKey';
import {
  getRecommendation,
  submitDecision,
  type ReviewDecision,
} from '@/modules/recommendations/application/reviewRecommendations';
import { DecisionRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { useRecommendationsGateway } from '@/modules/recommendations/presentation/RecommendationsContext';
import { RECOMMENDATIONS_QUERY_KEY } from '@/modules/recommendations/presentation/useReviewQueue';

export interface DecisionInput {
  readonly decision: ReviewDecision;
  readonly note: string;
}

function detailKey(recommendationId: string) {
  return [...RECOMMENDATIONS_QUERY_KEY, 'detail', recommendationId] as const;
}

// Opening the detail may expire it on the server; the screen shows whatever state arrives.
export function useRecommendation(recommendationId: string) {
  const gateway = useRecommendationsGateway();
  return useQuery({
    queryKey: detailKey(recommendationId),
    queryFn: () => getRecommendation(gateway, recommendationId),
    retry: false,
  });
}

// A conflict or an expiry reloads the detail so the new state replaces the stale one.
export function useReviewDecision(recommendationId: string) {
  const gateway = useRecommendationsGateway();
  const queryClient = useQueryClient();
  const attempt = useRef<DecisionAttempt | null>(null);
  return useMutation({
    mutationFn: ({ decision, note }: DecisionInput) => {
      const current = attemptFor(attempt.current, `${decision}:${note.trim()}`, () =>
        crypto.randomUUID(),
      );
      attempt.current = current;
      return submitDecision(gateway, {
        decision,
        recommendationId,
        note,
        idempotencyKey: current.key,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECOMMENDATIONS_QUERY_KEY }),
    onError: (error) => {
      if (!(error instanceof DecisionRefusedError)) {
        return;
      }
      if (error.failure.kind === 'idempotency-mismatch') {
        attempt.current = null;
      }
      if (error.failure.kind === 'state-conflict' || error.failure.kind === 'expired') {
        void queryClient.invalidateQueries({ queryKey: detailKey(recommendationId) });
      }
    },
  });
}
