import { http, HttpResponse, type RequestHandler } from 'msw';

// Contract handlers; each block adds the endpoints it consumes, typed with the generated schema.
// The bell of every signed-in screen reads the alerts, so an empty inbox is the default.
export const handlers: RequestHandler[] = [
  http.get('*/api/v1/nutritionists/me/alerts', () =>
    HttpResponse.json({ items: [], page: 1, pageSize: 20, totalCount: 0, unreadCount: 0 }),
  ),
];
