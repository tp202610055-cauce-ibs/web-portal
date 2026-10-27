import { useMutation } from '@tanstack/react-query';
import { useRef, useState, type FormEvent } from 'react';

import {
  checkPeriod,
  ReportRefusedError,
  type PeriodProblem,
} from '@/modules/reports/domain/ClinicalReport';
import { useReportsGateway } from '@/modules/reports/presentation/ReportsContext';
import { formatLimaDate, formatLimaTime, todayInLima } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const { reports: text } = es;

const PROBLEM: Record<PeriodProblem, string> = {
  required: text.required,
  order: text.order,
  future: text.future,
};

function refusalMessage(error: unknown): string[] {
  if (!(error instanceof ReportRefusedError)) {
    return [es.generic.error];
  }
  switch (error.reason) {
    case 'no-data':
      return [text.noData, text.widenHint];
    case 'invalid-period':
      return [text.invalidPeriod];
    case 'access-denied':
      return [text.accessDenied];
  }
}

interface ReportGeneratorProps {
  readonly patientId: string;
  // Today in Lima as YYYY-MM-DD; tests fix it, the record passes nothing.
  readonly today?: string;
}

// HU0022: the nutritionist picks a period and gets the encrypted PDF; its password goes by email.
// The download link stays only in memory and is dropped when the form closes.
export function ReportGenerator({ patientId, today }: ReportGeneratorProps) {
  const gateway = useReportsGateway();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [problem, setProblem] = useState<PeriodProblem | null>(null);
  const attempt = useRef<{ period: string; key: string } | null>(null);
  const generation = useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => {
      const period = `${from}/${to}`;
      if (attempt.current?.period !== period) {
        attempt.current = { period, key: crypto.randomUUID() };
      }
      return gateway.generate(patientId, from, to, attempt.current.key);
    },
  });

  function close() {
    setOpen(false);
    setProblem(null);
    generation.reset();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (generation.isPending) {
      return;
    }
    const found = checkPeriod(start, end, today ?? todayInLima(new Date()));
    setProblem(found);
    if (found === null) {
      generation.mutate({ from: start, to: end });
    } else {
      generation.reset();
    }
  }

  if (!open) {
    return (
      <div>
        <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
          {text.open}
        </button>
      </div>
    );
  }
  const messages =
    problem !== null
      ? [PROBLEM[problem]]
      : generation.isError
        ? refusalMessage(generation.error)
        : [];
  return (
    <section aria-labelledby="report-title" className="card stack">
      <h2 id="report-title">{text.title}</h2>
      <form className="stack" noValidate onSubmit={submit}>
        {messages.length > 0 && (
          <div role="alert" className="notice notice--error stack">
            {messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div className="actions">
          <div className="field">
            <label htmlFor="report-from">{text.from}</label>
            <input
              id="report-from"
              className="input"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="report-to">{text.to}</label>
            <input
              id="report-to"
              className="input"
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
        </div>
        <div className="actions">
          <button type="button" className="btn-tertiary" onClick={close}>
            {text.cancel}
          </button>
          <button type="submit" className="btn-primary" disabled={generation.isPending}>
            {generation.isPending ? text.sending : text.submit}
          </button>
        </div>
      </form>
      {generation.isSuccess && (
        <div role="status" className="notice notice--success stack">
          <p>{text.ready}</p>
          <p>
            <a className="btn-primary" href={generation.data.downloadUrl} download>
              {text.download}
            </a>
          </p>
          <p>{text.passwordByEmail}</p>
          <p>
            {text.linkExpires(
              formatLimaDate(generation.data.expiresAt),
              formatLimaTime(generation.data.expiresAt),
            )}
          </p>
        </div>
      )}
    </section>
  );
}
