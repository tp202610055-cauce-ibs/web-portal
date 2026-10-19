import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CrossTabEvent } from '@/modules/identity';
import { BroadcastCrossTabChannel } from '@/modules/identity/infrastructure/BroadcastCrossTabChannel';

function nextEvent(channel: BroadcastCrossTabChannel): Promise<CrossTabEvent> {
  return new Promise((resolve) => {
    const unsubscribe = channel.subscribe((event) => {
      unsubscribe();
      resolve(event);
    });
  });
}

describe('BroadcastCrossTabChannel', () => {
  const opened: BroadcastCrossTabChannel[] = [];

  function open(): BroadcastCrossTabChannel {
    const channel = new BroadcastCrossTabChannel();
    opened.push(channel);
    return channel;
  }

  afterEach(() => {
    for (const channel of opened.splice(0)) {
      channel.close();
    }
    vi.unstubAllGlobals();
  });

  it('publish_deliversOnlyTypeAndTimestampToAnotherTab', async () => {
    const sender = open();
    const receiver = open();
    const received = nextEvent(receiver);

    sender.publish({ type: 'signed-out', at: 1234 });

    expect(await received).toEqual({ type: 'signed-out', at: 1234 });
  });

  it('subscribe_ignoresMessagesOutsideTheProtocol', async () => {
    const receiver = open();
    const listener = vi.fn();
    receiver.subscribe(listener);
    const raw = new BroadcastChannel('cauce-portal-session');
    const valid = nextEvent(receiver);

    raw.postMessage({ type: 'token', value: 'secret' });
    raw.postMessage({ type: 'activity', at: 99 });
    await valid;
    raw.close();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ type: 'activity', at: 99 });
  });

  it('withoutBroadcastChannel_worksAlone', () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    const channel = new BroadcastCrossTabChannel();

    const unsubscribe = channel.subscribe(vi.fn());
    channel.publish({ type: 'activity', at: 1 });
    unsubscribe();
    channel.close();

    expect(typeof unsubscribe).toBe('function');
  });
});
