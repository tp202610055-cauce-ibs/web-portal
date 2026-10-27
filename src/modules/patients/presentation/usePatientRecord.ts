import { useQuery } from '@tanstack/react-query';

import {
  getIbsSssCycle,
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

export function useIbsSssCycle(patientId: string) {
  const gateway = usePatientsGateway();
  return useQuery({
    queryKey: ['patients', 'ibs-sss-cycle', patientId],
    queryFn: () => getIbsSssCycle(gateway, patientId),
    retry: false,
  });
}
