import { Link } from 'react-router';

import { usePatientDetail } from '@/modules/patients';
import { shownConfidence } from '@/modules/recommendations/domain/confidenceLevel';
import type {
  RecommendationDetail,
  RecommendationItem,
  SupportingData,
} from '@/modules/recommendations/domain/Recommendation';
import {
  ConfidenceBadge,
  StatusBadge,
} from '@/modules/recommendations/presentation/RecommendationBadges';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const { recommendation: copy } = es;

function formatInstant(value: Date): string {
  return copy.dateTime(formatLimaDate(value), formatLimaTime(value));
}

// Read-only content of a recommendation: what the patient would receive and why it was generated.
export function RecommendationContent({ detail }: { readonly detail: RecommendationDetail }) {
  const confidence = shownConfidence(detail.source, detail.confidenceScore);
  return (
    <div className="stack">
      <dl className="details">
        <dt>{copy.status}</dt>
        <dd>
          <StatusBadge status={detail.status} />
        </dd>
        {confidence !== null && (
          <>
            <dt>{copy.confidence}</dt>
            <dd>
              <ConfidenceBadge level={confidence} score={detail.confidenceScore} />
            </dd>
          </>
        )}
        <dt>{copy.patient}</dt>
        <dd>
          <PatientReference patientId={detail.patientId} />
        </dd>
        <dt>{copy.generatedAt}</dt>
        <dd>{formatInstant(detail.generatedAt)}</dd>
        <dt>{copy.expiresAt}</dt>
        <dd>{detail.expiresAt === null ? copy.noExpiry : formatInstant(detail.expiresAt)}</dd>
        {detail.modelVersionName !== null && (
          <>
            <dt>{copy.model}</dt>
            <dd>{detail.modelVersionName}</dd>
          </>
        )}
        {detail.reviewedAt !== null && (
          <>
            <dt>{copy.reviewedAt}</dt>
            <dd>{formatInstant(detail.reviewedAt)}</dd>
          </>
        )}
        {detail.reviewedByNutritionistName !== null && (
          <>
            <dt>{copy.reviewedBy}</dt>
            <dd>{detail.reviewedByNutritionistName}</dd>
          </>
        )}
      </dl>
      {detail.description !== null && <p>{detail.description}</p>}
      <section aria-labelledby="recommendation-steps" className="card stack">
        <h2 id="recommendation-steps">{copy.stepsTitle}</h2>
        {detail.steps.length === 0 ? (
          <p>{copy.noSteps}</p>
        ) : (
          <ol>
            {detail.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </section>
      <section aria-labelledby="recommendation-items" className="card stack">
        <h2 id="recommendation-items">{copy.itemsTitle}</h2>
        <ItemsTable items={detail.items} />
      </section>
      <section aria-labelledby="recommendation-explanation" className="card stack">
        <h2 id="recommendation-explanation">{copy.explanationTitle}</h2>
        <p>
          {copy.explanationSource}: {es.explanationSource[detail.explanationSource]}
        </p>
        <p>{detail.aiExplanation ?? copy.noExplanation}</p>
      </section>
      <section aria-labelledby="recommendation-supporting" className="card stack">
        <h2 id="recommendation-supporting">{copy.supportingTitle}</h2>
        <SupportingFigures data={detail.supportingData} />
      </section>
      {detail.nutritionistNote !== null && (
        <section aria-labelledby="recommendation-note" className="card stack">
          <h2 id="recommendation-note">{copy.noteTitle}</h2>
          <p>{detail.nutritionistNote}</p>
        </section>
      )}
    </div>
  );
}

// The name is secondary: while it loads, or if it fails, only the link to the record is shown.
function PatientReference({ patientId }: { readonly patientId: string }) {
  const patient = usePatientDetail(patientId);
  const name = patient.data?.fullName ?? null;
  return (
    <>
      {name !== null && <span>{name} · </span>}
      <Link to={`/pacientes/${patientId}`}>{copy.viewPatient}</Link>
    </>
  );
}

function ItemsTable({ items }: { readonly items: RecommendationItem[] }) {
  if (items.length === 0) {
    return <p>{copy.noItems}</p>;
  }
  const { itemColumns } = copy;
  return (
    <table className="data-table">
      <caption className="visually-hidden">{copy.itemsCaption}</caption>
      <thead>
        <tr>
          <th scope="col">{itemColumns.food}</th>
          <th scope="col">{itemColumns.action}</th>
          <th scope="col">{itemColumns.reasoning}</th>
          <th scope="col">{itemColumns.substitute}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.recommendationItemId}>
            <th scope="row">{item.foodName ?? copy.unnamedFood}</th>
            <td>{es.foodAction[item.action]}</td>
            <td>{item.reasoning ?? copy.noReasoning}</td>
            <td>{item.substituteFoodName ?? copy.noSubstitute}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SupportingFigures({ data }: { readonly data: SupportingData }) {
  return (
    <dl className="details">
      <dt>{copy.window}</dt>
      <dd>{copy.windowValue(formatLimaDate(data.windowFrom), formatLimaDate(data.windowTo))}</dd>
      <dt>{copy.symptoms}</dt>
      <dd>{data.symptomCount}</dd>
      <dt>{copy.meals}</dt>
      <dd>{data.mealCount}</dd>
      <dt>{copy.topFoods}</dt>
      <dd>
        {data.topHighFodmapFoods.length === 0
          ? copy.noTopFoods
          : data.topHighFodmapFoods.join(', ')}
      </dd>
      <dt>{copy.correlationWindow}</dt>
      <dd>{copy.hours(data.correlationWindowHours)}</dd>
    </dl>
  );
}
