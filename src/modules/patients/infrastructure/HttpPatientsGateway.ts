import type { PatientsGateway } from '@/modules/patients/application/PatientsGateway';
import type { AssignedPatient } from '@/modules/patients/domain/AssignedPatient';
import {
  PatientAccessDeniedError,
  PatientNotFoundError,
  type PatientDetail,
  type PatientEvolution,
} from '@/modules/patients/domain/PatientRecord';
import { toAssignedPatients } from '@/modules/patients/infrastructure/assignedPatientMapper';
import {
  toPatientDetail,
  toPatientEvolution,
} from '@/modules/patients/infrastructure/patientRecordMapper';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';

interface ApiResult {
  readonly data?: unknown;
  readonly response: Response;
}

// Network failures, 401s that could not be renewed and 5xx are all the same "could not load" state.
async function read<T extends ApiResult>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch {
    throw new ServiceUnavailableError();
  }
}

// A 403 means the patient is not assigned to this nutritionist; the cause is never shown.
function failureFor(status: number): Error {
  if (status === 403) {
    return new PatientAccessDeniedError();
  }
  if (status === 404) {
    return new PatientNotFoundError();
  }
  return new ServiceUnavailableError();
}

export class HttpPatientsGateway implements PatientsGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async listAssigned(): Promise<AssignedPatient[]> {
    const { data, response } = await read(() => this.api.GET('/api/v1/nutritionists/me/patients'));
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toAssignedPatients(data);
  }

  async getDetail(patientId: string): Promise<PatientDetail> {
    const { data, response } = await read(() =>
      this.api.GET('/api/v1/nutritionists/me/patients/{patientUserId}', {
        params: { path: { patientUserId: patientId } },
      }),
    );
    if (!response.ok) {
      throw failureFor(response.status);
    }
    return toPatientDetail(data);
  }

  async getEvolution(patientId: string): Promise<PatientEvolution> {
    const { data, response } = await read(() =>
      this.api.GET('/api/v1/nutritionists/me/patients/{patientId}/evolution', {
        params: { path: { patientId } },
      }),
    );
    if (!response.ok) {
      throw failureFor(response.status);
    }
    return toPatientEvolution(data);
  }
}
