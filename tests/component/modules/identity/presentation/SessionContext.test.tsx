import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionProvider, useSession } from '@/modules/identity';

import { fakeSessionReader, nutritionistSession } from '../../../../support/sessions';

function SessionStatus() {
  return <p>{useSession().status}</p>;
}

describe('SessionContext', () => {
  it('useSession_insideProvider_returnsCurrentSession', () => {
    render(
      <SessionProvider reader={fakeSessionReader(nutritionistSession)}>
        <SessionStatus />
      </SessionProvider>,
    );

    expect(screen.getByText('authenticated')).toBeInTheDocument();
  });

  it('useSession_withoutProvider_throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<SessionStatus />)).toThrow(
      'useSession must be used inside SessionProvider.',
    );
  });
});
