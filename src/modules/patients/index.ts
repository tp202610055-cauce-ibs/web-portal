export type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';
export type {
  AssignedPatient,
  IbsSubtype,
  PriorityLevel,
} from '@/modules/patients/domain/AssignedPatient';
export { HttpPatientsGateway } from '@/modules/patients/infrastructure/HttpPatientsGateway';
export { PatientRecordPage } from '@/modules/patients/presentation/PatientRecordPage';
export { PatientManagementPage } from '@/modules/patients/presentation/PatientManagementPage';
export { PatientsProvider } from '@/modules/patients/presentation/PatientsContext';
export { PatientsPage } from '@/modules/patients/presentation/PatientsPage';
