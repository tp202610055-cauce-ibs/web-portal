export type FodmapLevel = 'Low' | 'Moderate' | 'High';

// A catalog food as the search returns it; the category is a server slug and is not shown.
export interface FoodSummary {
  readonly foodId: string;
  readonly name: string | null;
  readonly fodmapLevel: FodmapLevel;
}
