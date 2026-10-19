import { z } from 'zod';

export interface ApiProblem {
  readonly status: number;
  readonly errorCode?: string;
  readonly errors?: Record<string, string[]>;
  readonly lockedUntil?: string;
  readonly retryAfterSeconds?: number;
}

// The generated ProblemDetails type hides these extensions, so the raw body is read instead.
const problemBody = z.object({
  errorCode: z.string().optional().catch(undefined),
  errors: z.record(z.string(), z.array(z.string())).optional().catch(undefined),
  lockedUntil: z.string().optional().catch(undefined),
  retryAfterSeconds: z.number().optional().catch(undefined),
});

export function toApiProblem(status: number, body: unknown): ApiProblem {
  const parsed = problemBody.safeParse(body);
  return parsed.success ? { status, ...parsed.data } : { status };
}

// Tolerates error responses without a JSON body (404 or 405 from routing).
export async function readProblem(response: Response): Promise<ApiProblem> {
  try {
    return toApiProblem(response.status, await response.clone().json());
  } catch {
    return { status: response.status };
  }
}
