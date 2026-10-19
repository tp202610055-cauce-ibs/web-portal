import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router';

import { LoginError } from '@/modules/identity/domain/LoginError';
import { NUTRITIONIST_ROLE, type SignedOutReason } from '@/modules/identity/domain/Session';
import { useSession, useSessionController } from '@/modules/identity/presentation/SessionContext';
import {
  SessionLoading,
  SessionUnavailable,
} from '@/modules/identity/presentation/SessionStatusScreens';
import {
  formatLimaDate,
  formatLimaTime,
  isSameLimaDay,
} from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const REASON_MESSAGE: Record<SignedOutReason, string | null> = {
  'signed-out': null,
  idle: es.session.idleClosed,
  expired: es.session.expired,
};

// One message for every rejection, so the screen never reveals why a login failed.
function messageFor(error: unknown): string {
  if (!(error instanceof LoginError)) {
    return es.generic.error;
  }
  const { failure } = error;
  switch (failure.kind) {
    case 'invalid-credentials':
      return es.login.rejected;
    case 'rate-limited':
      return es.login.rateLimited;
    case 'account-locked': {
      const time = formatLimaTime(failure.lockedUntil);
      return isSameLimaDay(failure.lockedUntil, new Date())
        ? es.login.lockedToday(time)
        : es.login.lockedOnDate(formatLimaDate(failure.lockedUntil), time);
    }
  }
}

export function LoginPage() {
  const session = useSession();
  if (session.status === 'restoring') {
    return <SessionLoading />;
  }
  if (session.status === 'unavailable') {
    return <SessionUnavailable />;
  }
  if (session.status === 'authenticated' && session.user.role === NUTRITIONIST_ROLE) {
    return <Navigate to="/pacientes" replace />;
  }
  const reason = session.status === 'anonymous' ? session.reason : null;
  return <LoginForm notice={reason === null ? null : REASON_MESSAGE[reason]} />;
}

interface FieldErrors {
  readonly email: boolean;
  readonly password: boolean;
}

function LoginForm({ notice }: { readonly notice: string | null }) {
  const controller = useSessionController();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = { email: email.trim() === '', password: password === '' };
    setFieldErrors(missing);
    if (missing.email || missing.password) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await controller.login(email.trim(), password);
    } catch (loginError) {
      setError(messageFor(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  const describedBy = (field: keyof FieldErrors) =>
    [fieldErrors[field] ? `login-${field}-error` : null, error === null ? null : 'login-error']
      .filter((id) => id !== null)
      .join(' ') || undefined;

  return (
    <main className="login">
      <p>
        {es.app.name} · {es.app.portal}
      </p>
      <h1>{es.login.title}</h1>
      {notice !== null && (
        <p role="status" className="notice notice--info">
          {notice}
        </p>
      )}
      <form className="card stack" noValidate onSubmit={(event) => void onSubmit(event)}>
        {error !== null && (
          <p id="login-error" role="alert" className="notice notice--error">
            {error}
          </p>
        )}
        <div className="field">
          <label htmlFor="login-email">{es.login.email}</label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            aria-invalid={fieldErrors.email}
            aria-describedby={describedBy('email')}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="field-error">
              {es.generic.field}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="login-password">{es.login.password}</label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={fieldErrors.password}
            aria-describedby={describedBy('password')}
            onChange={(event) => setPassword(event.target.value)}
          />
          {fieldErrors.password && (
            <p id="login-password-error" className="field-error">
              {es.generic.field}
            </p>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? es.login.submitting : es.login.submit}
        </button>
      </form>
    </main>
  );
}
