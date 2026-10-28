import { z } from 'zod';

import type { ClinicalRegistryGateway } from '@/modules/clinical-registry/application/ClinicalRegistryGateway';
import {
  glossaryFrom,
  TermRequestRefusedError,
  type Glossary,
  type TermRequestOutcome,
} from '@/modules/clinical-registry/domain/Glossary';
import {
  HistoryAccessDeniedError,
  type HistoryEvent,
} from '@/modules/clinical-registry/domain/PatientDiary';
import { toHistoryEvents } from '@/modules/clinical-registry/infrastructure/historyMapper';
import { ContractViolationError, ServiceUnavailableError } from '@/shared/domain/errors';
import type { ApiClient } from '@/shared/infrastructure/apiClient';
import { toApiProblem } from '@/shared/infrastructure/problemReader';

interface ApiResult {
  readonly data?: unknown;
  readonly error?: unknown;
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

// Term and definition are declared nullable; a term without its text is not shown.
const glossary = z.object({
  terms: z
    .array(
      z.object({
        term: z.string().nullable(),
        definition: z.string().nullable(),
        category: z.enum(['Nutritional', 'ClinicalIbs', 'System']).nullable().catch(null),
      }),
    )
    .nullable(),
  contentStatus: z.string().nullable(),
});

export class HttpClinicalRegistryGateway implements ClinicalRegistryGateway {
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  // The range travels in UTC with its zone, which is what the server requires.
  async getPatientHistory(patientId: string, from: Date, to: Date): Promise<HistoryEvent[]> {
    const { data, response } = await read(() =>
      this.api.GET('/api/v1/nutritionists/me/patients/{patientId}/history', {
        params: { path: { patientId }, query: { from: from.toISOString(), to: to.toISOString() } },
      }),
    );
    if (response.status === 403) {
      throw new HistoryAccessDeniedError();
    }
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    return toHistoryEvents(data);
  }

  async getGlossary(): Promise<Glossary> {
    const { data, response } = await read(() => this.api.GET('/api/v1/glossary'));
    if (!response.ok) {
      throw new ServiceUnavailableError();
    }
    const parsed = glossary.safeParse(data);
    if (!parsed.success) {
      throw new ContractViolationError('GlossaryResult');
    }
    const terms = (parsed.data.terms ?? []).flatMap((entry) =>
      entry.term === null || entry.term.trim() === ''
        ? []
        : [{ term: entry.term, definition: entry.definition ?? '', category: entry.category }],
    );
    return glossaryFrom(terms, parsed.data.contentStatus);
  }

  // 201 is a new request and 200 the one already pending; the term travels trimmed.
  async requestTerm(term: string): Promise<TermRequestOutcome> {
    const { error, response } = await read(() =>
      this.api.POST('/api/v1/glossary/term-requests', { body: { term: term.trim() } }),
    );
    if (response.ok) {
      return response.status === 201 ? 'created' : 'already-pending';
    }
    const problem = toApiProblem(response.status, error);
    if (response.status === 409 && problem.errorCode === 'glossary_term_already_exists') {
      throw new TermRequestRefusedError('already-exists');
    }
    if (response.status === 400) {
      throw new TermRequestRefusedError('invalid');
    }
    throw new ServiceUnavailableError();
  }
}
