import { Link, useParams } from 'react-router';

import { isPatientId } from '@/modules/patients/application/getPatientRecord';
import { RecordTabs } from '@/modules/patients/presentation/RecordTabs';
import { usePatientDetail } from '@/modules/patients/presentation/usePatientRecord';
import { es } from '@/shared/presentation/i18n/es';

// Patient record (/pacientes/:patientId). Only the UUID travels in the URL; the name never does.
export function PatientRecordPage() {
  const { patientId } = useParams();
  if (!isPatientId(patientId)) {
    return (
      <section className="stack">
        <h1>{es.record.notFound}</h1>
        <p>
          <Link to="/pacientes">{es.record.backToPanel}</Link>
        </p>
      </section>
    );
  }
  return <PatientRecord patientId={patientId} />;
}

function PatientRecord({ patientId }: { readonly patientId: string }) {
  const detail = usePatientDetail(patientId);
  return (
    <section aria-labelledby="record-title" className="stack">
      <p>
        <Link to="/pacientes">{es.record.backToPanel}</Link>
      </p>
      <h1 id="record-title">{detail.data?.fullName ?? es.record.fallbackTitle}</h1>
      <RecordTabs patientId={patientId} />
    </section>
  );
}
