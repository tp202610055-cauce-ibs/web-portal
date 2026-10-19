import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';
import type { PatientDetail, PatientEvolution } from '@/modules/patients/domain/PatientRecord';

// Every method throws ServiceUnavailableError when it cannot read and ContractViolationError when the
// response does not match the contract. The patient methods also throw PatientAccessDeniedError (403)
// and PatientNotFoundError (404).
export interface PatientsGateway {
  listAssigned(): Promise<AssignedPatient[]>;
  getDetail(patientId: string): Promise<PatientDetail>;
  getEvolution(patientId: string): Promise<PatientEvolution>;
}
