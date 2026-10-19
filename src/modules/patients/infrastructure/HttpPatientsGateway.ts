import type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';
import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';
import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';

export class HttpPatientsGateway implements PatientsGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  // Any failure (network, 401 that could not be renewed, 5xx) is the same "could not load" state.
  async listAssigned(): Promise<AssignedPatient[]> {
    let result;
    try {
      result = await this.api.GET('/api/v1/nutritionists/me/patients');
    } catch {
      throw new ServiceUnavailableError();
    }
    if (!result.response.ok) {
      throw new ServiceUnavailableError();
    }
    return toAssignedPatients(result.data);
  }
}
