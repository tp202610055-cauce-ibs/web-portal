import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ClinicalRegistryGateway } from '@/modules/clinical-registry/application/ClinicalRegistryGateway';
import { glossaryFrom, TermRequestRefusedError } from '@/modules/clinical-registry/domain/Glossary';
import { GlossaryPage } from '@/modules/clinical-registry/presentation/GlossaryPage';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  ClinicalRegistryTestProviders,
  fakeClinicalRegistryGateway,
} from '../../../../support/clinicalRegistry';

// The terms CP068 and CP069 rely on; definitions are synthetic.
const glossaryCp068 = glossaryFrom(
  [
    {
      term: 'Disacáridos',
      definition: 'Azúcares formados por dos moléculas.',
      category: 'Nutritional',
    },
    {
      term: 'FODMAP',
      definition: 'Carbohidratos que el intestino fermenta.',
      category: 'Nutritional',
    },
    { term: 'IBS-SSS', definition: 'Cuestionario de severidad del SII.', category: 'ClinicalIbs' },
    { term: 'Línea base', definition: 'Tu primer puntaje IBS-SSS.', category: 'System' },
  ],
  'draft-pending-clinical-review',
);

function renderGlossary(
  getGlossary = async () => glossaryCp068,
  requestTerm: ClinicalRegistryGateway['requestTerm'] = async () => 'created',
) {
  return render(
    <ClinicalRegistryTestProviders
      registry={fakeClinicalRegistryGateway({ getGlossary, requestTerm })}
    >
      <GlossaryPage />
    </ClinicalRegistryTestProviders>,
  );
}

async function search(text: string) {
  const user = userEvent.setup();
  const box = await screen.findByRole('searchbox', { name: es.glossary.searchLabel });
  await user.clear(box);
  if (text !== '') {
    await user.type(box, text);
  }
  return user;
}

describe('GlossaryPage', () => {
  // CP068 step 10: the definition in Spanish and the type of the term.
  it('search_showsTheDefinitionAndTheType', async () => {
    renderGlossary();
    const user = await search('FODMAP');

    await user.click(screen.getByText('FODMAP', { selector: 'summary' }));

    expect(screen.getByText('Carbohidratos que el intestino fermenta.')).toBeVisible();
    expect(screen.getByText(es.glossaryCategory.Nutritional)).toBeVisible();
    expect(screen.queryByText('IBS-SSS', { selector: 'summary' })).not.toBeInTheDocument();
    expect(screen.getByText(es.glossary.draftNote)).toBeInTheDocument();
  });

  // CP069 part B: not found, with «Disacáridos» among the similar terms.
  it('unknownTerm_saysItIsNotThere_andOffersSimilarTerms', async () => {
    renderGlossary();
    const user = await search('disacaridasas');

    expect(screen.getByRole('status')).toHaveTextContent(es.glossary.notFound);
    const similar = screen.getByRole('button', { name: 'Disacáridos' });
    await user.click(similar);

    expect(screen.getByText('Disacáridos', { selector: 'summary' })).toBeInTheDocument();
  });

  // CP069 variant B: no similar term and no error, only the notice.
  it('unknownTermWithoutSimilar_showsOnlyTheNotice', async () => {
    renderGlossary();
    await search('xyzqw');

    expect(screen.getByRole('status')).toHaveTextContent(es.glossary.notFound);
    expect(screen.queryByText(es.glossary.suggestions)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('aFailure_offersARetry', async () => {
    const getGlossary = vi
      .fn()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce(glossaryCp068);
    renderGlossary(getGlossary);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: es.glossary.retry }));

    expect(
      await screen.findByRole('searchbox', { name: es.glossary.searchLabel }),
    ).toBeInTheDocument();
  });

  it('anEmptyGlossary_saysSo', async () => {
    renderGlossary(async () => glossaryFrom([], null));

    expect(await screen.findByText(es.glossary.empty)).toBeInTheDocument();
    expect(screen.queryByText(es.glossary.draftNote)).not.toBeInTheDocument();
  });

  // CP089 steps 3 to 5: not found, the option to request it, confirm and the confirmation.
  it('unknownTerm_canBeRequested_afterConfirming', async () => {
    const requestTerm = vi.fn<ClinicalRegistryGateway['requestTerm']>(async () => 'created');
    renderGlossary(undefined, requestTerm);
    const user = await search('disacaridasas');

    await user.click(screen.getByRole('button', { name: es.glossary.request }));
    expect(screen.getByText(es.glossary.confirmRequest('disacaridasas'))).toBeInTheDocument();
    expect(requestTerm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: es.glossary.confirm }));

    expect(await screen.findByText(es.glossary.requested)).toBeInTheDocument();
    expect(requestTerm).toHaveBeenCalledWith('disacaridasas');
  });

  it.each([
    [async () => 'already-pending', es.glossary.alreadyPending],
    [
      async () => {
        throw new TermRequestRefusedError('already-exists');
      },
      es.glossary.alreadyExists,
    ],
    [
      async () => {
        throw new Error('down');
      },
      es.glossary.requestError,
    ],
  ] as [ClinicalRegistryGateway['requestTerm'], string][])(
    'request_outcome_%#_hasItsOwnText',
    async (requestTerm, message) => {
      renderGlossary(undefined, requestTerm);
      const user = await search('xyzqw');

      await user.click(screen.getByRole('button', { name: es.glossary.request }));
      await user.click(screen.getByRole('button', { name: es.glossary.confirm }));

      expect(await screen.findByText(message)).toBeInTheDocument();
    },
  );

  it('aTermOver100Characters_cannotBeRequested', async () => {
    renderGlossary();
    await search('x'.repeat(101));

    expect(screen.getByRole('button', { name: es.glossary.request })).toBeDisabled();
    expect(screen.getByText(es.glossary.tooLong)).toBeInTheDocument();
  });

  it('aFoundTerm_offersNoRequest', async () => {
    renderGlossary();
    await search('FODMAP');

    expect(screen.queryByRole('button', { name: es.glossary.request })).not.toBeInTheDocument();
  });
});
