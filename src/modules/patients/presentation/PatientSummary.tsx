import type { PatientDetail } from '@/modules/patients/domain/PatientRecord';
import { LoadFailure } from '@/modules/patients/presentation/LoadFailure';
import {
  usePatientDetail,
  usePatientEvolution,
} from '@/modules/patients/presentation/usePatientRecord';
import { formatLimaDate } from '@/shared/presentation/format/limaTime';
import { formatCalendarDate, formatOneDecimal } from '@/shared/presentation/format/numbers';
import { es } from '@/shared/presentation/i18n/es';

const { record } = es;

export function PatientSummary({ patientId }: { readonly patientId: string }) {
  const detail = usePatientDetail(patientId);
  return (
    <div className="stack">
      <LatestIbsSss patientId={patientId} />
      {detail.isPending ? (
        <p role="status">{es.generic.loading}</p>
      ) : detail.isError ? (
        <LoadFailure
          error={detail.error}
          message={record.loadError}
          onRetry={() => void detail.refetch()}
        />
      ) : (
        <DetailData detail={detail.data} />
      )}
    </div>
  );
}

// The latest score comes from the same cached evolution query as the Evolution tab.
function LatestIbsSss({ patientId }: { readonly patientId: string }) {
  const evolution = usePatientEvolution(patientId);
  let content;
  if (evolution.isPending) {
    content = <p role="status">{es.generic.loading}</p>;
  } else if (evolution.isError) {
    content = (
      <LoadFailure
        error={evolution.error}
        message={record.ibsSssLoadError}
        onRetry={() => void evolution.refetch()}
      />
    );
  } else {
    const latest = evolution.data.timeline.at(-1);
    content =
      latest === undefined ? (
        <p>{record.noAssessments}</p>
      ) : (
        <p>
          {record.latestIbsSssValue(
            latest.totalScore,
            formatLimaDate(latest.completedAt),
            es.assessmentType[latest.type],
          )}
        </p>
      );
  }
  return (
    <section aria-labelledby="latest-ibs-sss" className="card stack">
      <h2 id="latest-ibs-sss">{record.latestIbsSss}</h2>
      {content}
    </section>
  );
}

function orNoData(value: string | null): string {
  return value ?? record.noData;
}

function DetailData({ detail }: { readonly detail: PatientDetail }) {
  const bmi =
    detail.bmi === null
      ? null
      : [
          record.bmiValue(formatOneDecimal(detail.bmi)),
          detail.bmiCategory === null ? null : es.bmiCategory[detail.bmiCategory],
        ]
          .filter((part) => part !== null)
          .join(' · ');
  return (
    <>
      {!detail.onboardingCompleted && (
        <p className="notice notice--info">{record.profilePending}</p>
      )}
      <dl className="card details">
        <dt>{record.linkedSince}</dt>
        <dd>{formatLimaDate(detail.assignedAt)}</dd>
        <dt>{record.fields.age}</dt>
        <dd>{orNoData(detail.age === null ? null : record.ageYears(detail.age))}</dd>
        <dt>{record.fields.sex}</dt>
        <dd>{orNoData(detail.biologicalSex === null ? null : es.sex[detail.biologicalSex])}</dd>
        <dt>{record.fields.subtype}</dt>
        <dd>{orNoData(detail.ibsSubtype === null ? null : es.subtype[detail.ibsSubtype])}</dd>
        <dt>{record.fields.bmi}</dt>
        <dd>{orNoData(bmi)}</dd>
        <dt>{record.fields.diagnosisDate}</dt>
        <dd>
          {orNoData(
            detail.diagnosisDate === null ? null : formatCalendarDate(detail.diagnosisDate),
          )}
        </dd>
        <dt>{record.fields.medications}</dt>
        <dd>{orNoData(detail.medications)}</dd>
      </dl>
      <section aria-labelledby="allergies-title" className="card stack">
        <h2 id="allergies-title">{record.allergiesTitle}</h2>
        {detail.allergies.length === 0 ? (
          <p>{record.noAllergies}</p>
        ) : (
          <ul>
            {detail.allergies.map((allergy) => (
              <li key={allergy.patientAllergyId}>
                {[
                  allergy.name ?? record.allergyUnnamed,
                  es.allergyType[allergy.type],
                  es.allergySeverity[allergy.severity],
                  allergy.notes,
                ]
                  .filter((part) => part !== null && part !== '')
                  .join(' · ')}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
