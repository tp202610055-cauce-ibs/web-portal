import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RequireNutritionist, SessionProvider } from '@/modules/identity';

import { fakeSessionController, nutritionistSession } from '../../../../support/sessions';

function renderGuarded() {
  const controller = fakeSessionController(nutritionistSession);
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>login</p> },
      {
        path: '/a',
        element: (
          <RequireNutritionist>
            <p>a</p>
          </RequireNutritionist>
        ),
      },
      {
        path: '/b',
        element: (
          <RequireNutritionist>
            <p>b</p>
          </RequireNutritionist>
        ),
      },
    ],
    { initialEntries: ['/a'] },
  );
  render(
    <SessionProvider controller={controller}>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return { controller, router };
}

describe('RequireNutritionist activity tracking', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('activity_isReportedAtMostOncePerSecond', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { controller } = renderGuarded();

    fireEvent.pointerDown(window);
    fireEvent.keyDown(window);
    vi.setSystemTime(Date.now() + 1000);
    fireEvent.wheel(window);

    expect(controller.recordActivity).toHaveBeenCalledTimes(2);
  });

  it('tabVisibleAgain_rechecksInactivity', () => {
    const { controller } = renderGuarded();
    controller.checkIdle.mockClear();

    fireEvent(document, new Event('visibilitychange'));

    expect(controller.checkIdle).toHaveBeenCalledTimes(1);
  });

  it('navigation_rechecksInactivity', async () => {
    const { controller, router } = renderGuarded();
    controller.checkIdle.mockClear();

    await act(() => router.navigate('/b'));

    expect(screen.getByText('b')).toBeInTheDocument();
    expect(controller.checkIdle).toHaveBeenCalled();
  });

  it('signedOut_stopsListeningToActivity', () => {
    const { controller } = renderGuarded();

    act(() => controller.set({ status: 'anonymous', reason: 'signed-out' }));
    fireEvent.pointerDown(window);

    expect(controller.recordActivity).not.toHaveBeenCalled();
  });
});
