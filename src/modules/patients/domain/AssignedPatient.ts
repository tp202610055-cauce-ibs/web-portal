export type PriorityLevel = 'None' | 'Low' | 'Medium' | 'High';

export type IbsSubtype = 'IbsD' | 'IbsC' | 'IbsM' | 'IbsU';

// One row of the triage panel. Priority and order come from the server and are never recomputed.
export interface AssignedPatient {
  readonly patientUserId: string;
  readonly fullName: string | null;
  readonly assignedAt: Date;
  readonly profileCompleted: boolean;
  readonly ibsSubtype: IbsSubtype | null;
  readonly latestIbsSssScore: number | null;
  readonly lastActivityAt: Date | null;
  readonly pendingReviewOver24hCount: number;
  readonly priorityLevel: PriorityLevel;
}
