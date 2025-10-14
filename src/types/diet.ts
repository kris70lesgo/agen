export interface HeightMetric {
  unit: "cm" | "imperial";
  value?: number | null;
  feet?: number | null;
  inches?: number | null;
}

export interface WeightMetric {
  unit: "kg" | "lb";
  value?: number | null;
}

export interface BudgetRange {
  min: number | null;
  max: number | null;
}

export interface DietFormSnapshot {
  age: string;
  sex: string;
  heightUnit: "cm" | "imperial";
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weightUnit: "kg" | "lb";
  weightKg: string;
  weightLb: string;
  activityLevel: string;
  mainGoal: string;
  email: string;
  dislikedFoods: string;
  medicalNote: string;
  weeklyBudget: string;
  cuisines: string[];
  country: string;
  countryCode: string;
  dietStyle: string;
}

export interface DietChatPayload {
  form: DietFormSnapshot;
  height: HeightMetric;
  weight: WeightMetric;
  weeklyBudgetRange: BudgetRange;
  timestamp: string;
}
