import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  searchGlossary,
  similarTerms,
  type Glossary,
} from '@/modules/clinical-registry/domain/Glossary';
import { useClinicalRegistryGateway } from '@/modules/clinical-registry/presentation/ClinicalRegistryContext';
import { es } from '@/shared/presentation/i18n/es';

const { glossary: text } = es;

// Glossary (/glosario), reached from the Ayuda menu. The search runs over the loaded terms, with the
// same rule as the mobile app, so the match and the similar terms come from the same data.
export function GlossaryPage() {
  const gateway = useClinicalRegistryGateway();
  const glossary = useQuery({
    queryKey: ['clinical-registry', 'glossary'],
    queryFn: () => gateway.getGlossary(),
    retry: false,
  });
  let content;
  if (glossary.isPending) {
    content = <p role="status">{es.generic.loading}</p>;
  } else if (glossary.isError) {
    content = (
      <div role="alert" className="notice notice--error stack">
        <p>{text.loadError}</p>
        <div>
          <button type="button" className="btn-secondary" onClick={() => void glossary.refetch()}>
            {text.retry}
          </button>
        </div>
      </div>
    );
  } else if (glossary.data.terms.length === 0) {
    content = <p>{text.empty}</p>;
  } else {
    content = <GlossarySearch glossary={glossary.data} />;
  }
  return (
    <section aria-labelledby="glossary-title" className="stack">
      <h1 id="glossary-title">{text.title}</h1>
      {glossary.data?.isDraft === true && <p className="notice notice--info">{text.draftNote}</p>}
      {content}
    </section>
  );
}

function GlossarySearch({ glossary }: { readonly glossary: Glossary }) {
  const [query, setQuery] = useState('');
  const matches = searchGlossary(glossary, query);
  const similar = matches.length === 0 ? similarTerms(glossary, query) : [];
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="glossary-search">{text.searchLabel}</label>
        <input
          id="glossary-search"
          className="input"
          type="search"
          value={query}
          placeholder={text.searchHint}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p role="status">{matches.length === 0 ? text.notFound : text.results(matches.length)}</p>
      {similar.length > 0 && (
        <section aria-labelledby="glossary-similar" className="card stack">
          <h2 id="glossary-similar">{text.suggestions}</h2>
          <div className="actions">
            {similar.map((entry) => (
              <button
                key={entry.term}
                type="button"
                className="btn-secondary"
                onClick={() => setQuery(entry.term)}
              >
                {entry.term}
              </button>
            ))}
          </div>
        </section>
      )}
      <ul className="stack">
        {matches.map((entry) => (
          <li key={entry.term}>
            <details className="card stack">
              <summary>{entry.term}</summary>
              {entry.category !== null && <p>{es.glossaryCategory[entry.category]}</p>}
              <p>{entry.definition}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
