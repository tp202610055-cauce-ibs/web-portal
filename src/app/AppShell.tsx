import { NavLink, Outlet } from 'react-router';

import { LogoutButton, useSession } from '@/modules/identity';
import { es } from '@/shared/presentation/i18n/es';

// Layout of every protected screen: product name, main menu, the signed-in name and sign-out.
export function AppShell() {
  const session = useSession();
  const fullName = session.status === 'authenticated' ? session.user.fullName : '';
  return (
    <>
      <header>
        <span>{es.app.name}</span>
        <nav aria-label={es.nav.label}>
          <NavLink to="/pacientes">{es.nav.patients}</NavLink>
          <NavLink to="/gestion-pacientes">{es.nav.management}</NavLink>
        </nav>
        <div className="shell-user">
          <span>
            <span className="visually-hidden">{es.session.signedInAs} </span>
            {fullName}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
