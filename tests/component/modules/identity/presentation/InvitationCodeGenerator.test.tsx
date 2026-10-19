import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InvitationCodeGenerator,
  InvitationsProvider,
  type InvitationGateway,
} from '@/modules/identity';
import { InvitationRefusedError } from '@/modules/identity/domain/InvitationCode';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

const NOW = new Date('2026-10-20T15:00:00Z');
const IN_72_HOURS = new Date('2026-10-23T15:00:00Z');

function renderGenerator(generate: InvitationGateway['generate']) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <InvitationsProvider gateway={{ generate }}>
        <InvitationCodeGenerator />
      </InvitationsProvider>
    </QueryClientProvider>,
  );
}

function sequence(...codes: string[]) {
  const generate = vi.fn<InvitationGateway['generate']>();
  for (const code of codes) {
    generate.mockResolvedValueOnce({ code, expiresAt: IN_72_HOURS });
  }
  return generate;
}

describe('InvitationCodeGenerator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  // CP052 steps 3 to 5: each click issues a new code, shown with its expiry in Lima time.
  it('generate_twice_showsTwoDifferentCodesWithTheirExpiry', async () => {
    const user = userEvent.setup();
    renderGenerator(sequence('ABCDEFGH23', 'JKLMNPQR45'));
    const button = screen.getByRole('button', { name: es.invitations.generate });

    await user.click(button);
    expect(await screen.findByText('ABCDEFGH23')).toBeInTheDocument();
    expect(screen.getByText(es.invitations.expires('23/10/2026', '10:00', 72))).toBeInTheDocument();

    await user.click(button);
    expect(await screen.findByText('JKLMNPQR45')).toBeInTheDocument();
    expect(screen.queryByText('ABCDEFGH23')).toBeNull();
  });

  it('generate_whileSending_disablesTheButton', async () => {
    renderGenerator(() => new Promise(() => undefined));

    fireEvent.click(screen.getByRole('button', { name: es.invitations.generate }));

    expect(await screen.findByRole('button', { name: es.invitations.generating })).toBeDisabled();
  });

  it('copy_withClipboard_writesTheCodeAndConfirms', async () => {
    const user = userEvent.setup();
    renderGenerator(sequence('ABCDEFGH23'));
    await user.click(screen.getByRole('button', { name: es.invitations.generate }));

    await user.click(await screen.findByRole('button', { name: es.invitations.copy }));

    expect(await screen.findByRole('status')).toHaveTextContent(es.invitations.copied);
    expect(await navigator.clipboard.readText()).toBe('ABCDEFGH23');
  });

  it('copy_withoutClipboard_showsTheManualCopyMessage', async () => {
    renderGenerator(sequence('ABCDEFGH23'));
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: es.invitations.generate }));

    fireEvent.click(await screen.findByRole('button', { name: es.invitations.copy }));

    expect(await screen.findByRole('alert')).toHaveTextContent(es.invitations.copyFailed);
  });

  it('copy_rejectedByTheBrowser_showsTheManualCopyMessage', async () => {
    renderGenerator(sequence('ABCDEFGH23'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('NotAllowedError')) },
      configurable: true,
    });
    fireEvent.click(screen.getByRole('button', { name: es.invitations.generate }));

    fireEvent.click(await screen.findByRole('button', { name: es.invitations.copy }));

    expect(await screen.findByRole('alert')).toHaveTextContent(es.invitations.copyFailed);
  });

  it('generate_afterCopying_clearsTheCopiedNotice', async () => {
    const user = userEvent.setup();
    renderGenerator(sequence('ABCDEFGH23', 'JKLMNPQR45'));
    const button = screen.getByRole('button', { name: es.invitations.generate });
    await user.click(button);
    await user.click(await screen.findByRole('button', { name: es.invitations.copy }));
    await screen.findByRole('status');

    await user.click(button);

    await screen.findByText('JKLMNPQR45');
    expect(screen.queryByText(es.invitations.copied)).toBeNull();
  });

  it.each(['pending_activation', 'inactive', 'suspended', 'unavailable'] as const)(
    'generate_refusedWith_%s_showsItsMessage',
    async (reason) => {
      renderGenerator(() => Promise.reject(new InvitationRefusedError(reason)));

      fireEvent.click(screen.getByRole('button', { name: es.invitations.generate }));

      expect(await screen.findByRole('alert')).toHaveTextContent(es.invitations.refused[reason]);
    },
  );

  it('generate_withServiceDown_showsTheGenericError', async () => {
    renderGenerator(() => Promise.reject(new ServiceUnavailableError()));

    fireEvent.click(screen.getByRole('button', { name: es.invitations.generate }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(es.generic.error));
  });
});
