const oneDecimal = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatOneDecimal(value: number): string {
  return oneDecimal.format(value);
}

// A calendar date (YYYY-MM-DD) shown as DD/MM/YYYY without converting zones, so the day never shifts.
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
