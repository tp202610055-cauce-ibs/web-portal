import { InvitationCodeGenerator } from '@/modules/identity';
import { es } from '@/shared/presentation/i18n/es';

// Patient management (HU0019): invitation codes are issued by the identity module.
export function PatientManagementPage() {
  return (
    <section aria-labelledby="management-title" className="stack">
      <h1 id="management-title">{es.management.title}</h1>
      <p>{es.management.intro}</p>
      <InvitationCodeGenerator />
    </section>
  );
}
