import { useRef, useState, type KeyboardEvent } from 'react';

import { PatientEvolution } from '@/modules/patients/presentation/PatientEvolution';
import { PatientSummary } from '@/modules/patients/presentation/PatientSummary';
import { es } from '@/shared/presentation/i18n/es';

const TABS = ['summary', 'evolution'] as const;
type Tab = (typeof TABS)[number];

// WAI-ARIA tabs: arrows, Home and End move between tabs. The choice stays in memory, not in the URL.
// Both panels stay mounted (the inactive one hidden), so they share one cached evolution request.
export function RecordTabs({ patientId }: { readonly patientId: string }) {
  const [active, setActive] = useState<Tab>('summary');
  const buttons = useRef<Record<Tab, HTMLButtonElement | null>>({ summary: null, evolution: null });

  function select(tab: Tab) {
    setActive(tab);
    buttons.current[tab]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = TABS.indexOf(active);
    const target: Record<string, Tab | undefined> = {
      ArrowRight: TABS[(index + 1) % TABS.length],
      ArrowLeft: TABS[(index - 1 + TABS.length) % TABS.length],
      Home: TABS[0],
      End: TABS[TABS.length - 1],
    };
    const next = target[event.key];
    if (next !== undefined) {
      event.preventDefault();
      select(next);
    }
  }

  return (
    <div className="stack">
      <div role="tablist" aria-label={es.recordTabs.label} className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            ref={(element) => {
              buttons.current[tab] = element;
            }}
            type="button"
            role="tab"
            id={`record-tab-${tab}`}
            className="tab"
            aria-selected={active === tab}
            aria-controls={`record-panel-${tab}`}
            tabIndex={active === tab ? 0 : -1}
            onClick={() => setActive(tab)}
            onKeyDown={onKeyDown}
          >
            {es.recordTabs[tab]}
          </button>
        ))}
      </div>
      {TABS.map((tab) => (
        <div
          key={tab}
          role="tabpanel"
          id={`record-panel-${tab}`}
          aria-labelledby={`record-tab-${tab}`}
          hidden={active !== tab}
        >
          {tab === 'summary' ? (
            <PatientSummary patientId={patientId} />
          ) : (
            <PatientEvolution patientId={patientId} />
          )}
        </div>
      ))}
    </div>
  );
}
