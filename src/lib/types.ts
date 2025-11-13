

export type User = {
  id: string; // This is the Firebase UID
  email: string;
  name: string;
  profile: UserProfile;
};

export type UserProfile = {
  dailyCalorieGoal?: number;
  healthGoal?: string;
  height?: number;
  weight?: number;
  age?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  avatarUrl?: string;
  totalPoints?: number;
  money?: number;
  level?: number;
  cityName?: string;
};

export type Post = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    timestamp: string; // ISO 8601
    content: string;
};

export type Friend = {
  id: string;
  name: string;
  avatarUrl: string;
  weeklyPoints: number;
  profile: {
    totalPoints: number;
    money: number;
    level: number;
    cityName: string;
    cityGrid: string[][];
  }
  awards: Award[];
  posts?: Post[];
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
  description?: string;
  ingredients: string;
  instructions: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  emoji: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isFavorite?: boolean;
};

export type Goal = {
  id: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  points: number;
};

export type Award = {
  id: string;
  name: string;
  description: string;
  dateAchieved: string; // ISO 8601 date string
  points: number;
};

export type Store = 'Any' | 'Costco' | 'Walmart' | 'Trader Joe\'s' | 'Whole Foods';

export type ShoppingCartItem = {
  id: string;
  name: string;
  quantity: number;
  dateAdded: string; // ISO 86

    