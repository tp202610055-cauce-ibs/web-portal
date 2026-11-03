export type NutritionistAlertType = 'PatientLinked' | 'PatientSubtypeChanged';

// An alert about one of the nutritionist's patients; the message is the server's text.
export interface NutritionistAlert {
  readonly alertId: string;
  readonly type: NutritionistAlertType;
  readonly patientId: string;
  readonly patientName: string | null;
  readonly patientCode: string | null;
  readonly message: string | null;
  readonly occurredAt: Date;
  readonly isRead: boolean;
}

// The unread count covers the whole inbox, not only the page that was read.
export interface AlertsPage {
  readonly items: NutritionistAlert[];
  readonly totalCount: number;
  readonly unreadCount: number;
}

// What the bell shows over its icon: nothing at zero and "9+" from ten on.
export function unreadBadge(unread: number): string | null {
  if (unread <= 0) {
    return null;
  }
  return unread >= 10 ? '9+' : String(unread);
}
