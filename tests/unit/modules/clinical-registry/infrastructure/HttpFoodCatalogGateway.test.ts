import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { HttpFoodCatalogGateway } from '@/modules/clinical-registry/infrastructure/HttpFoodCatalogGateway';
import { toFoodSummaries } from '@/modules/clinical-registry/infrastructure/foodSummaryMapper';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import { DAIRY_ID, dairyResults, foodBody, MILK_ID } from '../../../../support/foods';

const SEARCH = '*/api/v1/foods/search';

describe('HttpFoodCatalogGateway', () => {
  let gateway: HttpFoodCatalogGateway;

  beforeEach(() => {
    gateway = new HttpFoodCatalogGateway(
      createApiClient({
        baseUrl: window.location.origin,
        tokens: { getAccessToken: async () => 'token-1', renewAfterUnauthorized: async () => null },
      }),
    );
  });

  it('search_sendsTheQueryAndKeepsTheServerOrder', async () => {
    let query: string | null = null;
    server.use(
      http.get(SEARCH, ({ request }) => {
        query = new URL(request.url).searchParams.get('q');
        return HttpResponse.json(dairyResults);
      }),
    );

    const foods = await gateway.search('lácteos');

    expect(query).toBe('lácteos');
    expect(foods).toEqual([
      { foodId: DAIRY_ID, name: 'Lácteos con lactosa', fodmapLevel: 'High' },
      { foodId: MILK_ID, name: 'Leche sin lactosa', fodmapLevel: 'Low' },
    ]);
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 })],
    ['bad request', () => new HttpResponse(null, { status: 400 })],
    ['network failure', () => HttpResponse.error()],
  ])('search_with%s_isUnavailable', async (_name, resolver) => {
    server.use(http.get(SEARCH, resolver));

    await expect(gateway.search('lácteos')).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('search_withPayloadOutsideTheContract_isContractViolation', async () => {
    server.use(http.get(SEARCH, () => HttpResponse.json({ items: [] })));

    await expect(gateway.search('lácteos')).rejects.toBeInstanceOf(ContractViolationError);
  });
});

describe('toFoodSummaries', () => {
  it('food_withUnknownFodmapLevel_isContractViolation', () => {
    expect(() => toFoodSummaries([foodBody({ fodmapLevel: 'Extreme' as never })])).toThrow(
      ContractViolationError,
    );
  });

  it('food_withoutName_keepsNull', () => {
    expect(toFoodSummaries([foodBody({ name: null })])[0]?.name).toBeNull();
  });
});
