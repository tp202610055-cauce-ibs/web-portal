import { useQuery } from '@tanstack/react-query';

import { listAssignedPatients } from '@/modules/patients/application/listAssignedPatients';
import { usePatientsGateway } from '@/modules/patients/presentation/PatientsContext';

export const PATIENTS_PANEL_QUERY_KEY = ['patients', 'assigned'] as const;

// No automatic retries: a failure shows the error state at once and the user decides when to retry.
export function usePatientsPanel() {
  const gateway = usePatientsGateway();
  return useQuery({
    queryKey: PATIENTS_PANEL_QUERY_KEY,
    queryFn: () => listAssignedPatients(gateway),
    retry: false,
  });
}
