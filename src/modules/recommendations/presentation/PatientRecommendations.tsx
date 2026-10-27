import { Link } from 'react-router';

import { splitByActivity } from '@/modules/recommendations/application/patientRecommendations';
import type { PatientRecommendation } from '@/modules/recommendations/domain/Recommendation';
import { StatusBadge } from '@/modules/recommendations/presentation/RecommendationBadges';
import { usePatientRecommendations } from '@/modules/recommendations/presentation/usePatientRecommendations';
import { formatLimaDate } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const { patientRecommendations: text } = es;

// Recommendations tab of the record: active ones and the archived history, as the server flags them.
// The full content opens in the recommendation screen; the URL carries only its UUID.
export function PatientRecommendations({ patientId }: { readonly patientId: string }) {
  const list = usePatientRecommendations(patientId);
  let content;
  if (list.isPending) {
    content = <p role="status">{es.generic.loading}</p>;
  } else if (list.isError) {
    content = (
      <div role="alert" className="notice notice--error stack">
        <p>{text.loadError}</p>
        <div>
          <button type="button" className="btn-secondary" onClick={() => void list.refetch()}>
            {text.retry}
          </button>
        </div>
      </div>
    );
  } else {
    const { active, archived } = splitByActivity(list.data.items);
    content = (
      <>
        {list.data.totalCount > list.data.items.length && (
          <p className="notice notice--info">
            {text.truncated(list.data.items.length, list.data.totalCount)}
          </p>
        )}
        <section aria-labelledby="recommendations-active" className="stack">
          <h3 id="recommendations-active">{text.activeTitle}</h3>
          {active.length === 0 ? (
            <p>{text.noActive}</p>
          ) : (
            <RecommendationsTable caption={text.activeCaption} rows={active} archived={false} />
          )}
        </section>
        <section aria-labelledby="recommendations-archived" className="stack">
          <h3 id="recommendations-archived">{text.archivedTitle}</h3>
          {archived.length === 0 ? (
            <p>{text.noArchived}</p>
          ) : (
            <RecommendationsTable caption={text.archivedCaption} rows={archived} archived />
          )}
        </section>
      </>
    );
  }
  return (
    <section aria-labelledby="patient-recommendations" className="card stack">
      <h2 id="patient-recommendations">{text.title}</h2>
      <div>
        <Link className="btn-primary" to={`/pacientes/${patientId}/recomendaciones/nueva`}>
          {text.create}
        </Link>
      </div>
      {content}
    </section>
  );
}

function RecommendationsTable({
  caption,
  rows,
  archived,
}: {
  readonly caption: string;
  readonly rows: PatientRecommendation[];
  readonly archived: boolean;
}) {
  const columns = text.columns;
  return (
    <table className="data-table">
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columns.title}</th>
          <th scope="col">{columns.status}</th>
          <th scope="col">{columns.source}</th>
          <th scope="col">{columns.items}</th>
          <th scope="col">{columns.generatedAt}</th>
          {archived ? (
            <>
              <th scope="col">{columns.archivedAt}</th>
              <th scope="col">{columns.reason}</th>
            </>
          ) : (
            <th scope="col">{columns.validUntil}</th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.recommendationId}>
            <th scope="row">
              <Link to={`/recomendaciones/${row.recommendationId}`}>
                {row.title ?? es.recommendation.fallbackTitle}
              </Link>
            </th>
            <td>
              <StatusBadge status={row.status} />
            </td>
            <td>{es.recommendationSource[row.source]}</td>
            <td>{row.itemsCount}</td>
            <td>{formatLimaDate(row.generatedAt)}</td>
            {archived ? (
              <>
                <td>{row.archivedAt === null ? '' : formatLimaDate(row.archivedAt)}</td>
                <td>{row.archiveReason === null ? '' : es.archiveReason[row.archiveReason]}</td>
              </>
            ) : (
              <td>
                {row.validUntil === null ? text.noValidUntil : formatLimaDate(row.validUntil)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
