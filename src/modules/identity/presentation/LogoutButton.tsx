import { useSessionController } from '@/modules/identity/presentation/SessionContext';
import { es } from '@/shared/presentation/i18n/es';

export function LogoutButton() {
  const controller = useSessionController();
  return (
    <button type="button" className="btn-tertiary" onClick={() => void controller.logout()}>
      {es.session.logout}
    </button>
  );
}
