import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionProvider, useSession } from '@/modules/identity';

import {
  anonymousSession,
  fakeSessionController,
  nutritionistSession,
} from '../../../../support/sessions';

function SessionStatus() {
  return <p>{useSession().status}</p>;
}

describe('SessionContext', () => {
  it('useSession_insideProvider_returnsCurrentSession', () => {
    render(
      <SessionProvider controller={fakeSessionController(nutritionistSession)}>
        <SessionStatus />
      </SessionProvider>,
    );

    expect(screen.getByText('authenticated')).toBeInTheDocument();
  });

  it('useSession_whenTheSessionChanges_reRenders', () => {
    const controller = fakeSessionController(nutritionistSession);
    render(
      <SessionProvider controller={controller}>
        <SessionStatus />
      </SessionProvider>,
    );

    act(() => controller.set(anonymousSession));

    expect(screen.getByText('anonymous')).toBeInTheDocument();
  });

  it('useSession_withoutProvider_throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<SessionStatus />)).toThrow(
      'useSession must be used inside SessionProvider.',
    );
  });
});
