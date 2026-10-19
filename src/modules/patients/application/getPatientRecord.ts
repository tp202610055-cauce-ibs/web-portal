import type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';
import type { PatientDetail, PatientEvolution } from '@/modules/patients/domain/PatientRecord';

// The route carries a UUID; anything else is not a patient and never reaches the server.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPatientId(value: string | undefined): value is string {
  return value !== undefined && UUID.test(value);
}

export function getPatientDetail(
  gateway: PatientsGateway,
  patientId: string,
): Promise<PatientDetail> {
  return gateway.getDetail(patientId);
}

export function getPatientEvolution(
  gateway: PatientsGateway,
  patientId: string,
): Promise<PatientEvolution> {
  return gateway.getEvolution(patientId);
}
