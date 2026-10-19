import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';
import { usePatientsPanel } from '@/modules/patients/presentation/usePatientsPanel';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const SKELETON_ROWS = 3;

// Triage panel (HU0018): shows the rows exactly in the order the server sends them.
export function PatientsPage() {
  const panel = usePatientsPanel();
  const { refetch } = panel;
  const { key } = useLocation();
  const firstKey = useRef(key);

  // Choosing the menu entry again, even on this same route, reloads the list.
  useEffect(() => {
    if (key !== firstKey.current) {
      void refetch();
    }
  }, [key, refetch]);

  return (
    <section aria-labelledby="patients-title" className="stack">
      <h1 id="patients-title">{es.patients.title}</h1>
      {panel.isPending ? (
        <PanelSkeleton />
      ) : panel.isError ? (
        <div role="alert" className="notice notice--error stack">
          <p>{es.patients.loadError}</p>
          <div>
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              {es.patients.retry}
            </button>
          </div>
        </div>
      ) : panel.data.length === 0 ? (
        <EmptyPanel />
      ) : (
        <PatientsTable patients={panel.data} />
      )}
    </section>
  );
}

function PanelSkeleton() {
  return (
    <div aria-busy="true" className="stack">
      <p role="status" className="visually-hidden">
        {es.generic.loading}
      </p>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="skeleton-row" />
      ))}
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="card stack">
      <p className="empty-title">{es.patients.empty}</p>
      <p>{es.patients.emptyHint}</p>
      <p>
        <Link to="/gestion-pacientes">{es.management.goToManagement}</Link>
      </p>
    </div>
  );
}

function formatActivity(value: Date | null): string {
  return value === null
    ? es.patients.noActivity
    : `${formatLimaDate(value)} ${formatLimaTime(value)}`;
}

function PatientsTable({ patients }: { readonly patients: AssignedPatient[] }) {
  const { columns } = es.patients;
  return (
    <table className="data-table">
      <caption className="visually-hidden">{es.patients.tableCaption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.name}</th>
          <th scope="col">{columns.subtype}</th>
          <th scope="col">{columns.score}</th>
          <th scope="col">{columns.lastActivity}</th>
          <th scope="col">{columns.priority}</th>
          <th scope="col">{columns.overdueReviews}</th>
          <th scope="col">{columns.profile}</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.patientUserId}>
            <th scope="row">{patient.fullName ?? es.patients.nameUnavailable}</th>
            <td>
              {patient.ibsSubtype === null ? es.patients.noSubtype : es.subtype[patient.ibsSubtype]}
            </td>
            <td>{patient.latestIbsSssScore ?? es.patients.noScore}</td>
            <td>{formatActivity(patient.lastActivityAt)}</td>
            <td>
              <span className={`badge badge--priority-${patient.priorityLevel.toLowerCase()}`}>
                {es.priority[patient.priorityLevel]}
              </span>
            </td>
            <td>{patient.pendingReviewOver24hCount}</td>
            <td>
              {patient.profileCompleted ? es.patients.profileComplete : es.patients.profilePending}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
