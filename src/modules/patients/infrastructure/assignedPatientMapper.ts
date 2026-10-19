import { z } from 'zod';

import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';
import { ContractViolationError } from '@/shared/domain/errors';

const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

// Name, subtype, score and last activity may be null (no profile yet, or nothing recorded).
const assignedPatientSummary = z.object({
  patientUserId: z.string().min(1),
  patientFullName: z.string().nullable(),
  assignedAt: instant,
  profileCompleted: z.boolean(),
  ibsSubtype: z.enum(['IbsD', 'IbsC', 'IbsM', 'IbsU']).nullable(),
  latestIbsSssScore: z.number().int().nullable(),
  lastActivityAt: instant.nullable(),
  pendingReviewOver24hCount: z.number().int().nonnegative(),
  priorityLevel: z.enum(['None', 'Low', 'Medium', 'High']),
});

export function toAssignedPatients(payload: unknown): AssignedPatient[] {
  const parsed = z.array(assignedPatientSummary).safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('AssignedPatientSummary[]');
  }
  return parsed.data.map((row) => ({
    patientUserId: row.patientUserId,
    fullName: row.patientFullName,
    assignedAt: row.assignedAt,
    profileCompleted: row.profileCompleted,
    ibsSubtype: row.ibsSubtype,
    latestIbsSssScore: row.latestIbsSssScore,
    lastActivityAt: row.lastActivityAt,
    pendingReviewOver24hCount: row.pendingReviewOver24hCount,
    priorityLevel: row.priorityLevel,
  }));
}
