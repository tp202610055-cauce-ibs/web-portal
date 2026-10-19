import { es } from '@/shared/presentation/i18n/es';

export function LoginPage() {
  return (
    <main>
      <p>
        {es.app.name} · {es.app.portal}
      </p>
      <h1>{es.login.title}</h1>
      <p>{es.login.pending}</p>
    </main>
  );
}
