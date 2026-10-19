import { describe, expect, it } from 'vitest';

import {
  toPatientDetail,
  toPatientEvolution,
} from '@/modules/patients/infrastructure/patientRecordMapper';
import { ContractViolationError } from '@/shared/domain/errors';

import {
  assessment,
  detailBody,
  detailWithoutProfile,
  evolutionBody,
  evolutionCp056A,
} from '../../../../support/patientRecord';

describe('toPatientDetail', () => {
  it('toPatientDetail_withProfile_mapsFieldsAndAllergies', () => {
    expect(toPatientDetail(detailBody())).toMatchObject({
      fullName: 'Paciente Prueba A',
      bmiCategory: 'normal',
      biologicalSex: 'Female',
      diagnosisDate: '2025-03-14',
      allergies: [{ name: 'Lactosa', type: 'Intolerance', severity: 'Moderate' }],
    });
  });

  it('toPatientDetail_withoutProfile_keepsNulls', () => {
    expect(toPatientDetail(detailWithoutProfile)).toMatchObject({
      age: null,
      ibsSubtype: null,
      biologicalSex: null,
      diagnosisDate: null,
      onboardingCompleted: false,
      allergies: [],
    });
  });

  it('toPatientDetail_withNullAllergies_returnsAnEmptyList', () => {
    expect(toPatientDetail(detailBody({ allergies: null })).allergies).toEqual([]);
  });

  it('toPatientDetail_withUnknownBmiCategory_dropsOnlyTheLabel', () => {
    const detail = toPatientDetail(detailBody({ bmiCategory: 'very-low' }));

    expect(detail.bmiCategory).toBeNull();
    expect(detail.bmi).toBe(22.86);
  });

  it.each([
    ['unknown sex', detailBody({ biologicalSex: 'X' as never })],
    ['date with time', detailBody({ diagnosisDate: '2025-03-14T00:00:00Z' })],
    ['no id', { ...detailBody(), patientUserId: '' }],
  ])('toPatientDetail_with%s_failsExplicitly', (_name, payload) => {
    expect(() => toPatientDetail(payload)).toThrow(ContractViolationError);
  });
});

describe('toPatientEvolution', () => {
  it('toPatientEvolution_keepsTheServerOrderAndValues', () => {
    const evolution = toPatientEvolution(evolutionCp056A);

    expect(evolution.timeline.map((point) => point.totalScore)).toEqual([320, 280, 245]);
    expect(evolution.timeline.map((point) => point.type)).toEqual([
      'Baseline',
      'Periodic',
      'Periodic',
    ]);
    expect(evolution.percentChangeFromBaseline).toBe(-23.44);
    expect(evolution.timeline[2]?.completedAt).toEqual(new Date('2026-10-19T15:00:00Z'));
  });

  it('toPatientEvolution_withUnknownSeverity_dropsOnlyTheLabel', () => {
    const payload = evolutionBody({
      ibsSssTimeline: [
        assessment(0, 40, '2026-10-01T15:00:00Z', { severityCategory: 'Remission' as never }),
      ],
    });

    expect(toPatientEvolution(payload).timeline[0]).toMatchObject({
      totalScore: 40,
      severity: null,
    });
  });

  it('toPatientEvolution_withNullTimeline_returnsAnEmptyTimeline', () => {
    expect(toPatientEvolution(evolutionBody({ ibsSssTimeline: null })).timeline).toEqual([]);
  });

  it('toPatientEvolution_withPayloadOutsideTheContract_failsExplicitly', () => {
    expect(() => toPatientEvolution({ ibsSssTimeline: [] })).toThrow(ContractViolationError);
  });
});
