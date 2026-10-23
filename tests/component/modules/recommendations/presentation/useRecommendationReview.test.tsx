import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { RecommendationsGateway } from '@/modules/recommendations/application/RecommendationsGateway';
import {
  toPendingReviewPage,
  toRecommendationDetail,
} from '@/modules/recommendations/infrastructure/recommendationMapper';
import { RecommendationsProvider } from '@/modules/recommendations/presentation/RecommendationsContext';
import {
  useReviewDecision,
  type DecisionInput,
} from '@/modules/recommendations/presentation/useRecommendationReview';
import { ServiceUnavailableError } from '@/shared/domain/errors';

import {
  detailBody,
  fakeRecommendationsGateway,
  NOTE_CP045,
  NOTE_CP046,
  NOTE_CP086,
  PENDING_ID,
  pendingPageBody,
} from '../../../../support/recommendations';

const QUEUE_PAGE_1 = ['recommendations', 'pending-review', 1] as const;
const QUEUE_PAGE_2 = ['recommendations', 'pending-review', 2] as const;
const DETAIL = ['recommendations', 'detail', PENDING_ID] as const;

const decisions: [string, DecisionInput][] = [
  ['approve', { decision: 'approve', note: NOTE_CP045 }],
  ['reject', { decision: 'reject', note: NOTE_CP046 }],
  [
    'modify',
    {
      decision: 'modify',
      modification: {
        clinicalNote: NOTE_CP086,
        title: 'Reducir cebolla',
        description: null,
        steps: null,
        items: null,
      },
    },
  ],
];

let stopObserving: (() => void) | null = null;

afterEach(() => {
  stopObserving?.();
  stopObserving = null;
});

// The queue page 1 is cached but not on screen; page 2 is watched, as if another screen showed it.
function seededClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const page = toPendingReviewPage(pendingPageBody());
  client.setQueryData(QUEUE_PAGE_1, page);
  client.setQueryData(QUEUE_PAGE_2, page);
  client.setQueryData(DETAIL, toRecommendationDetail(detailBody()));
  const observer = new QueryObserver(client, {
    queryKey: QUEUE_PAGE_2,
    queryFn: () => page,
    staleTime: Infinity,
  });
  stopObserving = observer.subscribe(() => undefined);
  return client;
}

function renderDecision(client: QueryClient, gateway: RecommendationsGateway) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RecommendationsProvider gateway={gateway}>{children}</RecommendationsProvider>
    </QueryClientProvider>
  );
  return renderHook(() => useReviewDecision(PENDING_ID), { wrapper });
}

const accepted = fakeRecommendationsGateway({
  approve: async () => undefined,
  reject: async () => undefined,
  modify: async () => undefined,
});

describe('useReviewDecision', () => {
  it.each(decisions)('%s_dropsOnlyTheInactiveQueuePagesAndKeepsTheDetail', async (_name, input) => {
    const client = seededClient();
    const { result } = renderDecision(client, accepted);

    await act(() => result.current.mutateAsync(input));

    expect(client.getQueryData(QUEUE_PAGE_1)).toBeUndefined();
    expect(client.getQueryData(QUEUE_PAGE_2)).toBeDefined();
    expect(client.getQueryData(DETAIL)).toBeDefined();
  });

  it('failedDecision_keepsTheQueueCache', async () => {
    const client = seededClient();
    const { result } = renderDecision(
      client,
      fakeRecommendationsGateway({
        approve: async () => {
          throw new ServiceUnavailableError();
        },
      }),
    );

    await act(async () => {
      await result.current
        .mutateAsync({ decision: 'approve', note: NOTE_CP045 })
        .catch(() => undefined);
    });

    expect(client.getQueryData(QUEUE_PAGE_1)).toBeDefined();
  });
});
