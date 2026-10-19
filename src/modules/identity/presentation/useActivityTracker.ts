import { useEffect } from 'react';

import type { SessionController } from '@/modules/identity/application/SessionController';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel'] as const;
const THROTTLE_MS = 1000;

// Reports user activity at most once a second; a visible tab again re-checks inactivity.
export function useActivityTracker(controller: SessionController): void {
  useEffect(() => {
    let lastReportedAt = Number.NEGATIVE_INFINITY;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastReportedAt >= THROTTLE_MS) {
        lastReportedAt = now;
        controller.recordActivity();
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        controller.checkIdle();
      }
    };
    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, onActivity);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [controller]);
}
