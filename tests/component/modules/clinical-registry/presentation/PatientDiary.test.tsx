import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HistoryAccessDeniedError } from '@/modules/clinical-registry/domain/PatientDiary';
import { toHistoryEvents } from '@/modules/clinical-registry/infrastructure/historyMapper';
import { PatientDiary } from '@/modules/clinical-registry/presentation/PatientDiary';
import { ServiceUnavailableError } from '@/shared/domain/errors';
import { es } from '@/shared/presentation/i18n/es';

import {
  ClinicalRegistryTestProviders,
  fakeClinicalRegistryGateway,
} from '../../../../support/clinicalRegistry';
import { fakeFoodCatalogGateway } from '../../../../support/foods';
import {
  CAUSA_ID,
  cp034History,
  mealEvent,
  NOTE_MEAL,
  NOTE_SYMPTOM,
  symptomEvent,
} from '../../../../support/history';

const PATIENT = '00000000-0000-4000-8000-0000000000a1';
const window = { from: new Date('2026-09-26T15:00:00Z'), to: new Date('2026-10-26T20:00:00Z') };
const foods = fakeFoodCatalogGateway({
  getFood: async (foodId) => ({ foodId, name: 'Causa rellena', fodmapLevel: 'Moderate' }),
});

function renderDiary(
  getPatientHistory: () => Promise<ReturnType<typeof toHistoryEvents>>,
  assignedAt: Date | null = new Date('2026-10-01T15:00:00Z'),
) {
  return render(
    <ClinicalRegistryTestProviders
      registry={fakeClinicalRegistryGateway({ getPatientHistory })}
      foods={foods}
    >
      <PatientDiary patientId={PATIENT} assignedAt={assignedAt} window={window} />
    </ClinicalRegistryTestProviders>,
  );
}

describe('PatientDiary', () => {
  // CP034 steps 9 and 10: each note next to its record, with its date and time.
  it('showsEachNoteNextToItsRecord_withDateAndTime', async () => {
    renderDiary(async () => toHistoryEvents(cp034History));

    const items = await screen.findAllByRole('listitem');
    const symptom = items.find((item) => item.textContent?.includes('Dolor abdominal'));
    const meal = items.find((item) => item.textContent?.includes('Almuerzo'));
    expect(symptom).toHaveTextContent(`«${NOTE_SYMPTOM}»`);
    expect(symptom).toHaveTextContent('26/10/2026 a las 12:20');
    expect(meal).toHaveTextContent(`«${NOTE_MEAL}»`);
    expect(meal).toHaveTextContent('26/10/2026 a las 12:10');
    expect(
      await within(meal as HTMLElement).findByText('Causa rellena (150 g)'),
    ).toBeInTheDocument();
    expect(screen.queryByText(es.diary.beforeLink)).not.toBeInTheDocument();
  });

  // CP087 steps 6 and 7: records from before the link carry their notice.
  it('marksTheRecordsBeforeTheLink', async () => {
    renderDiary(
      async () =>
        toHistoryEvents([symptomEvent('2026-10-23T16:00:00Z'), mealEvent('2026-10-23T15:00:00Z')]),
      new Date('2026-10-26T15:00:00Z'),
    );

    expect(await screen.findAllByText(es.diary.beforeLink)).toHaveLength(2);
    expect(screen.getByText(es.diary.beforeLinkNotice('26/10/2026'))).toBeInTheDocument();
    expect(screen.getByText(/Intensidad 65 de 100/)).toBeInTheDocument();
  });

  it('withoutRecords_saysSo', async () => {
    renderDiary(async () => []);

    expect(await screen.findByText(es.diary.empty)).toBeInTheDocument();
  });

  it('aPatientFood_isLabelledAsCustom', async () => {
    renderDiary(async () =>
      toHistoryEvents([
        mealEvent('2026-10-26T15:00:00Z', {
          items: [{ foodId: null, customFoodId: CAUSA_ID, quantity: 1, unit: 'Units' }],
        }),
      ]),
    );

    expect(await screen.findByText('Alimento personalizado (1 unidad(es))')).toBeInTheDocument();
  });

  it('accessDenied_isFinal', async () => {
    renderDiary(async () => {
      throw new HistoryAccessDeniedError();
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(es.diary.accessDenied);
    expect(screen.queryByRole('button', { name: es.diary.retry })).not.toBeInTheDocument();
  });

  it('aFailure_offersARetry', async () => {
    const user = userEvent.setup();
    const history = vi
      .fn()
      .mockRejectedValueOnce(new ServiceUnavailableError())
      .mockResolvedValueOnce([]);
    renderDiary(history);

    await user.click(await screen.findByRole('button', { name: es.diary.retry }));

    expect(await screen.findByText(es.diary.empty)).toBeInTheDocument();
  });
});
