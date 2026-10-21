export interface DecisionAttempt {
  readonly content: string;
  readonly key: string;
}

// Retrying the same content reuses its Idempotency-Key; changed content is a new request with a new key.
export function attemptFor(
  previous: DecisionAttempt | null,
  content: string,
  newKey: () => string,
): DecisionAttempt {
  return previous !== null && previous.content === content ? previous : { content, key: newKey() };
}
