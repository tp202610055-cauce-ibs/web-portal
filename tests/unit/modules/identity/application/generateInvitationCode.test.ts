import { describe, expect, it } from 'vitest';

import { generateInvitationCode } from '@/modules/identity/application/generateInvitationCode';

describe('generateInvitationCode', () => {
  it('generateInvitationCode_returnsWhatTheGatewayIssued', async () => {
    const issued = { code: 'ABCDEFGH23', expiresAt: new Date('2026-10-23T15:00:00Z') };

    expect(await generateInvitationCode({ generate: async () => issued })).toBe(issued);
  });
});
