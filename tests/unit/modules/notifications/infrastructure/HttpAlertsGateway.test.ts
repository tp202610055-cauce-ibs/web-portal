import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { unreadBadge } from '@/modules/notifications/domain/NutritionistAlert';
import { HttpAlertsGateway } from '@/modules/notifications/infrastructure/HttpAlertsGateway';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import { createApiClient } from '@/shared/infrastructure/apiClient';

import { server } from '../../../../msw/server';
import { alertBody, alertListBody } from '../../../../support/alerts';

const BASE = 'http://portal.test';
const ALERTS = `${BASE}/api/v1/nutritionists/me/alerts`;
const gateway = new HttpAlertsGateway(
  createApiClient({
    baseUrl: BASE,
    tokens: { getAccessToken: async () => 'token', renewAfterUnauthorized: async () => null },
  }),
);

describe('unreadBadge', () => {
  it.each([
    [0, null],
    [1, '1'],
    [9, '9'],
    [10, '9+'],
    [130, '9+'],
  ])('%i_is %s', (count, badge) => {
    expect(unreadBadge(count)).toBe(badge);
  });
});

describe('HttpAlertsGateway', () => {
  it('list_sendsThePage_andMapsTheAlerts', async () => {
    const seen: { query?: URLSearchParams } = {};
    server.use(
      http.get(ALERTS, ({ request }) => {
        seen.query = new URL(request.url).searchParams;
        return HttpResponse.json(
          alertListBody(
            [
              alertBody(),
              alertBody({ id: 'a2', type: 'PatientSubtypeChanged', isRead: true, message: null }),
            ],
            { totalCount: 25, unreadCount: 3 },
          ),
        );
      }),
    );

    const page = await gateway.list(1, 20);

    expect(seen.query?.get('pageSize')).toBe('20');
    expect(page.totalCount).toBe(25);
    expect(page.unreadCount).toBe(3);
    expect(page.items[0]).toMatchObject({
      alertId: alertBody().id,
      type: 'PatientLinked',
      patientCode: 'P-0042',
      occurredAt: new Date('2026-10-27T15:00:00Z'),
      isRead: false,
    });
    expect(page.items[1]?.message).toBeNull();
  });

  it('list_dropsAnUnknownType', async () => {
    server.use(
      http.get(ALERTS, () =>
        HttpResponse.json(alertListBody([alertBody({ type: 'Future' as never })])),
      ),
    );

    expect((await gateway.list(1, 20)).items).toEqual([]);
  });

  it.each([
    ['server error', () => new HttpResponse(null, { status: 500 }), ServiceUnavailableError],
    ['network failure', () => HttpResponse.error(), ServiceUnavailableError],
    ['foreign payload', () => HttpResponse.json({ items: 'x' }), ContractViolationError],
  ])('list_with%s_throws', async (_name, resolver, error) => {
    server.use(http.get(ALERTS, resolver));

    await expect(gateway.list(1, 20)).rejects.toBeInstanceOf(error);
  });

  it('readAll_posts_andAFailureIsUnavailable', async () => {
    let posted = false;
    server.use(
      http.post(`${ALERTS}/read-all`, () => {
        posted = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await gateway.readAll();
    expect(posted).toBe(true);

    server.use(http.post(`${ALERTS}/read-all`, () => new HttpResponse(null, { status: 500 })));
    await expect(gateway.readAll()).rejects.toBeInstanceOf(ServiceUnavailableError);
  });
});
