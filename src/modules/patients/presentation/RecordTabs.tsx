import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { PatientDiary } from '@/modules/clinical-registry';
import { PatientEvolution } from '@/modules/patients/presentation/PatientEvolution';
import { PatientSummary } from '@/modules/patients/presentation/PatientSummary';
import { usePatientDetail } from '@/modules/patients/presentation/usePatientRecord';
import { es } from '@/shared/presentation/i18n/es';

// A tab another module contributes, composed by the app root so this module never imports it.
export interface RecordTab {
  readonly key: string;
  readonly label: string;
  readonly render: (patientId: string) => ReactNode;
}

interface RecordTabsProps {
  readonly patientId: string;
  readonly extraTabs?: readonly RecordTab[];
  readonly initialTab?: string;
}

const BASE_TABS: readonly RecordTab[] = [
  {
    key: 'summary',
    label: es.recordTabs.summary,
    render: (patientId) => <PatientSummary patientId={patientId} />,
  },
  {
    key: 'evolution',
    label: es.recordTabs.evolution,
    render: (patientId) => <PatientEvolution patientId={patientId} />,
  },
  {
    key: 'diary',
    label: es.recordTabs.diary,
    render: (patientId) => <DiaryTab patientId={patientId} />,
  },
];

// Summary and Evolution mount together and share one cached evolution request.
const EAGER = ['summary', 'evolution'];

// WAI-ARIA tabs: arrows, Home and End move between tabs. The choice stays in memory, not in the URL.
// Any other panel mounts the first time its tab opens and then stays mounted (hidden), so it reads
// its data only when it is looked at.
export function RecordTabs({ patientId, extraTabs = [], initialTab }: RecordTabsProps) {
  const tabs = [...BASE_TABS, ...extraTabs];
  const keys = tabs.map((tab) => tab.key);
  const first = initialTab !== undefined && keys.includes(initialTab) ? initialTab : 'summary';
  const [active, setActive] = useState(first);
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set([...EAGER, first]));
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  function open(key: string) {
    setActive(key);
    setOpened((current) => (current.has(key) ? current : new Set([...current, key])));
  }

  function select(key: string) {
    open(key);
    buttons.current[key]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = keys.indexOf(active);
    const target: Record<string, string | undefined> = {
      ArrowRight: keys[(index + 1) % keys.length],
      ArrowLeft: keys[(index - 1 + keys.length) % keys.length],
      Home: keys[0],
      End: keys[keys.length - 1],
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
        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(element) => {
              buttons.current[tab.key] = element;
            }}
            type="button"
            role="tab"
            id={`record-tab-${tab.key}`}
            className="tab"
            aria-selected={active === tab.key}
            aria-controls={`record-panel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            onClick={() => open(tab.key)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`record-panel-${tab.key}`}
          aria-labelledby={`record-tab-${tab.key}`}
          hidden={active !== tab.key}
        >
          {opened.has(tab.key) && tab.render(patientId)}
        </div>
      ))}
    </div>
  );
}

// The diary waits for the detail so it can mark what predates the link; without it, it marks nothing.
function DiaryTab({ patientId }: { readonly patientId: string }) {
  const detail = usePatientDetail(patientId);
  if (detail.isPending) {
    return <p role="status">{es.generic.loading}</p>;
  }
  return <PatientDiary patientId={patientId} assignedAt={detail.data?.assignedAt ?? null} />;
}
