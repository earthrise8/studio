

'use client';

import type {
  PantryItem,
  FoodLog,
  ActivityLog,
  Recipe,
  Goal,
  Award,
  User,
  UserProfile,
  Friend,
  ShoppingCartItem,
  Store,
} from '@/lib/types';
import { addDays, formatISO, subDays } from 'date-fns';

const today = new Date();

// --- Helper functions for localStorage ---

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const storedValue = window.localStorage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

// Unique ID generator
const generateUniqueId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
}


// --- Initial Mock Data ---

const initialUsers: Record<string, User> = {
  'user123': {
    id: 'user123',
    email: 'dylan.kwok@example.com',
    name: 'Dylan Kwok',
    profile: {
      dailyCalorieGoal: 2200,
      healthGoal: 'Stay healthy and active',
      age: 30,
      height: 178,
      weight: 75,
      activityLevel: 'moderate',
      avatarUrl: 'https://i.pravatar.cc/150?u=dylan',
      totalPoints: 0,
      money: 1000,
      level: 0,
      cityName: 'My Fitropolis',
    },
  },
};

const initialPantry: Record<string, PantryItem[]> = {
  'user123': [
    {
      id: 'p1',
      name: 'Chicken Breast',
      quantity: 2,
      unit: 'lbs',
      category: 'Meat',
      purchaseDate: subDays(today, 2).toISOString(),
      expirationDate: addDays(today, 5).toISOString(),
    },
    {
      id: 'p2',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      category: 'Dairy',
      purchaseDate: subDays(today, 1).toISOString(),
      expirationDate: addDays(today, 6).toISOString(),
    },
     {
      id: 'p3',
      name: 'Avocado',
      quantity: 3,
      unit: 'units',
      category: 'Produce',
      purchaseDate: subDays(today, 3).toISOString(),
      expirationDate: addDays(today, 2).toISOString(),
    },
  ],
};

const initialFoodLogs: Record<string, FoodLog[]> = {
  'user123': [
    {
      id: 'fl1',
      date: formatISO(today, { representation: 'date' }),
      name: 'Oatmeal with Berries',
      calories: 350,
      protein: 10,
      carbs: 60,
      fat: 8,
    },
  ],
};

const initialActivityLogs: Record<string, ActivityLog[]> = {
  'user123': [
    {
      id: 'al1',
      date: formatISO(today, { representation: 'date' }),
      name: 'Morning Run',
      duration: 30,
      caloriesBurned: 300,
    },
  ],
};

const initialRecipes: Record<string, Recipe[]> = {
  'user123': [
    {
      id: 'r1',
      name: 'Classic Chicken Soup',
      description: 'A comforting and easy-to-make chicken soup.',
      ingredients: '- 1 lb chicken\n- 8 cups broth\n- 2 carrots\n- 2 celery stalks\n- 1 onion\n- noodles',
      instructions: '1. Cook chicken.\n2. Sauté vegetables.\n3. Add broth and chicken.\n4. Simmer.\n5. Add noodles and cook until tender.',
      prepTime: '15 min',
      cookTime: '45 min',
      totalTime: '1 hour',
      servings: 4,
      emoji: '🍲',
      calories: 350,
      protein: 30,
      carbs: 25,
      fat: 10,
      isFavorite: true,
    },
  ],
};

const initialGoals: Record<string, Goal[]> = {
  'user123': [
    { id: 'g1', description: 'Run 3 times this week', progress: 1, target: 3, isCompleted: false, points: 50 },
    { id: 'g2', description: 'Drink 8 glasses of water daily', progress: 8, target: 8, isCompleted: true, points: 100 },
  ],
};

const initialAwards: Record<string, Award[]> = {
  'user123': [
    { id: 'a1', name: 'First Workout', description: 'Completed your first logged activity.', dateAchieved: subDays(today, 10).toISOString(), points: 25 },
    { id: 'a2', name: 'Perfect Week', description: 'Logged an activity every day for 7 days.', dateAchieved: subDays(today, 3).toISOString(), points: 75 },
    { id: 'a3', name: 'Goal Achiever: Drink 8 glasses of water daily', description: 'You successfully completed a personal goal.', dateAchieved: today.toISOString(), points: 100 },
  ],
  'f1': [ { id: 'fa1', name: 'Marathon Runner', description: 'Ran a full marathon.', dateAchieved: subDays(today, 15).toISOString(), points: 500 }],
  'f2': [ { id: 'fa2', name: 'Early Bird', description: 'Worked out before 6 AM for a week.', dateAchieved: subDays(today, 5).toISOString(), points: 100 }],
  'f3': [ { id: 'fa3', name: 'Healthy Eater', description: 'Logged healthy meals for 30 days straight.', dateAchieved: subDays(today, 2).toISOString(), points: 200 }],
};

const friendCityGrids: Record<string, string[][]> = {
    'f1': [
      ["🌲", "🌲", "⛰️", "⛰️", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      ["🌲", "🌲", "🌲", "⛰️", "⛰️", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", "🌲", "🌲", "🌲", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      ["⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛", "⬛"],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    ],
    'f2': [
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    ],
    'f3': [
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    ],
};


const initialFriends: Record<string, Friend[]> = {
  'user123': [
    {
      id: 'f1',
      name: 'Alex Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=alex',
      weeklyPoints: 1250,
      profile: { totalPoints: 15000, money: 500000, level: 150, cityName: 'Alexandria', cityGrid: friendCityGrids.f1 },
      awards: getFromStorage('awards', initialAwards).f1 || [],
    },
    {
      id: 'f2',
      name: 'Maria Garcia',
      avatarUrl: 'https://i.pravatar.cc/150?u=maria',
      weeklyPoints: 980,
      profile: { totalPoints: 8500, money: 120000, level: 85, cityName: 'Mariaville', cityGrid: friendCityGrids.f2 },
      awards: getFromStorage('awards', initialAwards).f2 || [],
    },
    {
      id: 'f3',
      name: 'Chen Wei',
      avatarUrl: 'https://i.pravatar.cc/150?u=chen',
      weeklyPoints: 1500,
      profile: { totalPoints: 22000, money: 800000, level: 220, cityName: 'Chen City', cityGrid: friendCityGrids.f3 },
      awards: getFromStorage('awards', initialAwards).f3 || [],
    },
  ],
};

const initialShoppingCart: Record<string, ShoppingCartItem[]> = {
    'user123': [
        { id: 'sc1', name: 'Organic Apples', quantity: 6, dateAdded: subDays(today, 1).toISOString(), price: 3.50, store: 'Trader Joe\'s', healthRating: 5 },
        { id: 'sc2', name: 'Whole Wheat Bread', quantity: 1, dateAdded: subDays(today, 1).toISOString(), price: 4.25, store: 'Whole Foods', healthRating: 4 },
        { id: 'sc3', name: 'Almond Milk', quantity: 1, dateAdded: subDays(today, 2).toISOString(), price: 3.99, store: 'Any', healthRating: 4 },
    ]
};

// --- Data Access Functions ---

// User Data
export const getUser = async (userId: string): Promise<User | null> => {
  const users = getFromStorage('users', initialUsers);
  return users[userId] || null;
};

export const updateUserProfile = async (
  userId: string,
  profileUpdates: Partial<Pick<User, 'name' | 'email'> & { profile: Partial<UserProfile> }>
): Promise<User> => {
  const users = getFromStorage('users', initialUsers);
  const user = users[userId];
  if (!user) throw new Error('User not found');
  
  if (profileUpdates.name) user.name = profileUpdates.name;
  if (profileUpdates.email) user.email = profileUpdates.email;
  if (profileUpdates.profile) {
    user.profile = { ...user.profile, ...profileUpdates.profile };
  }

  saveToStorage('users', users);
  return user;
};


// Pantry
export const getPantryItems = async (userId: string): Promise<PantryItem[]> => {
  const allItems = getFromStorage('pantry', initialPantry);
  return allItems[userId] || [];
};

export const addPantryItem = async (
  userId: string,
  item: Omit<PantryItem, 'id'>
): Promise<PantryItem> => {
  const allItems = getFromStorage('pantry', initialPantry);
  const userItems = allItems[userId] || [];
  const newItem = { ...item, id: generateUniqueId('p') };
  allItems[userId] = [...userItems, newItem];
  saveToStorage('pantry', allItems);
  return newItem;
};

export const updatePantryItem = async (
  userId: string,
  itemId: string,
  updates: Partial<Omit<PantryItem, 'id'>>
): Promise<PantryItem> => {
  const allItems = getFromStorage('pantry', initialPantry);
  const userItems = allItems[userId] || [];
  const itemIndex = userItems.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');

  const updatedItem = { ...userItems[itemIndex], ...updates };
  userItems[itemIndex] = updatedItem;
  saveToStorage('pantry', allItems);
  return updatedItem;
};

export const deletePantryItem = async (
  userId: string,
  itemId: string
): Promise<void> => {
  const allItems = getFromStorage('pantry', initialPantry);
  const userItems = allItems[userId] || [];
  allItems[userId] = userItems.filter((item) => item.id !== itemId);
  saveToStorage('pantry', allItems);
};

// Food Logs
export const getFoodLogs = async (
  userId: string,
  date: string
): Promise<FoodLog[]> => {
  const allLogs = getFromStorage('foodLogs', initialFoodLogs);
  const userLogs = allLogs[userId] || [];
  return userLogs.filter((log) => log.date === date);
};

export const getRecentFoodLogs = async (userId: string, days = 7): Promise<FoodLog[]> => {
    const allLogs = getFromStorage('foodLogs', initialFoodLogs);
    const userLogs = allLogs[userId] || [];
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    return userLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
    });
};

export const addFoodLog = async (
  userId: string,
  log: Omit<FoodLog, 'id'>
): Promise<FoodLog> => {
  const allLogs = getFromStorage('foodLogs', initialFoodLogs);
  const userLogs = allLogs[userId] || [];
  const newLog = { ...log, id: generateUniqueId('fl') };
  allLogs[userId] = [...userLogs, newLog];
  saveToStorage('foodLogs', allLogs);

  // Award points
  const users = getFromStorage('users', initialUsers);
  if(users[userId]) {
    users[userId].profile.totalPoints = (users[userId].profile.totalPoints || 0) + 10;
    saveToStorage('users', users);
  }

  return newLog;
};

export const updateFoodLog = async (
    userId: string,
    logId: string,
    updates: Partial<Omit<FoodLog, 'id'>>
): Promise<FoodLog> => {
    const allLogs = getFromStorage('foodLogs', initialFoodLogs);
    const userLogs = allLogs[userId] || [];
    const logIndex = userLogs.findIndex((log) => log.id === logId);
    if (logIndex === -1) throw new Error('Log not found');
    const updatedLog = { ...userLogs[logIndex], ...updates };
    userLogs[logIndex] = updatedLog;
    saveToStorage('foodLogs', allLogs);
    return updatedLog;
};


export const deleteFoodLog = async (
    userId: string,
    logId: string
): Promise<void> => {
    const allLogs = getFromStorage('foodLogs', initialFoodLogs);
    const userLogs = allLogs[userId] || [];
    allLogs[userId] = userLogs.filter((log) => log.id !== logId);
    saveToStorage('foodLogs', allLogs);
}

// Activity Logs
export const getActivityLogs = async (
  userId: string,
  date: string
): Promise<ActivityLog[]> => {
  const allLogs = getFromStorage('activityLogs', initialActivityLogs);
  const userLogs = allLogs[userId] || [];
  return userLogs.filter((log) => log.date === date);
};

export const getRecentActivityLogs = async (userId: string, days = 7): Promise<ActivityLog[]> => {
    const allLogs = getFromStorage('activityLogs', initialActivityLogs);
    const userLogs = allLogs[userId] || [];
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    return userLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
    });
};

export const addActivityLog = async (
    userId: string,
    log: Omit<ActivityLog, 'id'>
): Promise<ActivityLog> => {
    const allLogs = getFromStorage('activityLogs', initialActivityLogs);
    const userLogs = allLogs[userId] || [];
    const newLog = { ...log, id: generateUniqueId('al') };
    allLogs[userId] = [...userLogs, newLog];
    saveToStorage('activityLogs', allLogs);

    // Award points
    const users = getFromStorage('users', initialUsers);
    if(users[userId]) {
        users[userId].profile.totalPoints = (users[userId].profile.totalPoints || 0) + 25;
        saveToStorage('users', users);
    }

    return newLog;
};

export const updateActivityLog = async (
    userId: string,
    logId: string,
    updates: Partial<Omit<ActivityLog, 'id'>>
): Promise<ActivityLog> => {
    const allLogs = getFromStorage('activityLogs', initialActivityLogs);
    const userLogs = allLogs[userId] || [];
    const logIndex = userLogs.findIndex((log) => log.id === logId);
    if (logIndex === -1) throw new Error('Log not found');
    const updatedLog = { ...userLogs[logIndex], ...updates };
    userLogs[logIndex] = updatedLog;
    saveToStorage('activityLogs', allLogs);
    return updatedLog;
};


export const deleteActivityLog = async (
    userId: string,
    logId: string
): Promise<void> => {
    const allLogs = getFromStorage('activityLogs', initialActivityLogs);
    const userLogs = allLogs[userId] || [];
    allLogs[userId] = userLogs.filter((log) => log.id !== logId);
    saveToStorage('activityLogs', allLogs);
};


// Recipes
export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  const allRecipes = getFromStorage('recipes', initialRecipes);
  return allRecipes[userId] || [];
};

export const addRecipe = async (
  userId: string,
  recipe: Omit<Recipe, 'id'>
): Promise<Recipe> => {
  const allRecipes = getFromStorage('recipes', initialRecipes);
  const userRecipes = allRecipes[userId] || [];
  const newRecipe = { ...recipe, id: generateUniqueId('r') };
  allRecipes[userId] = [...userRecipes, newRecipe];
  saveToStorage('recipes', allRecipes);
  return newRecipe;
};

export const updateRecipe = async (
    userId: string,
    recipeId: string,
    updates: Partial<Omit<Recipe, 'id'>>
): Promise<Recipe> => {
    const allRecipes = getFromStorage('recipes', initialRecipes);
    const userRecipes = allRecipes[userId] || [];
    const recipeIndex = userRecipes.findIndex((recipe) => recipe.id === recipeId);
    if (recipeIndex === -1) throw new Error('Recipe not found');
    
    const updatedRecipe = { ...userRecipes[recipeIndex], ...updates };
    userRecipes[recipeIndex] = updatedRecipe;
    saveToStorage('recipes', allRecipes);
    return updatedRecipe;
};

export const deleteRecipe = async (
  userId: string,
  recipeId: string
): Promise<void> => {
  const allRecipes = getFromStorage('recipes', initialRecipes);
  const userRecipes = allRecipes[userId] || [];
  allRecipes[userId] = userRecipes.filter((recipe) => recipe.id !== recipeId);
  saveToStorage('recipes', allRecipes);
};

// Goals
export const getGoals = async (userId: string): Promise<Goal[]> => {
  const allGoals = getFromStorage('goals', initialGoals);
  return allGoals[userId] || [];
};

export const addGoal = async (userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const allGoals = getFromStorage('goals', initialGoals);
    const userGoals = allGoals[userId] || [];
    const newGoal = { ...goal, id: generateUniqueId('g') };
    allGoals[userId] = [...userGoals, newGoal];
    saveToStorage('goals', allGoals);
    return newGoal;
};

export const updateGoal = async (
    userId: string,
    updatedGoal: Goal
): Promise<Goal> => {
    const allGoals = getFromStorage('goals', initialGoals);
    const userGoals = allGoals[userId] || [];
    const goalIndex = userGoals.findIndex(g => g.id === updatedGoal.id);
    if(goalIndex === -1) throw new Error("Goal not found");
    
    const oldGoal = userGoals[goalIndex];
    userGoals[goalIndex] = updatedGoal;
    
    // If the goal was just completed, add points and an award
    if (updatedGoal.isCompleted && !oldGoal.isCompleted) {
        const users = getFromStorage('users', initialUsers);
        if (users[userId]) {
            users[userId].profile.totalPoints = (users[userId].profile.totalPoints || 0) + updatedGoal.points;
            saveToStorage('users', users);
        }
        
        const allAwards = getFromStorage('awards', initialAwards);
        const userAwards = allAwards[userId] || [];
        const newAward: Award = {
            id: generateUniqueId('aw'),
            name: `Goal Achiever: ${updatedGoal.description}`,
            description: 'You successfully completed a personal goal.',
            dateAchieved: new Date().toISOString(),
            points: updatedGoal.points
        };
        allAwards[userId] = [...userAwards, newAward];
        saveToStorage('awards', allAwards);
    }
    
    saveToStorage('goals', allGoals);
    return updatedGoal;
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    const allGoals = getFromStorage('goals', initialGoals);
    const userGoals = allGoals[userId] || [];
    allGoals[userId] = userGoals.filter(g => g.id !== goalId);
    saveToStorage('goals', allGoals);
};

// Awards
export const getAwards = async (userId: string): Promise<Award[]> => {
  const allAwards = getFromStorage('awards', initialAwards);
  return allAwards[userId] || [];
};

// Friends
export const getFriends = async (userId: string): Promise<Friend[]> => {
    const allFriends = getFromStorage('friends', initialFriends);
    return allFriends[userId] || [];
};

export const getFriendById = async (userId: string, friendId: string): Promise<Friend | null> => {
    const allFriends = getFromStorage('friends', initialFriends);
    const userFriends = allFriends[userId] || [];
    return userFriends.find(f => f.id === friendId) || null;
}

// Shopping Cart
export const getShoppingCartItems = async (userId: string): Promise<ShoppingCartItem[]> => {
  const allItems = getFromStorage('shoppingCart', initialShoppingCart);
  return allItems[userId] || [];
};

export const addShoppingCartItem = async (
  userId: string,
  item: Omit<ShoppingCartItem, 'id' | 'dateAdded'>
): Promise<ShoppingCartItem> => {
  const allItems = getFromStorage('shoppingCart', initialShoppingCart);
  const userItems = allItems[userId] || [];
  const newItem = { ...item, id: generateUniqueId('sc'), dateAdded: new Date().toISOString() };
  allItems[userId] = [...userItems, newItem];
  saveToStorage('shoppingCart', allItems);
  return newItem;
};

export const updateShoppingCartItem = async (
  userId: string,
  itemId: string,
  updates: Partial<Omit<ShoppingCartItem, 'id'>>
): Promise<ShoppingCartItem> => {
  const allItems = getFromStorage('shoppingCart', initialShoppingCart);
  const userItems = allItems[userId] || [];
  const itemIndex = userItems.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found in shopping cart');

  const updatedItem = { ...userItems[itemIndex], ...updates };
  userItems[itemIndex] = updatedItem;
  saveToStorage('shoppingCart', allItems);
  return updatedItem;
};

export const deleteShoppingCartItem = async (
  userId: string,
  itemId: string
): Promise<void> => {
    const allItems = getFromStorage('shoppingCart', initialShoppingCart);
    if (!allItems[userId]) return;

    const itemIndex = allItems[userId].findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        allItems[userId].splice(itemIndex, 1);
        saveToStorage('shoppingCart', allItems);
    }
};

const categoryKeywords: Record<PantryItem['category'], string[]> = {
    'Produce': ['apple', 'banana', 'lettuce', 'tomato', 'onion', 'potato', 'broccoli', 'carrot', 'spinach', 'avocado', 'berries', 'grapes', 'orange', 'lemon'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
    'Meat': ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'sausage', 'bacon', 'steak'],
    'Pantry': ['bread', 'rice', 'pasta', 'flour', 'sugar', 'cereal', 'oats', 'beans', 'lentils', 'oil', 'vinegar', 'sauce', 'soup', 'canned'],
    'Frozen': ['frozen vegetables', 'frozen fruit', 'ice cream', 'frozen pizza', 'frozen meal'],
    'Other': [],
};

const getCategoryFromName = (name: string): PantryItem['category'] => {
    const lowerCaseName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerCaseName.includes(keyword))) {
            return category as PantryItem['category'];
        }
    }
    return 'Other';
};

const defaultExpirationDays: Record<PantryItem['category'], number> = {
    Produce: 7,
    Dairy: 10,
    Meat: 4,
    Pantry: 365,
    Frozen: 180,
    Other: 14,
};

export const moveItemToPantry = async (userId: string, item: ShoppingCartItem): Promise<void> => {
    const category = getCategoryFromName(item.name);
    const expirationDays = defaultExpirationDays[category];
    
    const pantryItem: Omit<PantryItem, 'id'> = {
        name: item.name,
        quantity: item.quantity,
        unit: 'units', // Defaulting to 'units', can be improved
        category: category,
        purchaseDate: new Date().toISOString(),
        expirationDate: addDays(new Date(), expirationDays).toISOString(),
    };

    await addPantryItem(userId, pantryItem);
    await deleteShoppingCartItem(userId, item.id);
}


// Reset all data
export const resetUserData = (userId: string): void => {
  const users = getFromStorage('users', initialUsers);
  if (users[userId]) {
    users[userId] = initialUsers[userId];
    saveToStorage('users', users);
  }

  const pantry = getFromStorage('pantry', initialPantry);
  pantry[userId] = initialPantry[userId] || [];
  saveToStorage('pantry', pantry);

  const foodLogs = getFromStorage('foodLogs', initialFoodLogs);
  foodLogs[userId] = initialFoodLogs[userId] || [];
  saveToStorage('foodLogs', foodLogs);

  const activityLogs = getFromStorage('activityLogs', initialActivityLogs);
  activityLogs[userId] = initialActivityLogs[userId] || [];
  saveToStorage('activityLogs', activityLogs);

  const recipes = getFromStorage('recipes', initialRecipes);
  recipes[userId] = initialRecipes[userId] || [];
  saveToStorage('recipes', recipes);

  const goals = getFromStorage('goals', initialGoals);
  goals[userId] = initialGoals[userId] || [];
  saveToStorage('goals', goals);

  const awards = getFromStorage('awards', initialAwards);
  awards[userId] = initialAwards[userId] || [];
  saveToStorage('awards', awards);

  const shoppingCart = getFromStorage('shoppingCart', initialShoppingCart);
  shoppingCart[userId] = initialShoppingCart[userId] || [];
  saveToStorage('shoppingCart', shoppingCart);
  
  localStorage.removeItem(`city-grid-${userId}`);
  localStorage.removeItem(`game-start-date-${userId}`);
  localStorage.removeItem(`last-revenue-update-${userId}`);
};
