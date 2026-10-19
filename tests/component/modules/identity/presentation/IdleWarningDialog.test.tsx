import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionProvider, type Session } from '@/modules/identity';
import { IdleWarningDialog } from '@/modules/identity/presentation/IdleWarningDialog';
import { es } from '@/shared/presentation/i18n/es';

import {
  fakeSessionController,
  nutritionistSession,
  type FakeSessionController,
} from '../../../../support/sessions';

const SECOND = 1000;

function warned(logoutAt: number): Session {
  return { ...nutritionistSession, idleWarning: { logoutAt } } as Session;
}

describe('IdleWarningDialog', () => {
  let controller: FakeSessionController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T15:13:00Z'));
    controller = fakeSessionController(warned(Date.now() + 120 * SECOND));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderDialog() {
    render(
      <SessionProvider controller={controller}>
        <button type="button">elemento previo</button>
        <IdleWarningDialog />
      </SessionProvider>,
    );
  }

  it('warning_opensTheModalWithFocusOnStay', () => {
    renderDialog();

    expect(screen.getByRole('dialog', { name: es.idle.title })).toHaveAttribute('open');
    expect(screen.getByRole('button', { name: es.idle.stay })).toHaveFocus();
    expect(screen.getByText(es.idle.body('2:00'))).toBeInTheDocument();
  });

  it('countdown_ticksEverySecondAndAnnouncesEvery30Seconds', () => {
    renderDialog();

    act(() => vi.advanceTimersByTime(SECOND));
    expect(screen.getByText(es.idle.body('1:59'))).toBeInTheDocument();
    expect(screen.getByText(es.idle.announcement('2:00'))).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(29 * SECOND));
    expect(screen.getByText(es.idle.announcement('1:30'))).toBeInTheDocument();
  });

  it('stay_recordsActivity', () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: es.idle.stay }));

    expect(controller.recordActivity).toHaveBeenCalledTimes(1);
  });

  it('escape_actsAsStay', () => {
    renderDialog();
    const cancel = new Event('cancel', { cancelable: true });

    fireEvent(screen.getByRole('dialog'), cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(controller.recordActivity).toHaveBeenCalledTimes(1);
  });

  it('signOut_logsOut', () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: es.idle.logout }));

    expect(controller.logout).toHaveBeenCalledTimes(1);
  });

  it('warningCleared_closesStopsTheTickAndReturnsFocus', () => {
    controller.set(nutritionistSession);
    render(
      <SessionProvider controller={controller}>
        <button type="button">elemento previo</button>
        <IdleWarningDialog />
      </SessionProvider>,
    );
    const previous = screen.getByRole('button', { name: 'elemento previo' });
    previous.focus();
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    act(() => controller.set(warned(Date.now() + 120 * SECOND)));
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    const tick = setIntervalSpy.mock.results[0]?.value;
    expect(screen.getByRole('button', { name: es.idle.stay })).toHaveFocus();
    act(() => controller.set(nutritionistSession));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(previous).toHaveFocus();
    expect(clearIntervalSpy).toHaveBeenCalledWith(tick);
  });

  it('withoutWarning_rendersNothing', () => {
    controller.set(nutritionistSession);

    renderDialog();

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
