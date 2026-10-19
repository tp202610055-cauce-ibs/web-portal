import type { PatientEvolution as Evolution } from '@/modules/patients/domain/PatientRecord';
import { IbsSssChart } from '@/modules/patients/presentation/IbsSssChart';
import { LoadFailure } from '@/modules/patients/presentation/LoadFailure';
import { usePatientEvolution } from '@/modules/patients/presentation/usePatientRecord';
import { formatLimaDate } from '@/shared/presentation/format/limaTime';
import { formatCalendarDate, formatOneDecimal } from '@/shared/presentation/format/numbers';
import { es } from '@/shared/presentation/i18n/es';

const { evolution: text } = es;

// The server's percentage, only formatted: negative is a reduction; 0.0 after rounding is no change.
export function describeChange(percent: number): string {
  const rounded = Math.round(Math.abs(percent) * 10) / 10;
  if (rounded === 0) {
    return text.noChange;
  }
  const value = formatOneDecimal(rounded);
  return percent < 0 ? text.reduction(value) : text.increase(value);
}

export function PatientEvolution({ patientId }: { readonly patientId: string }) {
  const evolution = usePatientEvolution(patientId);
  if (evolution.isPending) {
    return <p role="status">{es.generic.loading}</p>;
  }
  if (evolution.isError) {
    return (
      <LoadFailure
        error={evolution.error}
        message={text.loadError}
        onRetry={() => void evolution.refetch()}
      />
    );
  }
  return <EvolutionData evolution={evolution.data} />;
}

function EvolutionData({ evolution }: { readonly evolution: Evolution }) {
  const [first] = evolution.timeline;
  if (first === undefined) {
    return <p>{es.record.noAssessments}</p>;
  }
  // With a single point the server reports 0 %, not null: the count decides, not the percentage.
  if (evolution.timeline.length === 1) {
    return (
      <div className="card stack">
        <p>{text.baseline(first.totalScore, formatLimaDate(first.completedAt))}</p>
        <p>{text.onlyBaseline}</p>
        {first.nextAssessmentDate !== null && (
          <p>{text.nextAssessment(formatCalendarDate(first.nextAssessmentDate))}</p>
        )}
      </div>
    );
  }
  return (
    <div className="stack">
      <ul className="card stack">
        {evolution.percentChangeFromBaseline !== null && (
          <li>
            {text.changeLabel}: {describeChange(evolution.percentChangeFromBaseline)}
          </li>
        )}
        <li>{text.frequency(evolution.registrationFrequency14d)}</li>
        {evolution.significantClinicalResponse && (
          <li>
            <span className="badge badge--success">{text.significantResponse}</span>
          </li>
        )}
      </ul>
      <IbsSssChart points={evolution.timeline} />
    </div>
  );
}
