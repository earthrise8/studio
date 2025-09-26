export type User = {
  id: string;
  email: string;
  name: string;
  profile?: UserProfile;
};

export type UserProfile = {
  dailyCalorieGoal: number;
  healthGoal: string;
  height?: number;
  weight?: number;
  age?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
};

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: 'units' | 'lbs' | 'kg' | 'g' | 'oz' | 'ml' | 'l';
  category: 'Produce' | 'Dairy' | 'Meat' | 'Pantry' | 'Frozen' | 'Other';
  purchaseDate: string; // ISO 8601 date string
  expirationDate: string; // ISO 8601 date string
};

export type FoodLog = {
  id: string;
  date: string; // ISO 8601 date string
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type ActivityLog = {
  id: string;
  date: string; // ISO 8601 date string
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  imageUrl?: string;
};

export type Goal = {
  id: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
};

export type Award = {
  id: string;
  name: string;
  description: string;
  dateAchieved: string; // ISO 8601 date string
};
