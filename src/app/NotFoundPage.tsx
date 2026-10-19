import { Link } from 'react-router';

import { es } from '@/shared/presentation/i18n/es';

export function NotFoundPage() {
  return (
    <main>
      <h1>{es.notFound.title}</h1>
      <Link to="/">{es.notFound.back}</Link>
    </main>
  );
}
