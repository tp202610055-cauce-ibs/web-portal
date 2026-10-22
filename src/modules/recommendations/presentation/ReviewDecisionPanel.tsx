import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';

import type { ReviewDecision } from '@/modules/recommendations/application/reviewRecommendations';
import {
  checkClinicalNote,
  type ClinicalNoteProblem,
} from '@/modules/recommendations/domain/clinicalNote';
import {
  DecisionRefusedError,
  type RecommendationAction,
} from '@/modules/recommendations/domain/Recommendation';
import { es } from '@/shared/presentation/i18n/es';

export type PanelDecision = ReviewDecision | 'modify';

export interface PanelSubmission {
  readonly decision: PanelDecision;
  readonly note: string;
}

const PROBLEM_MESSAGE: Record<ClinicalNoteProblem, string> = {
  empty: es.decision.noteEmpty,
  'too-short': es.decision.noteTooShort,
  'too-long': es.decision.noteTooLong,
};

const ACTION_OF: Record<PanelDecision, RecommendationAction> = {
  approve: 'Approve',
  modify: 'Modify',
  reject: 'Reject',
};

const LABEL: Record<PanelDecision, string> = {
  approve: es.decision.approve,
  modify: es.decision.modify,
  reject: es.decision.reject,
};

const CONFIRM: Record<PanelDecision, string> = {
  approve: es.decision.confirmApprove,
  modify: es.decision.confirmModify,
  reject: es.decision.confirmReject,
};

const ORDER: readonly PanelDecision[] = ['approve', 'modify', 'reject'];

interface ReviewDecisionPanelProps {
  readonly actions: RecommendationAction[];
  readonly submitting: boolean;
  readonly error: unknown;
  readonly blockedMessage: string | null;
  readonly onSubmit: (input: PanelSubmission) => void;
  readonly onDismissError: () => void;
  readonly onDecisionChange: (decision: PanelDecision | null) => void;
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
  if (!(error instanceof DecisionRefusedError)) {
    return es.generic.error;
  }
  switch (error.failure.kind) {
    case 'idempotency-mismatch':
      return es.decision.retryAgain;
    case 'invalid-content':
      return error.failure.messages.join(' ') || es.generic.error;
    default:
      return null;
  }
}

// Each decision appears only when allowedActions lists it; all three need a clinical note.
export function ReviewDecisionPanel({
  actions,
  submitting,
  error,
  blockedMessage,
  onSubmit,
  onDismissError,
  onDecisionChange,
}: ReviewDecisionPanelProps) {
  const [decision, setDecision] = useState<PanelDecision | null>(null);
  const [note, setNote] = useState('');
  const [problem, setProblem] = useState<ClinicalNoteProblem | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const approveRef = useRef<HTMLButtonElement>(null);
  const modifyRef = useRef<HTMLButtonElement>(null);
  const rejectRef = useRef<HTMLButtonElement>(null);
  const openers: Record<PanelDecision, RefObject<HTMLButtonElement | null>> = {
    approve: approveRef,
    modify: modifyRef,
    reject: rejectRef,
  };

  useEffect(() => {
    if (decision !== null) {
      noteRef.current?.focus();
    }
  }, [decision]);

  const available = ORDER.filter((option) => actions.includes(ACTION_OF[option]));
  if (available.length === 0) {
    return null;
  }

  function open(next: PanelDecision) {
    setDecision(next);
    setProblem(null);
    onDismissError();
    onDecisionChange(next);
  }

  function cancel() {
    const opener = decision === null ? null : openers[decision];
    setDecision(null);
    setProblem(null);
    onDismissError();
    onDecisionChange(null);
    opener?.current?.focus();
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
  const formMessage = blockedMessage ?? retryMessage(error);
  const describedBy = ['decision-note-hint', fieldMessage === null ? null : 'decision-note-error']
    .filter((id) => id !== null)
    .join(' ');

  return (
    <div className="stack">
      <div className="actions">
        {available.map((option) => (
          <button
            key={option}
            ref={openers[option]}
            type="button"
            className={decision === option ? 'btn-primary' : 'btn-secondary'}
            aria-expanded={decision === option}
            onClick={() => open(option)}
          >
            {LABEL[option]}
          </button>
        ))}
      </div>
      {decision !== null && (
        <form className="stack" noValidate onSubmit={submit}>
          {decision === 'modify' && <p className="field-hint">{es.decision.modifyHint}</p>}
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
              {submitting ? es.decision.sending : CONFIRM[decision]}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
