import type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';
import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';

// The triage panel, in the order the server decided.
export function listAssignedPatients(gateway: PatientsGateway): Promise<AssignedPatient[]> {
  return gateway.listAssigned();
}
