import { es } from '@/shared/presentation/i18n/es';

// Placeholder for the triage panel; patient data arrives with its own block.
export function PatientsPage() {
  return (
    <section aria-labelledby="patients-title">
      <h1 id="patients-title">{es.patients.title}</h1>
    </section>
  );
}
