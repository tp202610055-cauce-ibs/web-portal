import { z } from 'zod';

import type {
  CrossTabChannel,
  CrossTabEvent,
} from '@/modules/identity/application/CrossTabChannel';

const CHANNEL_NAME = 'cauce-portal-session';

const crossTabEvent = z.object({
  type: z.enum(['activity', 'signed-out', 'idle-timeout', 'session-expired']),
  at: z.number().finite(),
});

// Without BroadcastChannel the tab works alone: publishing and subscribing do nothing.
export class BroadcastCrossTabChannel implements CrossTabChannel {
  private readonly channel: BroadcastChannel | null =
    typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL_NAME) : null;

  publish(event: CrossTabEvent): void {
    this.channel?.postMessage({ type: event.type, at: event.at });
  }

  subscribe(listener: (event: CrossTabEvent) => void): () => void {
    const channel = this.channel;
    if (channel === null) {
      return () => undefined;
    }
    const handler = (message: MessageEvent<unknown>) => {
      const parsed = crossTabEvent.safeParse(message.data);
      if (parsed.success) {
        listener(parsed.data);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }

  close(): void {
    this.channel?.close();
  }
}
