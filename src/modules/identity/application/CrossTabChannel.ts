export type CrossTabEventType = 'activity' | 'signed-out' | 'idle-timeout' | 'session-expired';

// Only the event type and its timestamp travel between tabs: never a token or user data.
export interface CrossTabEvent {
  readonly type: CrossTabEventType;
  readonly at: number;
}

export interface CrossTabChannel {
  publish(event: CrossTabEvent): void;
  subscribe(listener: (event: CrossTabEvent) => void): () => void;
  close(): void;
}
