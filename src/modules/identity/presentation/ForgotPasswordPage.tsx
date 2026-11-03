import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { PasswordResetRefusedError } from '@/modules/identity/domain/PasswordReset';
import { usePasswordResetGateway } from '@/modules/identity/presentation/PasswordResetContext';
import { es } from '@/shared/presentation/i18n/es';

const { passwordReset: text } = es;

function messageFor(error: unknown): string {
  if (error instanceof PasswordResetRefusedError) {
    return error.failure.kind === 'rate-limited' ? es.login.rateLimited : es.generic.field;
  }
  return es.generic.error;
}

// Password recovery (/recuperar-contrasena), reached from the login. The answer never says whether
// the email has an account.
export function ForgotPasswordPage() {
  const gateway = usePasswordResetGateway();
  const [email, setEmail] = useState('');
  const [missing, setMissing] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    setMissing(value === '');
    if (value === '' || submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await gateway.request(value);
      setSent(true);
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login">
      <p>
        {es.app.name} · {es.app.portal}
      </p>
      <h1>{text.requestTitle}</h1>
      {sent ? (
        <p role="status" className="notice notice--success">
          {text.sent}
        </p>
      ) : (
        <form className="card stack" noValidate onSubmit={(event) => void onSubmit(event)}>
          <p>{text.requestIntro}</p>
          {error !== null && (
            <p role="alert" className="notice notice--error">
              {error}
            </p>
          )}
          <div className="field">
            <label htmlFor="reset-email">{es.login.email}</label>
            <input
              id="reset-email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              aria-invalid={missing}
              aria-describedby={missing ? 'reset-email-error' : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            {missing && (
              <p id="reset-email-error" className="field-error">
                {es.generic.field}
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? text.sending : text.submit}
          </button>
        </form>
      )}
      <p>
        <Link to="/login">{text.backToLogin}</Link>
      </p>
    </main>
  );
}
