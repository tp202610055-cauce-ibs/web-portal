import { z } from 'zod';

import type { PortalSessionGrant } from '@/modules/identity/application/PortalAuthGateway';
import { ContractViolationError } from '@/shared/domain/errors';

// The generated type marks every field as present; this schema is what actually guards the payload.
const portalSessionResult = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  tokenType: z.string().refine((value) => value.toLowerCase() === 'bearer'),
  user: z.object({
    userId: z.string().min(1),
    role: z.string().min(1),
    fullName: z.string().nullable(),
  }),
});

export function toPortalSessionGrant(payload: unknown): PortalSessionGrant {
  const parsed = portalSessionResult.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('PortalSessionResult');
  }
  const { accessToken, expiresIn, user } = parsed.data;
  return {
    accessToken,
    expiresInSeconds: expiresIn,
    user: { userId: user.userId, role: user.role, fullName: user.fullName ?? '' },
  };
}
