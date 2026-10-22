export type RecommendationStatus =
  | 'Generated'
  | 'PendingReview'
  | 'Approved'
  | 'ModifiedApproved'
  | 'ManualApproved'
  | 'Rejected'
  | 'Delivered'
  | 'FeedbackReceived'
  | 'Expired';

export type RecommendationAction = 'Approve' | 'Modify' | 'Reject' | 'Archive';
export type FoodAction = 'Suggest' | 'Reduce' | 'Avoid' | 'Substitute';
export type ExplanationSource = 'LlmGenerated' | 'Fallback' | 'Manual';
export type RecommendationSource = 'EngineGenerated' | 'Manual';

// One row of the review queue, in the order the server sends it (oldest first).
export interface PendingReview {
  readonly recommendationId: string;
  readonly patientId: string;
  readonly patientFullName: string | null;
  readonly status: RecommendationStatus;
  readonly confidenceScore: number;
  readonly itemsCount: number;
  readonly generatedAt: Date;
  readonly expiresAt: Date | null;
}

export interface PendingReviewPage {
  readonly items: PendingReview[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

// The food ids come from the server and travel back unchanged when the list is modified.
export interface RecommendationItem {
  readonly recommendationItemId: string;
  readonly foodId: string;
  readonly foodName: string | null;
  readonly action: FoodAction;
  readonly substituteFoodId: string | null;
  readonly substituteFoodName: string | null;
  readonly reasoning: string | null;
}

// Counts over the analysis window the server used; the client never recomputes them.
export interface SupportingData {
  readonly symptomCount: number;
  readonly mealCount: number;
  readonly topHighFodmapFoods: string[];
  readonly correlationWindowHours: number;
  readonly windowFrom: Date;
  readonly windowTo: Date;
}

// Status and allowed actions are the server's; the screen offers only what allowedActions lists.
export interface RecommendationDetail {
  readonly recommendationId: string;
  readonly patientId: string;
  readonly status: RecommendationStatus;
  readonly source: RecommendationSource;
  readonly confidenceScore: number;
  readonly modelVersionName: string | null;
  readonly title: string | null;
  readonly description: string | null;
  readonly aiExplanation: string | null;
  readonly explanationSource: ExplanationSource;
  readonly steps: string[];
  readonly items: RecommendationItem[];
  readonly supportingData: SupportingData;
  readonly nutritionistNote: string | null;
  readonly reviewedByNutritionistName: string | null;
  readonly generatedAt: Date;
  readonly reviewedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly allowedActions: RecommendationAction[];
}

export class RecommendationAccessDeniedError extends Error {
  constructor() {
    super('The nutritionist is not assigned to the patient of this recommendation.');
    this.name = 'RecommendationAccessDeniedError';
  }
}

export class RecommendationNotFoundError extends Error {
  constructor() {
    super('The recommendation does not exist.');
    this.name = 'RecommendationNotFoundError';
  }
}

export type DecisionFailure =
  | { readonly kind: 'state-conflict' }
  | { readonly kind: 'expired' }
  | { readonly kind: 'idempotency-mismatch' }
  | { readonly kind: 'access-denied' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'invalid-note'; readonly messages: string[] }
  | { readonly kind: 'invalid-content'; readonly messages: string[] };

// The server refused an approval or a rejection; the messages are the server's own texts.
export class DecisionRefusedError extends Error {
  readonly failure: DecisionFailure;

  constructor(failure: DecisionFailure) {
    super(`The decision was refused: ${failure.kind}.`);
    this.name = 'DecisionRefusedError';
    this.failure = failure;
  }
}
