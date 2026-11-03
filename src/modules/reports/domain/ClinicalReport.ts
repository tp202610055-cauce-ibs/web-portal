// A calendar date without time or zone, as the contract sends it: YYYY-MM-DD.
export type CalendarDate = string;

// The PDF is built and encrypted by the server; the portal only gets a temporary download link.
export interface GeneratedReport {
  readonly downloadUrl: string;
  readonly expiresAt: Date;
}

export type ReportRefusal = 'no-data' | 'invalid-period' | 'access-denied';

export class ReportRefusedError extends Error {
  readonly reason: ReportRefusal;

  constructor(reason: ReportRefusal) {
    super(`The report was refused: ${reason}.`);
    this.name = 'ReportRefusedError';
    this.reason = reason;
  }
}

export type PeriodProblem = 'required' | 'order' | 'future';

// The same rules the server applies (end included, never after today); it only warns before sending.
// ISO dates compare correctly as text.
export function checkPeriod(
  start: CalendarDate,
  end: CalendarDate,
  today: CalendarDate,
): PeriodProblem | null {
  if (start === '' || end === '') {
    return 'required';
  }
  if (start > end) {
    return 'order';
  }
  return end > today ? 'future' : null;
}
