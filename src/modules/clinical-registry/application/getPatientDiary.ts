import type { ClinicalRegistryGateway } from '@/modules/clinical-registry/application/ClinicalRegistryGateway';
import { buildDiary, type DiaryEntry } from '@/modules/clinical-registry/domain/PatientDiary';

export const DIARY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface DiaryWindow {
  readonly from: Date;
  readonly to: Date;
}

// The last 30 days up to now; enough for today's records and for those that predate a recent link.
export function diaryWindow(now: Date): DiaryWindow {
  return { from: new Date(now.getTime() - DIARY_DAYS * DAY_MS), to: now };
}

export async function loadPatientDiary(
  gateway: ClinicalRegistryGateway,
  patientId: string,
  window: DiaryWindow,
  assignedAt: Date | null,
): Promise<DiaryEntry[]> {
  const events = await gateway.getPatientHistory(patientId, window.from, window.to);
  return buildDiary(events, assignedAt);
}
