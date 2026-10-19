import { useQuery } from '@tanstack/react-query';

import {
  getPatientDetail,
  getPatientEvolution,
} from '@/modules/patients/application/getPatientRecord';
import { usePatientsGateway } from '@/modules/patients/presentation/PatientsContext';

// One cached query per patient: Summary and Evolution read the same evolution data.
export function usePatientDetail(patientId: string) {
  const gateway = usePatientsGateway();
  return useQuery({
    queryKey: ['patients', 'detail', patientId],
    queryFn: () => getPatientDetail(gateway, patientId),
    retry: false,
  });
}

export function usePatientEvolution(patientId: string) {
  const gateway = usePatientsGateway();
  return useQuery({
    queryKey: ['patients', 'evolution', patientId],
    queryFn: () => getPatientEvolution(gateway, patientId),
    retry: false,
  });
}
