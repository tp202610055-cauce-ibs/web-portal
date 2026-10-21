const oneDecimal = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const twoDecimals = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatOneDecimal(value: number): string {
  return oneDecimal.format(value);
}

export function formatTwoDecimals(value: number): string {
  return twoDecimals.format(value);
}

// A calendar date (YYYY-MM-DD) shown as DD/MM/YYYY without converting zones, so the day never shifts.
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
