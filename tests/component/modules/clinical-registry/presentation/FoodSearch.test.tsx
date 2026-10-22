import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';
import type { FoodSummary } from '@/modules/clinical-registry/domain/FoodSummary';
import { toFoodSummaries } from '@/modules/clinical-registry/infrastructure/foodSummaryMapper';
import { FoodCatalogProvider } from '@/modules/clinical-registry/presentation/FoodCatalogContext';
import { FoodSearch } from '@/modules/clinical-registry/presentation/FoodSearch';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import { DAIRY_ID, dairyResults, foodBody } from '../../../../support/foods';

const LABEL = 'Agregar alimento';
const dairy = toFoodSummaries(dairyResults);

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function renderSearch(
  search: FoodCatalogGateway['search'],
  props: { excludedFoodIds?: string[]; onSelect?: (food: FoodSummary) => void } = {},
) {
  const onSelect = props.onSelect ?? vi.fn();
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <FoodCatalogProvider gateway={{ search }}>
        <FoodSearch label={LABEL} excludedFoodIds={props.excludedFoodIds} onSelect={onSelect} />
      </FoodCatalogProvider>
    </QueryClientProvider>,
  );
  return { ...view, onSelect };
}

function type(text: string) {
  fireEvent.change(screen.getByRole('searchbox', { name: LABEL }), { target: { value: text } });
}

// TanStack Query batches its notifications with zero-delay timers, so those are flushed too.
async function wait(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
  for (let flush = 0; flush < 3; flush += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  }
}

describe('FoodSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // R12: the 300 ms wait restarts with each keystroke and only the settled text is searched.
  it('typing_waits300msAfterTheLastKeystroke', async () => {
    const search = vi.fn<FoodCatalogGateway['search']>().mockResolvedValue(dairy);
    renderSearch(search);

    type('lá');
    await wait(200);
    type('lác');
    await wait(299);
    expect(search).not.toHaveBeenCalled();

    await wait(1);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('lác');
    expect(screen.getByRole('status')).toHaveTextContent('2 resultados');
  });

  it.each(['', '   ', 'l', ' l '])('text_%j_neverSearches', async (text) => {
    const search = vi.fn<FoodCatalogGateway['search']>().mockResolvedValue(dairy);
    renderSearch(search);

    type(text);
    await wait(1000);

    expect(search).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('text_isTrimmedBeforeSearching', async () => {
    const search = vi.fn<FoodCatalogGateway['search']>().mockResolvedValue(dairy);
    renderSearch(search);

    type('  lácteos  ');
    await wait(300);

    expect(search).toHaveBeenCalledWith('lácteos');
  });

  // A slow answer to an older text never replaces the results of the current text.
  it('slowOlderAnswer_doesNotReplaceTheCurrentResults', async () => {
    const older = deferred<FoodSummary[]>();
    const search = vi.fn<FoodCatalogGateway['search']>((query) =>
      query === 'le'
        ? older.promise
        : Promise.resolve(toFoodSummaries([foodBody({ name: 'Leche entera de vaca' })])),
    );
    renderSearch(search);

    type('le');
    await wait(300);
    type('lec');
    await wait(300);
    expect(screen.getByRole('button', { name: /Leche entera de vaca/ })).toBeInTheDocument();

    older.resolve(toFoodSummaries([foodBody({ name: 'Lenteja cocida' })]));
    await wait(0);

    expect(screen.getByRole('button', { name: /Leche entera de vaca/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lenteja cocida/ })).not.toBeInTheDocument();
  });

  it('unmountBeforeTheWait_neverSearches', async () => {
    const search = vi.fn<FoodCatalogGateway['search']>().mockResolvedValue(dairy);
    const { unmount } = renderSearch(search);

    type('lácteos');
    unmount();
    await wait(1000);

    expect(search).not.toHaveBeenCalled();
  });

  it('whileWaiting_saysItIsSearching', async () => {
    renderSearch(() => new Promise(() => undefined));

    type('lácteos');

    expect(screen.getByRole('status')).toHaveTextContent(es.foodSearch.searching);
    await wait(300);
    expect(screen.getByRole('status')).toHaveTextContent(es.foodSearch.searching);
  });

  it('choosingAFood_reportsItAndClearsTheField', async () => {
    const { onSelect } = renderSearch(async () => dairy);

    type('lácteos');
    await wait(300);
    fireEvent.click(screen.getByRole('button', { name: /Lácteos con lactosa/ }));

    expect(onSelect).toHaveBeenCalledWith(dairy[0]);
    expect(screen.getByRole('searchbox', { name: LABEL })).toHaveValue('');
    expect(screen.queryByRole('list', { name: LABEL })).not.toBeInTheDocument();
  });

  it('foodAlreadyInUse_cannotBeChosenAgain', async () => {
    renderSearch(async () => dairy, { excludedFoodIds: [DAIRY_ID] });

    type('lácteos');
    await wait(300);
    const list = screen.getByRole('list', { name: LABEL });

    expect(within(list).getByRole('button', { name: /Lácteos con lactosa/ })).toBeDisabled();
    expect(within(list).getByRole('button', { name: /Lácteos con lactosa/ })).toHaveTextContent(
      es.foodSearch.alreadyAdded,
    );
    expect(within(list).getByRole('button', { name: /Leche sin lactosa/ })).toHaveTextContent(
      es.fodmapLevel.Low,
    );
  });

  it('noMatches_saysSo', async () => {
    renderSearch(async () => []);

    type('xyz');
    await wait(300);

    expect(screen.getByRole('status')).toHaveTextContent(es.foodSearch.noResults);
  });

  it('failedSearch_saysItCouldNotSearch', async () => {
    renderSearch(async () => {
      throw new ServiceUnavailableError();
    });

    type('lácteos');
    await wait(300);

    expect(screen.getByRole('status')).toHaveTextContent(es.foodSearch.error);
  });

  it('foodWithoutName_showsAPlaceholder', async () => {
    renderSearch(async () => toFoodSummaries([foodBody({ name: null })]));

    type('lácteos');
    await wait(300);

    expect(screen.getByRole('button', { name: new RegExp(es.foodSearch.unnamed) })).toBeEnabled();
  });

  it('oneResult_saysOneResult', async () => {
    renderSearch(async () => toFoodSummaries([foodBody()]));

    type('lácteos');
    await wait(300);

    expect(screen.getByRole('status')).toHaveTextContent('1 resultado');
  });
});
