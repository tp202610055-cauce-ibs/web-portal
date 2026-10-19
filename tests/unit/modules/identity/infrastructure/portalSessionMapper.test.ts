import { describe, expect, it } from 'vitest';

import { toPortalSessionGrant } from '@/modules/identity/infrastructure/portalSessionMapper';
import { ContractViolationError } from '@/shared/domain/errors';

import { portalSessionBody } from '../../../../support/portalSession';

describe('toPortalSessionGrant', () => {
  it('toPortalSessionGrant_withNullFullName_usesAnEmptyName', () => {
    const body = portalSessionBody();

    const result = toPortalSessionGrant({ ...body, user: { ...body.user, fullName: null } });

    expect(result.user.fullName).toBe('');
  });

  it.each([
    ['missing access token', { accessToken: undefined }],
    ['empty access token', { accessToken: '' }],
    ['non-positive lifetime', { expiresIn: 0 }],
    ['non-bearer token type', { tokenType: 'MAC' }],
    ['missing user', { user: undefined }],
  ])('toPortalSessionGrant_with%s_failsExplicitly', (_name, override) => {
    const payload = { ...portalSessionBody(), ...override };

    expect(() => toPortalSessionGrant(payload)).toThrow(ContractViolationError);
  });

  it('toPortalSessionGrant_failure_doesNotEchoThePayload', () => {
    expect(() => toPortalSessionGrant({ accessToken: 'secret-value' })).toThrow(
      'The response does not match PortalSessionResult.',
    );
  });
});
