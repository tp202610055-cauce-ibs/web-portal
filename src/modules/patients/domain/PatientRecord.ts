import type { IbsSubtype } from '@/modules/patients/domain/AssignedPatient';

export type BiologicalSex = 'Male' | 'Female' | 'Other';
export type AllergyType = 'Allergy' | 'Intolerance' | 'Sensitivity';
export type AllergySeverity = 'Mild' | 'Moderate' | 'Severe';
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';
export type SeverityCategory = 'Mild' | 'Moderate' | 'Severe';
export type AssessmentType = 'Baseline' | 'Periodic';

// A calendar date without time or zone, as the contract sends it: YYYY-MM-DD.
export type CalendarDate = string;

export interface PatientAllergy {
  readonly patientAllergyId: string;
  readonly name: string | null;
  readonly type: AllergyType;
  readonly severity: AllergySeverity;
  readonly notes: string | null;
}

// Clinical fields are null until the patient creates the profile.
export interface PatientDetail {
  readonly patientUserId: string;
  readonly fullName: string | null;
  readonly age: number | null;
  readonly bmi: number | null;
  readonly bmiCategory: BmiCategory | null;
  readonly ibsSubtype: IbsSubtype | null;
  readonly biologicalSex: BiologicalSex | null;
  readonly diagnosisDate: CalendarDate | null;
  readonly medications: string | null;
  readonly onboardingCompleted: boolean;
  readonly allergies: PatientAllergy[];
  // Start of the active assignment with this nutritionist; records before it predate the link.
  readonly assignedAt: Date;
}

export interface IbsSssPoint {
  readonly assessmentId: string;
  readonly type: AssessmentType;
  readonly totalScore: number;
  readonly severity: SeverityCategory | null;
  readonly completedAt: Date;
  readonly nextAssessmentDate: CalendarDate | null;
}

// Percent change, clinical response and frequency are the server's; the client never recomputes them.
export interface PatientEvolution {
  readonly timeline: IbsSssPoint[];
  readonly baselineScore: number | null;
  readonly latestScore: number | null;
  readonly percentChangeFromBaseline: number | null;
  readonly significantClinicalResponse: boolean;
  readonly registrationFrequency14d: number;
}

export class PatientAccessDeniedError extends Error {
  constructor() {
    super('The nutritionist is not assigned to this patient.');
    this.name = 'PatientAccessDeniedError';
  }
}

export class PatientNotFoundError extends Error {
  constructor() {
    super('The patient does not exist.');
    this.name = 'PatientNotFoundError';
  }
}
