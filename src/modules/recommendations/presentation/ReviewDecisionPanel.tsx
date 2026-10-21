import { useEffect, useRef, useState, type FormEvent } from 'react';

import type { ReviewDecision } from '@/modules/recommendations/application/reviewRecommendations';
import {
  checkClinicalNote,
  type ClinicalNoteProblem,
} from '@/modules/recommendations/domain/clinicalNote';
import {
  DecisionRefusedError,
  type RecommendationAction,
} from '@/modules/recommendations/domain/Recommendation';
import type { DecisionInput } from '@/modules/recommendations/presentation/useRecommendationReview';
import { es } from '@/shared/presentation/i18n/es';

const PROBLEM_MESSAGE: Record<ClinicalNoteProblem, string> = {
  empty: es.decision.noteEmpty,
  'too-short': es.decision.noteTooShort,
  'too-long': es.decision.noteTooLong,
};

interface ReviewDecisionPanelProps {
  readonly actions: RecommendationAction[];
  readonly submitting: boolean;
  readonly error: unknown;
  readonly onSubmit: (input: DecisionInput) => void;
  readonly onDismissError: () => void;
}

// The server's own text when it refuses the note; the client check only warns before sending.
function serverNoteMessage(error: unknown): string | null {
  if (!(error instanceof DecisionRefusedError) || error.failure.kind !== 'invalid-note') {
    return null;
  }
  return error.failure.messages.join(' ') || es.generic.field;
}

// Failures the user can fix by confirming again; the page reports the rest.
function retryMessage(error: unknown): string | null {
  if (error === null) {
    return null;
  }
  if (error instanceof DecisionRefusedError) {
    return error.failure.kind === 'idempotency-mismatch' ? es.decision.retryAgain : null;
  }
  return es.generic.error;
}

// Approve and reject appear only when allowedActions lists them; both need a clinical note.
export function ReviewDecisionPanel({
  actions,
  submitting,
  error,
  onSubmit,
  onDismissError,
}: ReviewDecisionPanelProps) {
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [note, setNote] = useState('');
  const [problem, setProblem] = useState<ClinicalNoteProblem | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const approveRef = useRef<HTMLButtonElement>(null);
  const rejectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (decision !== null) {
      noteRef.current?.focus();
    }
  }, [decision]);

  const canApprove = actions.includes('Approve');
  const canReject = actions.includes('Reject');
  if (!canApprove && !canReject) {
    return null;
  }

  function open(next: ReviewDecision) {
    setDecision(next);
    setProblem(null);
    onDismissError();
  }

  function cancel() {
    const opener = decision === 'approve' ? approveRef : rejectRef;
    setDecision(null);
    setProblem(null);
    onDismissError();
    opener.current?.focus();
  }

  function changeNote(value: string) {
    setNote(value);
    if (problem !== null) {
      setProblem(checkClinicalNote(value));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (decision === null || submitting) {
      return;
    }
    const found = checkClinicalNote(note);
    setProblem(found);
    if (found !== null) {
      onDismissError();
      noteRef.current?.focus();
      return;
    }
    onSubmit({ decision, note });
  }

  const fieldMessage = problem === null ? serverNoteMessage(error) : PROBLEM_MESSAGE[problem];
  const formMessage = retryMessage(error);
  const describedBy = ['decision-note-hint', fieldMessage === null ? null : 'decision-note-error']
    .filter((id) => id !== null)
    .join(' ');

  return (
    <div className="stack">
      <div className="actions">
        {canApprove && (
          <button
            ref={approveRef}
            type="button"
            className={decision === 'approve' ? 'btn-primary' : 'btn-secondary'}
            aria-expanded={decision === 'approve'}
            onClick={() => open('approve')}
          >
            {es.decision.approve}
          </button>
        )}
        {canReject && (
          <button
            ref={rejectRef}
            type="button"
            className={decision === 'reject' ? 'btn-primary' : 'btn-secondary'}
            aria-expanded={decision === 'reject'}
            onClick={() => open('reject')}
          >
            {es.decision.reject}
          </button>
        )}
      </div>
      {decision !== null && (
        <form className="stack" noValidate onSubmit={submit}>
          {formMessage !== null && (
            <p role="alert" className="notice notice--error">
              {formMessage}
            </p>
          )}
          <div className="field">
            <label htmlFor="decision-note">{es.decision.noteLabel}</label>
            <textarea
              ref={noteRef}
              id="decision-note"
              className="textarea"
              value={note}
              aria-invalid={fieldMessage !== null}
              aria-describedby={describedBy}
              onChange={(event) => changeNote(event.target.value)}
            />
            <p id="decision-note-hint" className="field-hint">
              {es.decision.noteHint}
            </p>
            {fieldMessage !== null && (
              <p id="decision-note-error" role="alert" className="field-error">
                {fieldMessage}
              </p>
            )}
          </div>
          <div className="actions">
            <button type="button" className="btn-tertiary" onClick={cancel}>
              {es.decision.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? es.decision.sending
                : decision === 'approve'
                  ? es.decision.confirmApprove
                  : es.decision.confirmReject}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
