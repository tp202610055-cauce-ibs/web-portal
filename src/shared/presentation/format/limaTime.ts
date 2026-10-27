const LIMA = 'America/Lima';

const timeFormat = new Intl.DateTimeFormat('es-PE', {
  timeZone: LIMA,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dateFormat = new Intl.DateTimeFormat('es-PE', {
  timeZone: LIMA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const isoDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: LIMA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// The Lima calendar day of an instant, as YYYY-MM-DD.
export function todayInLima(now: Date): string {
  return isoDateFormat.format(now);
}

export function formatLimaTime(value: Date): string {
  return timeFormat.format(value);
}

export function formatLimaDate(value: Date): string {
  return dateFormat.format(value);
}

export function isSameLimaDay(a: Date, b: Date): boolean {
  return formatLimaDate(a) === formatLimaDate(b);
}

// Minutes and seconds left, as m:ss; never negative.
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
