import type { IbsSssPoint } from '@/modules/patients/domain/PatientRecord';
import { formatLimaDate } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 24, right: 24, bottom: 40, left: 40 };
// IBS-SSS ranges from 0 to 500; a fixed scale keeps charts of different patients comparable.
const MAX_SCORE = 500;

interface IbsSssChartProps {
  readonly points: IbsSssPoint[];
}

// Own SVG line chart with an equivalent table, so screen readers get the same data.
export function IbsSssChart({ points }: IbsSssChartProps) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const coordinates = points.map((point, index) => ({
    point,
    x: PADDING.left + index * step,
    y: PADDING.top + innerHeight * (1 - point.totalScore / MAX_SCORE),
  }));
  const baseline = PADDING.top + innerHeight;

  return (
    <figure className="stack">
      <svg
        className="chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby="ibs-sss-chart-title"
      >
        <title id="ibs-sss-chart-title">{es.evolution.chartTitle}</title>
        <line
          className="chart-axis"
          x1={PADDING.left}
          y1={baseline}
          x2={WIDTH - PADDING.right}
          y2={baseline}
        />
        <polyline
          className="chart-line"
          points={coordinates.map(({ x, y }) => `${x},${y}`).join(' ')}
        />
        {coordinates.map(({ point, x, y }) => (
          <g key={point.assessmentId}>
            <circle className="chart-point" cx={x} cy={y} r={5} />
            <text className="chart-label" x={x} y={y - 10} textAnchor="middle">
              {point.totalScore}
            </text>
            <text className="chart-label" x={x} y={baseline + 20} textAnchor="middle">
              {formatLimaDate(point.completedAt)}
            </text>
          </g>
        ))}
      </svg>
      <table className="data-table">
        <caption>{es.evolution.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{es.evolution.columns.date}</th>
            <th scope="col">{es.evolution.columns.score}</th>
            <th scope="col">{es.evolution.columns.type}</th>
            <th scope="col">{es.evolution.columns.category}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.assessmentId}>
              <td>{formatLimaDate(point.completedAt)}</td>
              <td>{point.totalScore}</td>
              <td>{es.assessmentType[point.type]}</td>
              <td>{point.severity === null ? '' : es.ibsSssSeverity[point.severity]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
