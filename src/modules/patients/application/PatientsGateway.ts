import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';

// Throws ServiceUnavailableError when the list cannot be read and ContractViolationError when the
// response does not match the contract.
export interface PatientsGateway {
  listAssigned(): Promise<AssignedPatient[]>;
}
