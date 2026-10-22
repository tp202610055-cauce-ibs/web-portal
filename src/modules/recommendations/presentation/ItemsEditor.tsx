import { FoodSearch } from '@/modules/clinical-registry';
import type { FoodAction } from '@/modules/recommendations/domain/Recommendation';
import {
  withAction,
  withFood,
  withoutItem,
  withReasoning,
  withSubstitute,
  type DraftItem,
  type DraftProblems,
  type ItemProblem,
  type RecommendationDraft,
} from '@/modules/recommendations/domain/recommendationDraft';
import { es } from '@/shared/presentation/i18n/es';

const ACTIONS: readonly FoodAction[] = ['Suggest', 'Reduce', 'Avoid', 'Substitute'];

const ITEM_PROBLEM: Record<ItemProblem, string> = {
  'substitute-required': es.editor.substituteRequired,
  'substitute-same': es.editor.substituteSame,
};

interface ItemsEditorProps {
  readonly draft: RecommendationDraft;
  readonly problems: DraftProblems | null;
  readonly onChange: (draft: RecommendationDraft) => void;
}

// Editable food list; any change here sends the whole list. Foods come only from the catalog search.
export function ItemsEditor({ draft, problems, onChange }: ItemsEditorProps) {
  const { itemColumns } = es.recommendation;
  return (
    <section aria-labelledby="editor-items" className="stack">
      <h3 id="editor-items">{es.editor.itemsTitle}</h3>
      {draft.items.length > 0 && (
        <table className="data-table editor-table">
          <caption className="visually-hidden">{es.editor.itemsCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{itemColumns.food}</th>
              <th scope="col">{itemColumns.action}</th>
              <th scope="col">{itemColumns.reasoning}</th>
              <th scope="col">{itemColumns.substitute}</th>
              <th scope="col">
                <span className="visually-hidden">{es.editor.removeColumn}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item) => (
              <ItemRow
                key={item.key}
                item={item}
                problem={problems?.items[item.key] ?? null}
                draft={draft}
                onChange={onChange}
              />
            ))}
          </tbody>
        </table>
      )}
      {problems?.noItems === true && (
        <p role="alert" className="field-error">
          {es.editor.noItems}
        </p>
      )}
      <FoodSearch
        label={es.editor.addFood}
        excludedFoodIds={draft.items.map((item) => item.foodId)}
        onSelect={(food) => onChange(withFood(draft, food, `added-${food.foodId}`))}
      />
    </section>
  );
}

interface ItemRowProps {
  readonly item: DraftItem;
  readonly problem: ItemProblem | null;
  readonly draft: RecommendationDraft;
  readonly onChange: (draft: RecommendationDraft) => void;
}

function ItemRow({ item, problem, draft, onChange }: ItemRowProps) {
  const name = item.foodName ?? es.recommendation.unnamedFood;
  const errorId = `item-${item.key}-error`;
  return (
    <tr>
      <th scope="row">{name}</th>
      <td>
        <select
          className="input"
          aria-label={es.editor.actionLabel(name)}
          value={item.action}
          aria-invalid={problem !== null}
          aria-describedby={problem === null ? undefined : errorId}
          onChange={(event) =>
            onChange(withAction(draft, item.key, event.target.value as FoodAction))
          }
        >
          {ACTIONS.map((action) => (
            <option key={action} value={action}>
              {es.foodAction[action]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          className="input"
          aria-label={es.editor.reasoningLabel(name)}
          value={item.reasoning}
          onChange={(event) => onChange(withReasoning(draft, item.key, event.target.value))}
        />
      </td>
      <td className="stack">
        <span>{item.substituteFoodName ?? es.recommendation.noSubstitute}</span>
        {item.action === 'Substitute' && (
          <FoodSearch
            label={es.editor.substituteSearch(name)}
            excludedFoodIds={[item.foodId]}
            onSelect={(food) => onChange(withSubstitute(draft, item.key, food))}
          />
        )}
        {problem !== null && (
          <p id={errorId} role="alert" className="field-error">
            {ITEM_PROBLEM[problem]}
          </p>
        )}
      </td>
      <td>
        <button
          type="button"
          className="btn-tertiary"
          onClick={() => onChange(withoutItem(draft, item.key))}
        >
          {es.editor.removeItem(name)}
        </button>
      </td>
    </tr>
  );
}
