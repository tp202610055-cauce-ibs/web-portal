import { NavLink, Outlet } from 'react-router';

import { es } from '@/shared/presentation/i18n/es';

// Layout of every protected screen: top bar with the product name and the main menu.
export function AppShell() {
  return (
    <>
      <header>
        <span>{es.app.name}</span>
        <nav aria-label={es.nav.label}>
          <NavLink to="/pacientes">{es.nav.patients}</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
