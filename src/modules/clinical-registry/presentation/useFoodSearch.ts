import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { foodQuery, searchFoods } from '@/modules/clinical-registry/application/searchFoods';
import { useFoodCatalogGateway } from '@/modules/clinical-registry/presentation/FoodCatalogContext';

export const FOOD_SEARCH_DELAY_MS = 300;

// The timer restarts with every keystroke and stops when the field unmounts (cancel, leave, sign out).
// The query is keyed by the settled text, so a slow answer to an older text never replaces the current one.
export function useFoodSearch(text: string) {
  const gateway = useFoodCatalogGateway();
  const query = foodQuery(text);
  const [settled, setSettled] = useState<string | null>(null);

  useEffect(() => {
    if (query === null) {
      return;
    }
    const timer = setTimeout(() => setSettled(query), FOOD_SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const active = query !== null && settled === query ? query : null;
  const results = useQuery({
    queryKey: ['foods', 'search', active],
    queryFn: () => searchFoods(gateway, active ?? ''),
    enabled: active !== null,
    retry: false,
  });
  return { query, active, results };
}
