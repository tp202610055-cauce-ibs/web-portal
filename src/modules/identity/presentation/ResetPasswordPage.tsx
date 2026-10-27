import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { PasswordResetRefusedError } from '@/modules/identity/domain/PasswordReset';
import { usePasswordResetGateway } from '@/modules/identity/presentation/PasswordResetContext';
import { es } from '@/shared/presentation/i18n/es';

const { passwordReset: text } = es;

type Phase = 'checking' | 'unavailable' | 'invalid' | 'form' | 'done';

// The email link (/auth/password-reset?token=…), the path the backend builds for the portal. The
// token is read once, kept in memory and taken out of the URL; the link is checked before the form.
export function ResetPasswordPage() {
  const gateway = usePasswordResetGateway();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token] = useState(() => params.get('token'));
  const [phase, setPhase] = useState<Phase>(
    token === null || token === '' ? 'invalid' : 'checking',
  );

  // Each attempt checks the link once; the state changes only when the answer arrives.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (token === null || token === '') {
      return;
    }
    let current = true;
    gateway.validate(token).then(
      () => current && setPhase('form'),
      (error: unknown) =>
        current && setPhase(error instanceof PasswordResetRefusedError ? 'invalid' : 'unavailable'),
    );
    return () => {
      current = false;
    };
  }, [gateway, token, attempt]);

  function retry() {
    setPhase('checking');
    setAttempt((value) => value + 1);
  }

  useEffect(() => {
    if (params.has('token')) {
      void navigate('/auth/password-reset', { replace: true });
    }
  }, [navigate, params]);

  let content;
  switch (phase) {
    case 'checking':
      content = <p role="status">{text.checking}</p>;
      break;
    case 'unavailable':
      content = (
        <div role="alert" className="notice notice--error stack">
          <p>{es.session.unavailable}</p>
          <div>
            <button type="button" className="btn-secondary" onClick={retry}>
              {es.session.retry}
            </button>
          </div>
        </div>
      );
      break;
    case 'invalid':
      content = (
        <div role="alert" className="notice notice--error stack">
          <p>{text.invalidLink}</p>
          <p>
            <Link to="/recuperar-contrasena">{text.requestNew}</Link>
          </p>
        </div>
      );
      break;
    case 'done':
      content = (
        <div role="status" className="notice notice--success stack">
          <p>{text.done}</p>
          <p>
            <Link to="/login">{text.goToLogin}</Link>
          </p>
        </div>
      );
      break;
    case 'form':
      content = (
        <NewPasswordForm
          token={token ?? ''}
          onDone={() => setPhase('done')}
          onInvalidLink={() => setPhase('invalid')}
        />
      );
  }

  return (
    <main className="login">
      <p>
        {es.app.name} · {es.app.portal}
      </p>
      <h1>{text.resetTitle}</h1>
      {content}
    </main>
  );
}

interface NewPasswordFormProps {
  readonly token: string;
  readonly onDone: () => void;
  readonly onInvalidLink: () => void;
}

// The password rules are the server's; its messages are shown as they arrive.
function NewPasswordForm({ token, onDone, onInvalidLink }: NewPasswordFormProps) {
  const gateway = usePasswordResetGateway();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (password === '') {
      setProblem(es.generic.field);
      return;
    }
    if (password !== confirmation) {
      setProblem(text.mismatch);
      return;
    }
    setProblem(null);
    setSubmitting(true);
    try {
      await gateway.confirm(token, password);
      onDone();
    } catch (error) {
      if (error instanceof PasswordResetRefusedError && error.failure.kind === 'invalid-link') {
        onInvalidLink();
        return;
      }
      if (error instanceof PasswordResetRefusedError && error.failure.kind === 'invalid-password') {
        setProblem(error.failure.messages.join(' ') || es.generic.field);
      } else if (error instanceof PasswordResetRefusedError) {
        setProblem(es.login.rateLimited);
      } else {
        setProblem(es.generic.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" noValidate onSubmit={(event) => void onSubmit(event)}>
      {problem !== null && (
        <p id="reset-error" role="alert" className="notice notice--error">
          {problem}
        </p>
      )}
      <div className="field">
        <label htmlFor="reset-password">{text.newPassword}</label>
        <input
          id="reset-password"
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          aria-describedby={problem === null ? undefined : 'reset-error'}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="reset-confirmation">{text.confirmPassword}</label>
        <input
          id="reset-confirmation"
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          aria-describedby={problem === null ? undefined : 'reset-error'}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? text.saving : text.save}
      </button>
    </form>
  );
}
