import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { generateInvitationCode } from '@/modules/identity/application/generateInvitationCode';
import {
  InvitationRefusedError,
  type InvitationCode,
} from '@/modules/identity/domain/InvitationCode';
import { useInvitationGateway } from '@/modules/identity/presentation/InvitationsContext';
import { formatLimaDate, formatLimaTime } from '@/shared/presentation/format/limaTime';
import { es } from '@/shared/presentation/i18n/es';

const HOUR_MS = 60 * 60 * 1000;

interface IssuedCode extends InvitationCode {
  readonly validHours: number;
}

type CopyStatus = 'copied' | 'failed' | null;

function errorMessage(error: unknown): string {
  return error instanceof InvitationRefusedError
    ? es.invitations.refused[error.reason]
    : es.generic.error;
}

// The clipboard is missing outside secure contexts and may be refused; both end in a message.
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator.clipboard?.writeText !== 'function') {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function InvitationCodeGenerator() {
  const gateway = useInvitationGateway();
  const [issued, setIssued] = useState<IssuedCode | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const mutation = useMutation({
    mutationFn: () => generateInvitationCode(gateway),
    onMutate: () => setCopyStatus(null),
    onSuccess: (invitation) =>
      setIssued({
        ...invitation,
        validHours: Math.round((invitation.expiresAt.getTime() - Date.now()) / HOUR_MS),
      }),
  });

  async function copy(code: string) {
    setCopyStatus((await copyToClipboard(code)) ? 'copied' : 'failed');
  }

  return (
    <div className="stack">
      <div>
        <button
          type="button"
          className="btn-primary"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? es.invitations.generating : es.invitations.generate}
        </button>
      </div>
      {mutation.isError && (
        <p role="alert" className="notice notice--error">
          {errorMessage(mutation.error)}
        </p>
      )}
      {issued !== null && (
        <div className="card stack">
          <p>{es.invitations.codeLabel}</p>
          <p className="invitation-code">{issued.code}</p>
          <p>
            {es.invitations.expires(
              formatLimaDate(issued.expiresAt),
              formatLimaTime(issued.expiresAt),
              issued.validHours,
            )}
          </p>
          <div>
            <button type="button" className="btn-secondary" onClick={() => void copy(issued.code)}>
              {es.invitations.copy}
            </button>
          </div>
          {copyStatus === 'copied' && <p role="status">{es.invitations.copied}</p>}
          {copyStatus === 'failed' && (
            <p role="alert" className="field-error">
              {es.invitations.copyFailed}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
