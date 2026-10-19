import { useEffect, useRef, useState } from 'react';

import type { SessionController } from '@/modules/identity/application/SessionController';
import { useSession, useSessionController } from '@/modules/identity/presentation/SessionContext';
import { formatCountdown } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const TICK_MS = 1000;
const ANNOUNCE_STEP_MS = 30 * 1000;

export function IdleWarningDialog() {
  const session = useSession();
  const controller = useSessionController();
  const warning = session.status === 'authenticated' ? session.idleWarning : null;
  if (warning === null) {
    return null;
  }
  return <IdleWarning logoutAt={warning.logoutAt} controller={controller} />;
}

interface IdleWarningProps {
  readonly logoutAt: number;
  readonly controller: SessionController;
}

// Owns the countdown tick: it starts when the dialog opens and stops when it closes.
function IdleWarning({ logoutAt, controller }: IdleWarningProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stayRef = useRef<HTMLButtonElement>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    stayRef.current?.focus();
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(tick);
  }, []);

  const remaining = logoutAt - now;
  const announced = Math.ceil(remaining / ANNOUNCE_STEP_MS) * ANNOUNCE_STEP_MS;

  return (
    <dialog
      ref={dialogRef}
      className="idle-dialog"
      aria-labelledby="idle-title"
      aria-describedby="idle-body"
      onCancel={(event) => {
        event.preventDefault();
        controller.recordActivity();
      }}
    >
      <h2 id="idle-title">{es.idle.title}</h2>
      <p id="idle-body">{es.idle.body(formatCountdown(remaining))}</p>
      <p className="visually-hidden" aria-live="polite">
        {es.idle.announcement(formatCountdown(announced))}
      </p>
      <div className="actions">
        <button type="button" className="btn-secondary" onClick={() => void controller.logout()}>
          {es.idle.logout}
        </button>
        <button
          ref={stayRef}
          type="button"
          className="btn-primary"
          onClick={() => controller.recordActivity()}
        >
          {es.idle.stay}
        </button>
      </div>
    </dialog>
  );
}
