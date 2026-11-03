import { useQueries, useQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';

import {
  diaryWindow,
  loadPatientDiary,
  type DiaryWindow,
} from '@/modules/clinical-registry/application/getPatientDiary';
import {
  HistoryAccessDeniedError,
  type DiaryEntry,
  type DiaryNote,
  type MealItem,
} from '@/modules/clinical-registry/domain/PatientDiary';
import { useClinicalRegistryGateway } from '@/modules/clinical-registry/presentation/ClinicalRegistryContext';
import { useFoodCatalogGateway } from '@/modules/clinical-registry/presentation/FoodCatalogContext';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { formatAmount } from '@/shared/presentation/format/numbers';
import { es } from '@/shared/presentation/i18n/es';

const { diary: text } = es;

function formatAt(value: Date): string {
  return text.at(formatLimaDate(value), formatLimaTime(value));
}

interface PatientDiaryProps {
  readonly patientId: string;
  // Start of the assignment; records before it carry the "before the link" mark. Null marks none.
  readonly assignedAt: Date | null;
  readonly window?: DiaryWindow;
  readonly title?: string;
}

// The patient's meals, symptoms and notes; nothing of it is kept outside this query's memory.
export function PatientDiary({
  patientId,
  assignedAt,
  window,
  title = text.title,
}: PatientDiaryProps) {
  const gateway = useClinicalRegistryGateway();
  const headingId = useId();
  const [range] = useState(() => window ?? diaryWindow(new Date()));
  const diary = useQuery({
    queryKey: [
      'clinical-registry',
      'history',
      patientId,
      range.from.toISOString(),
      range.to.toISOString(),
      assignedAt?.toISOString() ?? null,
    ],
    queryFn: () => loadPatientDiary(gateway, patientId, range, assignedAt),
    retry: false,
  });
  let content;
  if (diary.isPending) {
    content = <p role="status">{text.loading}</p>;
  } else if (diary.isError) {
    content =
      diary.error instanceof HistoryAccessDeniedError ? (
        <p role="alert" className="notice notice--error">
          {text.accessDenied}
        </p>
      ) : (
        <div role="alert" className="notice notice--error stack">
          <p>{text.loadError}</p>
          <div>
            <button type="button" className="btn-secondary" onClick={() => void diary.refetch()}>
              {text.retry}
            </button>
          </div>
        </div>
      );
  } else if (diary.data.length === 0) {
    content = <p>{text.empty}</p>;
  } else {
    content = <DiaryEntries entries={diary.data} assignedAt={assignedAt} />;
  }
  return (
    <section aria-labelledby={headingId} className="card stack">
      <h2 id={headingId}>{title}</h2>
      <p>{text.range(formatLimaDate(range.from), formatLimaDate(range.to))}</p>
      {content}
    </section>
  );
}

function DiaryEntries({
  entries,
  assignedAt,
}: {
  readonly entries: DiaryEntry[];
  readonly assignedAt: Date | null;
}) {
  const anyBeforeLink = entries.some((entry) => entry.beforeLink);
  return (
    <>
      {anyBeforeLink && assignedAt !== null && (
        <p className="notice notice--info">{text.beforeLinkNotice(formatLimaDate(assignedAt))}</p>
      )}
      <ul className="stack">
        {entries.map((entry) => (
          <li key={entryKey(entry)} className="card stack">
            <EntryHeader entry={entry} />
            {entry.kind === 'meal' && <MealFoods items={entry.meal.items} />}
            {entry.kind === 'note' && <p>«{entry.note.content ?? ''}»</p>}
            {entry.notes.map((note) => (
              <AttachedNote key={note.noteId} note={note} />
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

function entryKey(entry: DiaryEntry): string {
  switch (entry.kind) {
    case 'meal':
      return `meal:${entry.meal.mealId}`;
    case 'symptom':
      return `symptom:${entry.symptom.symptomId}`;
    case 'note':
      return `note:${entry.note.noteId}`;
  }
}

function EntryHeader({ entry }: { readonly entry: DiaryEntry }) {
  let label: string;
  let detail: string | null = null;
  if (entry.kind === 'meal') {
    label = `${text.meal}: ${es.mealTime[entry.meal.mealTime]}`;
  } else if (entry.kind === 'symptom') {
    label = `${text.symptom}: ${es.symptomType[entry.symptom.symptomType]}`;
    detail = text.intensity(entry.symptom.intensity);
  } else {
    label = text.note;
  }
  return (
    <p>
      <strong>{label}</strong> · {formatAt(entry.at)}
      {detail !== null && <> · {detail}</>}
      {entry.kind === 'meal' && entry.meal.fodmapLevel !== null && (
        <>
          {' '}
          <span className={`badge badge--fodmap-${entry.meal.fodmapLevel.toLowerCase()}`}>
            {es.fodmapLevel[entry.meal.fodmapLevel]}
          </span>
        </>
      )}
      {entry.beforeLink && (
        <>
          {' '}
          <span className="badge badge--status-neutral">{text.beforeLink}</span>
        </>
      )}
    </p>
  );
}

// The note shown under the record it was written on, with its own date and time.
function AttachedNote({ note }: { readonly note: DiaryNote }) {
  return (
    <div className="notice notice--info stack">
      <p>
        <strong>{text.note}</strong> · {formatAt(note.createdAt)}
      </p>
      <p>«{note.content ?? ''}»</p>
    </div>
  );
}

// Catalog names are read once per food and kept in memory; a patient's own food shows a label.
function MealFoods({ items }: { readonly items: MealItem[] }) {
  const catalog = useFoodCatalogGateway();
  const ids = [...new Set(items.flatMap((item) => (item.foodId === null ? [] : [item.foodId])))];
  const names = useQueries({
    queries: ids.map((foodId) => ({
      queryKey: ['clinical-registry', 'food', foodId],
      queryFn: () => catalog.getFood(foodId),
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    })),
  });
  if (items.length === 0) {
    return <p>{text.noFoods}</p>;
  }
  const nameOf = (foodId: string): string => {
    const query = names[ids.indexOf(foodId)];
    if (query?.isPending) {
      return es.generic.loading;
    }
    return query?.data?.name ?? text.unnamedFood;
  };
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.foodId ?? item.customFoodId ?? 'food'}-${index}`}>
          {text.quantity(
            item.foodId === null ? text.customFood : nameOf(item.foodId),
            formatAmount(item.quantity),
            es.measurementUnit[item.unit],
          )}
        </li>
      ))}
    </ul>
  );
}
