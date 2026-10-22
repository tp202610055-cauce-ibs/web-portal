import { useId, useState } from 'react';

import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';
import { useFoodSearch } from '@/modules/clinical-registry/presentation/useFoodSearch';
import { es } from '@/shared/presentation/i18n/es';

interface FoodSearchProps {
  readonly label: string;
  readonly excludedFoodIds?: readonly string[];
  readonly onSelect: (food: FoodSummary) => void;
}

function statusText(
  query: string | null,
  waiting: boolean,
  failed: boolean,
  count: number | null,
): string {
  if (query === null) {
    return '';
  }
  if (failed) {
    return es.foodSearch.error;
  }
  if (waiting || count === null) {
    return es.foodSearch.searching;
  }
  return count === 0 ? es.foodSearch.noResults : es.foodSearch.results(count);
}

// Catalog search for one choice; a food already in use is shown but cannot be chosen again.
export function FoodSearch({ label, excludedFoodIds = [], onSelect }: FoodSearchProps) {
  const id = useId();
  const [text, setText] = useState('');
  const { query, active, results } = useFoodSearch(text);
  const foods = active === null ? null : (results.data ?? null);
  const status = statusText(
    query,
    active === null || results.isPending,
    results.isError,
    foods?.length ?? null,
  );

  function choose(food: FoodSummary) {
    setText('');
    onSelect(food);
  }

  return (
    <div className="field">
      <label htmlFor={`${id}-input`}>{label}</label>
      <input
        id={`${id}-input`}
        className="input"
        type="search"
        autoComplete="off"
        value={text}
        aria-describedby={`${id}-hint ${id}-status`}
        onChange={(event) => setText(event.target.value)}
      />
      <p id={`${id}-hint`} className="field-hint">
        {es.foodSearch.hint}
      </p>
      <p id={`${id}-status`} role="status" className="field-hint">
        {status}
      </p>
      {foods !== null && foods.length > 0 && (
        <ul className="food-results" aria-label={label}>
          {foods.map((food) => {
            const used = excludedFoodIds.includes(food.foodId);
            return (
              <li key={food.foodId}>
                <button
                  type="button"
                  className="food-result"
                  disabled={used}
                  onClick={() => choose(food)}
                >
                  <span>{food.name ?? es.foodSearch.unnamed}</span>
                  <span className={`badge badge--fodmap-${food.fodmapLevel.toLowerCase()}`}>
                    {used ? es.foodSearch.alreadyAdded : es.fodmapLevel[food.fodmapLevel]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
