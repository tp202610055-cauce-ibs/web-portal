import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { usePatientDetail } from '@/modules/patients';
import { isUuid } from '@/modules/recommendations/application/reviewRecommendations';
import {
  checkManualDraft,
  hasManualProblems,
  toManualRequest,
  type ManualDraft,
  type ManualProblems,
} from '@/modules/recommendations/domain/manualRecommendation';
import {
  ManualRefusedError,
  type ManualField,
} from '@/modules/recommendations/domain/Recommendation';
import { useCreateManualRecommendation } from '@/modules/recommendations/presentation/usePatientRecommendations';
import { es } from '@/shared/presentation/i18n/es';

const { manual: text } = es;

const EMPTY: ManualDraft = { title: '', description: '', steps: [], note: '' };

function clientMessage(problems: ManualProblems, field: ManualField): string | null {
  switch (field) {
    case 'title':
      return problems.title === 'empty'
        ? text.titleRequired
        : problems.title === 'too-long'
          ? es.editor.titleTooLong
          : null;
    case 'description':
      return problems.description === 'empty'
        ? text.descriptionRequired
        : problems.description === 'too-long'
          ? text.descriptionTooLong
          : null;
    case 'note':
      return problems.note === 'empty'
        ? es.decision.noteEmpty
        : problems.note === 'too-short'
          ? es.decision.noteTooShort
          : problems.note === 'too-long'
            ? es.decision.noteTooLong
            : null;
  }
}

// Manual recommendation (/pacientes/:patientId/recomendaciones/nueva), reached from the record's
// Recommendations tab. It is approved on creation (HU0029); only the UUID travels in the URL.
export function ManualRecommendationPage() {
  const { patientId } = useParams();
  if (!isUuid(patientId)) {
    return (
      <section className="stack">
        <h1>{es.record.notFound}</h1>
        <p>
          <Link to="/pacientes">{es.record.backToPanel}</Link>
        </p>
      </section>
    );
  }
  return <ManualForm patientId={patientId} />;
}

function ManualForm({ patientId }: { readonly patientId: string }) {
  const navigate = useNavigate();
  const patient = usePatientDetail(patientId);
  const create = useCreateManualRecommendation(patientId);
  const [draft, setDraft] = useState<ManualDraft>(EMPTY);
  const [showProblems, setShowProblems] = useState(false);
  // One stable key per step, so removing one never moves another's text.
  const [stepKeys, setStepKeys] = useState<string[]>([]);
  const problems = checkManualDraft(draft);
  const refusal = create.error instanceof ManualRefusedError ? create.error.failure : null;

  function change(next: Partial<ManualDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function fieldMessage(field: ManualField): string | null {
    const local = showProblems ? clientMessage(problems, field) : null;
    if (local !== null) {
      return local;
    }
    const server = refusal?.kind === 'invalid' ? refusal.fields[field] : undefined;
    return server === undefined || server.length === 0 ? null : server.join(' ');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) {
      return;
    }
    setShowProblems(true);
    if (hasManualProblems(problems)) {
      create.reset();
      return;
    }
    create.mutate(toManualRequest(patientId, draft), {
      onSuccess: () =>
        void navigate(`/pacientes/${patientId}`, {
          state: { tab: 'recommendations', notice: es.patientRecommendations.created },
        }),
    });
  }

  function addStep() {
    setStepKeys((keys) => [...keys, crypto.randomUUID()]);
    change({ steps: [...draft.steps, ''] });
  }

  function removeStep(index: number) {
    setStepKeys((keys) => keys.filter((_, i) => i !== index));
    change({ steps: draft.steps.filter((_, i) => i !== index) });
  }

  const formMessages: string[] = [];
  if (showProblems && hasManualProblems(problems)) {
    formMessages.push(text.reviewFields);
  }
  if (refusal?.kind === 'access-denied') {
    formMessages.push(text.accessDenied);
  } else if (refusal?.kind === 'invalid') {
    formMessages.push(...refusal.other);
  } else if (create.isError) {
    formMessages.push(es.generic.error);
  }

  const titleError = fieldMessage('title');
  const descriptionError = fieldMessage('description');
  const noteError = fieldMessage('note');

  return (
    <section aria-labelledby="manual-title-heading" className="stack">
      <p>
        <Link to={`/pacientes/${patientId}`}>{text.backToRecord}</Link>
      </p>
      <h1 id="manual-title-heading">{text.title}</h1>
      <p>{text.intro}</p>
      <dl className="details">
        <dt>{text.patient}</dt>
        <dd>{patient.data?.fullName ?? es.patients.nameUnavailable}</dd>
      </dl>
      <form className="card stack" noValidate onSubmit={submit}>
        {formMessages.length > 0 && (
          <div role="alert" className="notice notice--error stack">
            {formMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div className="field">
          <label htmlFor="manual-title">{text.titleLabel}</label>
          <input
            id="manual-title"
            className="input"
            value={draft.title}
            aria-invalid={titleError !== null}
            aria-describedby={titleError === null ? undefined : 'manual-title-error'}
            onChange={(event) => change({ title: event.target.value })}
          />
          {titleError !== null && (
            <p id="manual-title-error" className="field-error">
              {titleError}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="manual-description">{text.descriptionLabel}</label>
          <textarea
            id="manual-description"
            className="textarea"
            value={draft.description}
            aria-invalid={descriptionError !== null}
            aria-describedby={descriptionError === null ? undefined : 'manual-description-error'}
            onChange={(event) => change({ description: event.target.value })}
          />
          {descriptionError !== null && (
            <p id="manual-description-error" className="field-error">
              {descriptionError}
            </p>
          )}
        </div>
        <fieldset className="stack">
          <legend>{text.stepsTitle}</legend>
          <p className="field-hint">{text.stepsHint}</p>
          {draft.steps.map((step, index) => {
            const tooLong = showProblems && problems.steps.includes(index);
            const id = `manual-step-${index}`;
            return (
              <div key={stepKeys[index] ?? index} className="step-row">
                <div className="field">
                  <label htmlFor={id}>{es.editor.stepLabel(index + 1)}</label>
                  <input
                    id={id}
                    className="input"
                    value={step}
                    aria-invalid={tooLong}
                    aria-describedby={tooLong ? `${id}-error` : undefined}
                    onChange={(event) =>
                      change({
                        steps: draft.steps.map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      })
                    }
                  />
                  {tooLong && (
                    <p id={`${id}-error`} className="field-error">
                      {text.stepTooLong}
                    </p>
                  )}
                </div>
                <button type="button" className="btn-tertiary" onClick={() => removeStep(index)}>
                  {es.editor.removeStep(index + 1)}
                </button>
              </div>
            );
          })}
          <div>
            <button type="button" className="btn-secondary" onClick={addStep}>
              {es.editor.addStep}
            </button>
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="manual-note">{es.decision.noteLabel}</label>
          <textarea
            id="manual-note"
            className="textarea"
            value={draft.note}
            aria-invalid={noteError !== null}
            aria-describedby={['manual-note-hint', noteError === null ? null : 'manual-note-error']
              .filter((value) => value !== null)
              .join(' ')}
            onChange={(event) => change({ note: event.target.value })}
          />
          <p id="manual-note-hint" className="field-hint">
            {es.decision.noteHint}
          </p>
          {noteError !== null && (
            <p id="manual-note-error" className="field-error">
              {noteError}
            </p>
          )}
        </div>
        <div className="actions">
          <Link className="btn-tertiary" to={`/pacientes/${patientId}`}>
            {text.cancel}
          </Link>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? text.sending : text.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
