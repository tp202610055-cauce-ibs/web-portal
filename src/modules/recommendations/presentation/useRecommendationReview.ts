import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import {
  attemptFor,
  type DecisionAttempt,
} from '@/modules/recommendations/application/decisionKey';
import {
  submitModification,
  type ModificationRequest,
} from '@/modules/recommendations/application/modifyRecommendation';
import {
  getRecommendation,
  submitDecision,
  type ReviewDecision,
} from '@/modules/recommendations/application/reviewRecommendations';
import { DecisionRefusedError } from '@/modules/recommendations/domain/Recommendation';
import { useRecommendationsGateway } from '@/modules/recommendations/presentation/RecommendationsContext';
import { RECOMMENDATIONS_QUERY_KEY } from '@/modules/recommendations/presentation/useReviewQueue';

export type DecisionInput =
  | { readonly decision: ReviewDecision; readonly note: string }
  | { readonly decision: 'modify'; readonly modification: ModificationRequest };

function detailKey(recommendationId: string) {
  return [...RECOMMENDATIONS_QUERY_KEY, 'detail', recommendationId] as const;
}

// The Idempotency-Key follows what is sent: the same content reuses it, a different one gets a new key.
function contentOf(input: DecisionInput): string {
  return input.decision === 'modify'
    ? `modify:${JSON.stringify(input.modification)}`
    : `${input.decision}:${input.note.trim()}`;
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
    mutationFn: (input: DecisionInput) => {
      const current = attemptFor(attempt.current, contentOf(input), () => crypto.randomUUID());
      attempt.current = current;
      return input.decision === 'modify'
        ? submitModification(gateway, recommendationId, input.modification, current.key)
        : submitDecision(gateway, {
            decision: input.decision,
            recommendationId,
            note: input.note,
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
