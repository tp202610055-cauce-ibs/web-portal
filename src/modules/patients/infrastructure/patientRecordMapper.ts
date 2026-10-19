import { z } from 'zod';

import type { PatientDetail, PatientEvolution } from '@/modules/patients/domain/PatientRecord';
import { ContractViolationError } from '@/shared/domain/errors';

const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));
const calendarDate = z.iso.date();

// An unknown value is dropped instead of failing: the label is optional, the data around it is not.
function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z
    .string()
    .nullable()
    .transform((value) =>
      (values as readonly string[]).includes(value ?? '') ? (value as T[number]) : null,
    );
}

const detail = z.object({
  patientUserId: z.string().min(1),
  fullName: z.string().nullable(),
  age: z.number().int().nullable(),
  bmi: z.number().nullable(),
  bmiCategory: optionalEnum(['underweight', 'normal', 'overweight', 'obese']),
  ibsSubtype: z.enum(['IbsD', 'IbsC', 'IbsM', 'IbsU']).nullable(),
  onboardingCompleted: z.boolean(),
  allergies: z
    .array(
      z.object({
        patientAllergyId: z.string().min(1),
        allergyName: z.string().nullable(),
        allergyType: z.enum(['Allergy', 'Intolerance', 'Sensitivity']),
        severity: z.enum(['Mild', 'Moderate', 'Severe']),
        notes: z.string().nullable(),
      }),
    )
    .nullable(),
  biologicalSex: z.enum(['Male', 'Female', 'Other']).nullable(),
  diagnosisDate: calendarDate.nullable(),
  medications: z.string().nullable(),
});

const evolution = z.object({
  ibsSssTimeline: z
    .array(
      z.object({
        assessment: z.object({
          assessmentId: z.string().min(1),
          assessmentType: z.enum(['Baseline', 'Periodic']),
          totalScore: z.number().int(),
          severityCategory: optionalEnum(['Mild', 'Moderate', 'Severe']),
          completedAt: instant,
          nextAssessmentDate: calendarDate.nullable(),
        }),
      }),
    )
    .nullable(),
  baselineScore: z.number().int().nullable(),
  latestScore: z.number().int().nullable(),
  percentChangeFromBaseline: z.number().nullable(),
  significantClinicalResponse: z.boolean(),
  registrationFrequency14d: z.number().int().nonnegative(),
});

export function toPatientDetail(payload: unknown): PatientDetail {
  const parsed = detail.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('GetAssignedPatientDetailResult');
  }
  const { allergies, ...rest } = parsed.data;
  return {
    ...rest,
    allergies: (allergies ?? []).map((allergy) => ({
      patientAllergyId: allergy.patientAllergyId,
      name: allergy.allergyName,
      type: allergy.allergyType,
      severity: allergy.severity,
      notes: allergy.notes,
    })),
  };
}

// The server sends the timeline in chronological order; it is kept as is.
export function toPatientEvolution(payload: unknown): PatientEvolution {
  const parsed = evolution.safeParse(payload);
  if (!parsed.success) {
    throw new ContractViolationError('PatientEvolutionForNutritionistResult');
  }
  const { ibsSssTimeline, ...rest } = parsed.data;
  return {
    ...rest,
    timeline: (ibsSssTimeline ?? []).map(({ assessment }) => ({
      assessmentId: assessment.assessmentId,
      type: assessment.assessmentType,
      totalScore: assessment.totalScore,
      severity: assessment.severityCategory,
      completedAt: assessment.completedAt,
      nextAssessmentDate: assessment.nextAssessmentDate,
    })),
  };
}
