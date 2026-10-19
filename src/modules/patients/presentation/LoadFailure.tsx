import {
  PatientAccessDeniedError,
  PatientNotFoundError,
} from '@/modules/patients/domain/PatientRecord';
import { es } from '@/shared/presentation/i18n/es';

interface LoadFailureProps {
  readonly error: unknown;
  readonly message: string;
  readonly onRetry: () => void;
}

// 403 and 404 are final and never reveal a cause; anything else offers a retry.
export function LoadFailure({ error, message, onRetry }: LoadFailureProps) {
  if (error instanceof PatientAccessDeniedError) {
    return (
      <p role="alert" className="notice notice--error">
        {es.record.accessDenied}
      </p>
    );
  }
  if (error instanceof PatientNotFoundError) {
    return (
      <p role="alert" className="notice notice--error">
        {es.record.notFound}
      </p>
    );
  }
  return (
    <div role="alert" className="notice notice--error stack">
      <p>{message}</p>
      <div>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          {es.record.retry}
        </button>
      </div>
    </div>
  );
}
