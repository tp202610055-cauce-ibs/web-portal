import { IconBell } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import {
  listAlerts,
  markAllAlertsRead,
  POLL_INTERVAL_MS,
  STALE_AFTER_MS,
} from '@/modules/notifications/application/listAlerts';
import {
  unreadBadge,
  type AlertsPage,
  type NutritionistAlert,
} from '@/modules/notifications/domain/NutritionistAlert';
import { useAlertsGateway } from '@/modules/notifications/presentation/AlertsContext';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const { notifications: text } = es;
const ALERTS_KEY = ['notifications', 'alerts'] as const;

function alertText(alert: NutritionistAlert): string {
  return alert.message ?? text.fallback[alert.type](alert.patientName ?? text.unknownPatient);
}

// The bell of the top bar (decision D4). Its query owns the polling timer: it starts when the
// signed-in shell mounts and stops when the session ends and the shell unmounts. It pauses while the
// tab is hidden, and polling never counts as user activity for the inactivity logout.
export function NotificationBell() {
  const gateway = useAlertsGateway();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const alerts = useQuery({
    queryKey: ALERTS_KEY,
    queryFn: () => listAlerts(gateway),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: STALE_AFTER_MS,
    retry: false,
  });
  const readAll = useMutation({
    mutationFn: () => markAllAlertsRead(gateway),
    onSuccess: () =>
      queryClient.setQueryData<AlertsPage>(ALERTS_KEY, (current) =>
        current === undefined
          ? current
          : {
              ...current,
              unreadCount: 0,
              items: current.items.map((item) => ({ ...item, isRead: true })),
            },
      ),
  });
  const [open, setOpen] = useState(false);
  // What the open panel shows: the list as it loaded, so its "new" marks survive the read-all.
  const [shown, setShown] = useState<AlertsPage | null>(null);
  const [failed, setFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const unread = alerts.data?.unreadCount ?? 0;
  const [heard, setHeard] = useState(unread);
  const [announcement, setAnnouncement] = useState('');
  if (unread !== heard) {
    setHeard(unread);
    if (unread > heard) {
      setAnnouncement(text.announce(unread));
    }
  }

  useEffect(() => {
    void queryClient.refetchQueries(
      { queryKey: ALERTS_KEY, stale: true },
      { cancelRefetch: false },
    );
  }, [pathname, queryClient]);

  // While open, the panel takes the focus and Escape closes it, back on the bell.
  useEffect(() => {
    if (!open) {
      return;
    }
    headingRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        setShown(null);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // The read-all goes only once the list on screen has loaded.
  async function load() {
    setFailed(false);
    setShown(null);
    const result = await alerts.refetch();
    if (result.data === undefined || result.isError) {
      setFailed(true);
      return;
    }
    setShown(result.data);
    if (result.data.unreadCount > 0) {
      readAll.mutate();
    }
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    setOpen(true);
    void load();
  }

  function close() {
    setOpen(false);
    setShown(null);
    buttonRef.current?.focus();
  }

  const badge = unreadBadge(unread);
  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        className="btn-tertiary"
        aria-label={text.button(unread)}
        aria-expanded={open}
        aria-controls="alerts-panel"
        onClick={toggle}
      >
        <IconBell aria-hidden="true" size={20} />
        {badge !== null && (
          <span className="badge badge--status-pending" aria-hidden="true">
            {badge}
          </span>
        )}
      </button>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {open && (
        <section id="alerts-panel" aria-labelledby="alerts-title" className="card stack">
          <h2 id="alerts-title" ref={headingRef} tabIndex={-1}>
            {text.title}
          </h2>
          <AlertsContent
            page={shown}
            failed={failed}
            onRetry={() => void load()}
            onOpenRecord={close}
          />
          <div>
            <button type="button" className="btn-tertiary" onClick={close}>
              {text.close}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

interface AlertsContentProps {
  readonly page: AlertsPage | null;
  readonly failed: boolean;
  readonly onRetry: () => void;
  readonly onOpenRecord: () => void;
}

function AlertsContent({ page, failed, onRetry, onOpenRecord }: AlertsContentProps) {
  if (failed) {
    return (
      <div role="alert" className="notice notice--error stack">
        <p>{text.loadError}</p>
        <div>
          <button type="button" className="btn-secondary" onClick={onRetry}>
            {text.retry}
          </button>
        </div>
      </div>
    );
  }
  if (page === null) {
    return <p role="status">{es.generic.loading}</p>;
  }
  if (page.items.length === 0) {
    return <p>{text.empty}</p>;
  }
  return (
    <>
      {page.totalCount > page.items.length && (
        <p className="field-hint">{text.hidden(page.items.length, page.totalCount)}</p>
      )}
      <ul className="stack">
        {page.items.map((alert) => (
          <li key={alert.alertId} className="stack">
            <p>
              {!alert.isRead && <span className="badge badge--status-pending">{text.unread}</span>}{' '}
              {alertText(alert)}
            </p>
            {alert.patientCode !== null && <p>{text.patientCode(alert.patientCode)}</p>}
            <p className="field-hint">
              {es.diary.at(formatLimaDate(alert.occurredAt), formatLimaTime(alert.occurredAt))}
            </p>
            <p>
              <Link to={`/pacientes/${alert.patientId}`} onClick={onOpenRecord}>
                {text.openRecord}
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
