import type { components } from '@/shared/infrastructure/api/generated/schema';

type Detail = components['schemas']['GetAssignedPatientDetailResult'];
type Evolution = components['schemas']['PatientEvolutionForNutritionistResult'];
type Assessment = components['schemas']['IbsSssAssessmentSummary'];

// Synthetic patient only; never real people.
export const RECORD_PATIENT_ID = '00000000-0000-4000-8000-0000000000a1';

export function detailBody(overrides: Partial<Detail> = {}): Detail {
  return {
    patientUserId: RECORD_PATIENT_ID,
    fullName: 'Paciente Prueba A',
    age: 34,
    bmi: 22.86,
    bmiCategory: 'normal',
    ibsSubtype: 'IbsD',
    onboardingCompleted: true,
    allergies: [
      {
        patientAllergyId: '00000000-0000-4000-8000-0000000000d1',
        allergyId: '00000000-0000-4000-8000-0000000000d2',
        allergyName: 'Lactosa',
        allergyType: 'Intolerance',
        severity: 'Moderate',
        notes: 'Molestias con leche entera',
        declaredAt: '2026-09-01T15:00:00Z',
      },
    ],
    biologicalSex: 'Female',
    diagnosisDate: '2025-03-14',
    medications: 'Ninguna',
    ...overrides,
  };
}

// A patient linked before creating a profile: every clinical field is null.
export const detailWithoutProfile: Detail = detailBody({
  age: null,
  bmi: null,
  bmiCategory: null,
  // The snapshot does not mark these enums as nullable, but the backend sends null without a profile.
  ibsSubtype: null as unknown as Detail['ibsSubtype'],
  biologicalSex: null as unknown as Detail['biologicalSex'],
  onboardingCompleted: false,
  allergies: [],
  diagnosisDate: null,
  medications: null,
});

export function assessment(
  index: number,
  totalScore: number,
  completedAt: string,
  overrides: Partial<Assessment> = {},
): { assessment: Assessment; deltaFromBaseline: number | null } {
  return {
    assessment: {
      assessmentId: `00000000-0000-4000-8000-0000000000e${index}`,
      assessmentType: index === 0 ? 'Baseline' : 'Periodic',
      cycleNumber: index,
      painSeverity: 0,
      painFrequency: 0,
      bloatingSeverity: 0,
      bowelHabitsDissatisfaction: 0,
      lifeInterference: 0,
      totalScore,
      severityCategory: totalScore > 300 ? 'Severe' : totalScore >= 175 ? 'Moderate' : 'Mild',
      completedAt,
      nextAssessmentDate: null,
      ...overrides,
    },
    deltaFromBaseline: null,
  };
}

export function evolutionBody(overrides: Partial<Evolution> = {}): Evolution {
  return {
    ibsSssTimeline: [],
    baselineScore: null,
    latestScore: null,
    percentChangeFromBaseline: null,
    significantClinicalResponse: false,
    registrationFrequency14d: 0,
    ...overrides,
  };
}

// CP012 step 11: only the baseline, 245 points.
export const baselineOnly245 = evolutionBody({
  ibsSssTimeline: [
    assessment(0, 245, '2026-10-19T15:30:00Z', { nextAssessmentDate: '2026-11-02' }),
  ],
  baselineScore: 245,
  latestScore: 245,
  percentChangeFromBaseline: 0,
});

// CP056 variant A: 320, 280 and 245; the server reports -23.44 %.
export const evolutionCp056A = evolutionBody({
  ibsSssTimeline: [
    assessment(0, 320, '2026-09-21T15:00:00Z'),
    assessment(1, 280, '2026-10-05T15:00:00Z'),
    assessment(2, 245, '2026-10-19T15:00:00Z'),
  ],
  baselineScore: 320,
  latestScore: 245,
  percentChangeFromBaseline: -23.44,
  significantClinicalResponse: true,
  registrationFrequency14d: 26,
});
