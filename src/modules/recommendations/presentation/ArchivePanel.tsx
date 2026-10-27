import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  DecisionRefusedError,
  MANUAL_ARCHIVE_REASONS,
  type ArchiveReason,
} from '@/modules/recommendations/domain/Recommendation';
import { useArchiveRecommendation } from '@/modules/recommendations/presentation/usePatientRecommendations';
import { es } from '@/shared/presentation/i18n/es';

const { archive: text } = es;

function failureMessage(error: unknown): string {
  if (!(error instanceof DecisionRefusedError)) {
    return es.generic.error;
  }
  switch (error.failure.kind) {
    case 'not-archivable':
    case 'state-conflict':
      return text.notArchivable;
    case 'access-denied':
      return es.decision.accessDenied;
    case 'not-found':
      return es.decision.notFound;
    default:
      return es.generic.error;
  }
}

interface ArchivePanelProps {
  readonly recommendationId: string;
  readonly patientId: string;
}

// HU0030: shown only when allowedActions lists Archive. On success the record opens on its
// recommendations, where the archived one now appears in the history.
export function ArchivePanel({ recommendationId, patientId }: ArchivePanelProps) {
  const navigate = useNavigate();
  const archive = useArchiveRecommendation(recommendationId, patientId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ArchiveReason | ''>('');
  const [missing, setMissing] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (archive.isPending) {
      return;
    }
    if (reason === '') {
      setMissing(true);
      return;
    }
    archive.mutate(reason, {
      onSuccess: () =>
        void navigate(`/pacientes/${patientId}`, {
          state: { tab: 'recommendations', notice: es.patientRecommendations.archived },
        }),
    });
  }

  if (!open) {
    return (
      <div className="actions">
        <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
          {text.open}
        </button>
      </div>
    );
  }
  return (
    <form className="stack" noValidate onSubmit={submit}>
      {archive.isError && (
        <p role="alert" className="notice notice--error">
          {failureMessage(archive.error)}
        </p>
      )}
      <div className="field">
        <label htmlFor="archive-reason">{text.reasonLabel}</label>
        <select
          id="archive-reason"
          className="input"
          value={reason}
          aria-invalid={missing && reason === ''}
          aria-describedby={missing && reason === '' ? 'archive-reason-error' : undefined}
          onChange={(event) => {
            setReason(event.target.value as ArchiveReason | '');
            archive.reset();
          }}
        >
          <option value="">{text.reasonPlaceholder}</option>
          {MANUAL_ARCHIVE_REASONS.map((value) => (
            <option key={value} value={value}>
              {es.archiveReason[value]}
            </option>
          ))}
        </select>
        {missing && reason === '' && (
          <p id="archive-reason-error" role="alert" className="field-error">
            {text.reasonRequired}
          </p>
        )}
      </div>
      <div className="actions">
        <button
          type="button"
          className="btn-tertiary"
          onClick={() => {
            setOpen(false);
            setMissing(false);
            archive.reset();
          }}
        >
          {text.cancel}
        </button>
        <button type="submit" className="btn-primary" disabled={archive.isPending}>
          {archive.isPending ? text.sending : text.confirm}
        </button>
      </div>
    </form>
  );
}
