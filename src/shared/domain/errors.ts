// The service could not be reached or failed (network error, 5xx or rate limit); it never ends a session.
export class ServiceUnavailableError extends Error {
  constructor() {
    super('The service is unavailable.');
    this.name = 'ServiceUnavailableError';
  }
}

// A response did not match the contract; the message names the schema, never the payload.
export class ContractViolationError extends Error {
  constructor(schema: string) {
    super(`The response does not match ${schema}.`);
    this.name = 'ContractViolationError';
  }
}
