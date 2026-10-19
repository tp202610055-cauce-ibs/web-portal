import { useSessionController } from '@/modules/identity/presentation/SessionContext';
import { es } from '@/shared/presentation/i18n/es';

export function SessionLoading() {
  return (
    <main>
      <p role="status">{es.generic.loading}</p>
    </main>
  );
}

// The session could not be checked (network, 5xx or a response outside the contract).
export function SessionUnavailable() {
  const controller = useSessionController();
  return (
    <main className="login">
      <div role="alert" className="notice notice--error">
        {es.session.unavailable}
      </div>
      <button type="button" className="btn-primary" onClick={() => void controller.start()}>
        {es.session.retry}
      </button>
    </main>
  );
}
