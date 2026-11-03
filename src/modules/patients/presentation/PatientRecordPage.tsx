import { Link, useLocation, useParams } from 'react-router';

import { isPatientId } from '@/modules/patients/application/getPatientRecord';
import { RecordTabs, type RecordTab } from '@/modules/patients/presentation/RecordTabs';
import { usePatientDetail } from '@/modules/patients/presentation/usePatientRecord';
import { ReportGenerator } from '@/modules/reports';
import { es } from '@/shared/presentation/i18n/es';

// Navigation state, never the URL: which tab to open and a confirmation to show once.
export interface RecordLocationState {
  readonly tab?: string;
  readonly notice?: string;
}

function readState(state: unknown): RecordLocationState {
  if (typeof state !== 'object' || state === null) {
    return {};
  }
  const { tab, notice } = state as Record<string, unknown>;
  return {
    tab: typeof tab === 'string' ? tab : undefined,
    notice: typeof notice === 'string' ? notice : undefined,
  };
}

interface PatientRecordPageProps {
  readonly extraTabs?: readonly RecordTab[];
}

// Patient record (/pacientes/:patientId). Only the UUID travels in the URL; the name never does.
export function PatientRecordPage({ extraTabs }: PatientRecordPageProps) {
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
  return <PatientRecord key={patientId} patientId={patientId} extraTabs={extraTabs} />;
}

function PatientRecord({
  patientId,
  extraTabs,
}: {
  readonly patientId: string;
  readonly extraTabs?: readonly RecordTab[];
}) {
  const detail = usePatientDetail(patientId);
  const { state } = useLocation();
  const { tab, notice } = readState(state);
  return (
    <section aria-labelledby="record-title" className="stack">
      <p>
        <Link to="/pacientes">{es.record.backToPanel}</Link>
      </p>
      <h1 id="record-title">{detail.data?.fullName ?? es.record.fallbackTitle}</h1>
      {notice !== undefined && (
        <p role="status" className="notice notice--success">
          {notice}
        </p>
      )}
      <ReportGenerator patientId={patientId} />
      <RecordTabs patientId={patientId} extraTabs={extraTabs} initialTab={tab} />
    </section>
  );
}
