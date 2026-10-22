import type { RecommendationDetail } from '@/modules/recommendations/domain/Recommendation';
import {
  checkDraft,
  type RecommendationDraft,
  type TitleProblem,
} from '@/modules/recommendations/domain/recommendationDraft';
import { ItemsEditor } from '@/modules/recommendations/presentation/ItemsEditor';
import { es } from '@/shared/presentation/i18n/es';

const TITLE_PROBLEM: Record<TitleProblem, string> = {
  empty: es.editor.titleEmpty,
  'too-long': es.editor.titleTooLong,
};

interface RecommendationEditorProps {
  readonly original: RecommendationDetail;
  readonly draft: RecommendationDraft;
  readonly showProblems: boolean;
  readonly onChange: (draft: RecommendationDraft) => void;
}

// Edits what the patient will receive; problems show only after a first attempt to confirm.
export function RecommendationEditor({
  original,
  draft,
  showProblems,
  onChange,
}: RecommendationEditorProps) {
  const problems = showProblems ? checkDraft(original, draft) : null;
  const titleProblem = problems?.title ?? null;
  const descriptionProblem = problems?.description ?? null;

  function changeStep(index: number, value: string) {
    onChange({ ...draft, steps: draft.steps.map((step, i) => (i === index ? value : step)) });
  }

  return (
    <section aria-labelledby="editor-title" className="card stack">
      <h2 id="editor-title">{es.editor.title}</h2>
      <div className="field">
        <label htmlFor="editor-title-input">{es.editor.titleLabel}</label>
        <input
          id="editor-title-input"
          className="input"
          value={draft.title}
          aria-invalid={titleProblem !== null}
          aria-describedby={titleProblem === null ? undefined : 'editor-title-error'}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
        />
        {titleProblem !== null && (
          <p id="editor-title-error" role="alert" className="field-error">
            {TITLE_PROBLEM[titleProblem]}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="editor-description">{es.editor.descriptionLabel}</label>
        <textarea
          id="editor-description"
          className="textarea"
          value={draft.description}
          aria-invalid={descriptionProblem !== null}
          aria-describedby={descriptionProblem === null ? undefined : 'editor-description-error'}
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
        />
        {descriptionProblem !== null && (
          <p id="editor-description-error" role="alert" className="field-error">
            {es.editor.descriptionEmpty}
          </p>
        )}
      </div>
      <section aria-labelledby="editor-steps" className="stack">
        <h3 id="editor-steps">{es.editor.stepsTitle}</h3>
        {draft.steps.map((step, index) => (
          <div key={index} className="step-row">
            <label htmlFor={`editor-step-${index}`}>{es.editor.stepLabel(index + 1)}</label>
            <input
              id={`editor-step-${index}`}
              className="input"
              value={step}
              onChange={(event) => changeStep(index, event.target.value)}
            />
            <button
              type="button"
              className="btn-tertiary"
              onClick={() =>
                onChange({ ...draft, steps: draft.steps.filter((_, i) => i !== index) })
              }
            >
              {es.editor.removeStep(index + 1)}
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChange({ ...draft, steps: [...draft.steps, ''] })}
          >
            {es.editor.addStep}
          </button>
        </div>
      </section>
      <ItemsEditor draft={draft} problems={problems} onChange={onChange} />
    </section>
  );
}
