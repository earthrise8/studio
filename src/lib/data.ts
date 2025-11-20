

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
  Post,
} from '@/lib/types';
import { addDays, formatISO, subDays } from 'date-fns';

const today = new Date();

// --- Helper functions for storage ---

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const storage = window.localStorage;
  const storedValue = storage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue);
    } catch (e) {
      console.error(`Error parsing storage key "${key}":`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  const storage = window.localStorage;
  storage.setItem(key, JSON.stringify(value));
};

// Unique ID generator
const generateUniqueId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
}

// --- Initial Mock Data ---

const getDefaultUserData = (userId: string, name: string | null, email: string | null): User => ({
  id: userId,
  email: email,
  name: name,
  profile: {
    dailyCalorieGoal: 2200,
    healthGoal: 'Stay healthy and active',
    age: 30,
    height: 178,
    weight: 75,
    activityLevel: 'moderate',
    avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
    totalPoints: 0,
    money: 1000,
    level: 0,
    cityName: `${name?.split(' ')[0] || 'My'}'s Fitropolis`,
    cityGrid: undefined,
  },
});

const defaultPantry: PantryItem[] = [
  { id: 'p1', name: 'Chicken Breast', quantity: 2, unit: 'lbs', category: 'Meat', purchaseDate: subDays(today, 2).toISOString(), expirationDate: addDays(today, 5).toISOString() },
  { id: 'p2', name: 'Milk', quantity: 1, unit: 'l', category: 'Dairy', purchaseDate: subDays(today, 1).toISOString(), expirationDate: addDays(today, 6).toISOString() },
  { id: 'p3', name: 'Avocado', quantity: 3, unit: 'units', category: 'Produce', purchaseDate: subDays(today, 3).toISOString(), expirationDate: addDays(today, 2).toISOString() },
];
const defaultFoodLogs: FoodLog[] = [{ id: 'fl1', date: formatISO(today, { representation: 'date' }), name: 'Oatmeal with Berries', calories: 350, protein: 10, carbs: 60, fat: 8 }];
const defaultActivityLogs: ActivityLog[] = [{ id: 'al1', date: formatISO(today, { representation: 'date' }), name: 'Morning Run', duration: 30, caloriesBurned: 300 }];
const defaultRecipes: Recipe[] = [
  { id: 'r1', name: 'Classic Chicken Soup', description: 'A comforting and easy-to-make chicken soup.', ingredients: '- 1 lb chicken\n- 8 cups broth\n- 2 carrots\n- 2 celery stalks\n- 1 onion\n- noodles', instructions: '1. Cook chicken.\n2. Sauté vegetables.\n3. Add broth and chicken.\n4. Simmer.\n5. Add noodles and cook until tender.', prepTime: '15 min', cookTime: '45 min', totalTime: '1 hour', servings: 4, emoji: '🍲', calories: 350, protein: 30, carbs: 25, fat: 10, isFavorite: true },
];
const defaultGoals: Goal[] = [
  { id: 'g1', description: 'Run 3 times this week', progress: 1, target: 3, isCompleted: false, points: 50 },
  { id: 'g2', description: 'Drink 8 glasses of water daily', progress: 8, target: 8, isCompleted: true, points: 100 },
];
const defaultAwards: Award[] = [
    { id: 'a3', name: 'Goal Achiever: Drink 8 glasses of water daily', description: 'You successfully completed a personal goal.', dateAchieved: today.toISOString(), points: 100 },
];
const defaultShoppingCart: ShoppingCartItem[] = [
    { id: 'sc1', name: 'Organic Apples', quantity: 6, dateAdded: subDays(today, 1).toISOString(), price: 3.50, store: 'Trader Joe\'s', healthRating: 5 },
    { id: 'sc2', name: 'Whole Wheat Bread', quantity: 1, dateAdded: subDays(today, 1).toISOString(), price: 4.25, store: 'Whole Foods', healthRating: 4 },
];

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
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
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
      [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
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
      awards: [{ id: 'fa1', name: 'Marathon Runner', description: 'Ran a full marathon.', dateAchieved: subDays(today, 15).toISOString(), points: 500 }],
      posts: [{
          id: 'p1',
          authorId: 'f1',
          authorName: 'Alex Smith',
          authorAvatar: 'https://i.pravatar.cc/150?u=alex',
          timestamp: subDays(new Date(), 1).toISOString(),
          content: "Just finished a 10k run! The new city park is a great place to train. 🏞️"
      }]
    },
    {
      id: 'f2',
      name: 'Maria Garcia',
      avatarUrl: 'https://i.pravatar.cc/150?u=maria',
      weeklyPoints: 980,
      profile: { totalPoints: 8500, money: 120000, level: 85, cityName: 'Mariaville', cityGrid: friendCityGrids.f2 },
      awards: [{ id: 'fa2', name: 'Early Bird', description: 'Worked out before 6 AM for a week.', dateAchieved: subDays(today, 5).toISOString(), points: 100 }],
      posts: [{
        id: 'p2',
        authorId: 'f2',
        authorName: 'Maria Garcia',
        authorAvatar: 'https://i.pravatar.cc/150?u=maria',
        timestamp: subDays(new Date(), 2).toISOString(),
        content: "I tried the AI-generated recipe for quinoa salad and it was delicious! Highly recommend. 🥗"
    }]
    },
    {
      id: 'f3',
      name: 'Chen Wei',
      avatarUrl: 'https://i.pravatar.cc/150?u=chen',
      weeklyPoints: 1500,
      profile: { totalPoints: 22000, money: 800000, level: 220, cityName: 'Chen City', cityGrid: friendCityGrids.f3 },
      awards: [{ id: 'fa3', name: 'Healthy Eater', description: 'Logged healthy meals for 30 days straight.', dateAchieved: subDays(today, 2).toISOString(), points: 200 }],
      posts: [{
        id: 'p3',
        authorId: 'f3',
        authorName: 'Chen Wei',
        authorAvatar: 'https://i.pravatar.cc/150?u=chen',
        timestamp: subDays(new Date(), 3).toISOString(),
        content: "My Fitropolis is finally a Megalopolis! Time to build that rocket. 🚀"
    }]
    },
  ],
};


// --- Data Access Functions ---

const getUserData = <T>(userId: string, key: string, defaultValue: T): T => {
    const allData = getFromStorage('allUserData', {});
    return (allData as Record<string, Record<string, T>>)[userId]?.[key] || defaultValue;
}

const saveUserData = <T>(userId: string, key: string, data: T) => {
    const allData = getFromStorage('allUserData', {});
    if (!(allData as Record<string, Record<string, T>>)[userId]) {
        (allData as Record<string, Record<string, T>>)[userId] = {};
    }
    (allData as Record<string, Record<string, T>>)[userId][key] = data;
    saveToStorage('allUserData', allData);
}

// User Data
export const getUser = async (userId: string): Promise<User | null> => {
  const users = getFromStorage('users', {});
  return (users as Record<string, User>)[userId] || null;
};

export const getOrCreateUser = (userId: string, name: string | null, email: string | null): User => {
    const users = getFromStorage('users', {} as Record<string, User>);
    let user = users[userId];
    if (!user) {
        user = getDefaultUserData(userId, name, email);
        users[userId] = user;
        saveToStorage('users', users);

        // Initialize default data for new user
        saveUserData(userId, 'pantry', defaultPantry);
        saveUserData(userId, 'foodLogs', defaultFoodLogs);
        saveUserData(userId, 'activityLogs', defaultActivityLogs);
        saveUserData(userId, 'recipes', defaultRecipes);
        saveUserData(userId, 'goals', defaultGoals);
        saveUserData(userId, 'awards', defaultAwards);
        saveUserData(userId, 'shoppingCart', defaultShoppingCart);
        saveUserData(userId, 'friends', initialFriends['user123']);
    }
    return user;
}

export const updateUserProfile = async (
  userId: string,
  profileUpdates: Partial<Pick<User, 'name' | 'email'> & { profile: Partial<UserProfile> }>
): Promise<User> => {
  const users = getFromStorage('users', {});
  const user = (users as Record<string, User>)[userId];
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
  return getUserData(userId, 'pantry', defaultPantry);
};

export const addPantryItem = async (
  userId: string,
  item: Omit<PantryItem, 'id'>
): Promise<PantryItem> => {
  const userItems = await getPantryItems(userId);
  const newItem = { ...item, id: generateUniqueId('p') };
  saveUserData(userId, 'pantry', [...userItems, newItem]);
  return newItem;
};

export const updatePantryItem = async (
  userId: string,
  itemId: string,
  updates: Partial<Omit<PantryItem, 'id'>>
): Promise<PantryItem> => {
  const userItems = await getPantryItems(userId);
  const itemIndex = userItems.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');

  const updatedItem = { ...userItems[itemIndex], ...updates };
  userItems[itemIndex] = updatedItem;
  saveUserData(userId, 'pantry', userItems);
  return updatedItem;
};

export const deletePantryItem = async (
  userId: string,
  itemId: string
): Promise<void> => {
  const userItems = await getPantryItems(userId);
  const updatedItems = userItems.filter((item) => item.id !== itemId);
  saveUserData(userId, 'pantry', updatedItems);
};

// Food Logs
export const getFoodLogs = async (
  userId: string,
  date: string
): Promise<FoodLog[]> => {
  const userLogs = await getUserData(userId, 'foodLogs', defaultFoodLogs);
  return userLogs.filter((log) => log.date === date);
};

export const getRecentFoodLogs = async (userId: string, days = 7): Promise<FoodLog[]> => {
    const userLogs = await getUserData(userId, 'foodLogs', defaultFoodLogs);
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
  const userLogs = await getUserData(userId, 'foodLogs', defaultFoodLogs);
  const newLog = { ...log, id: generateUniqueId('fl') };
  saveUserData(userId, 'foodLogs', [...userLogs, newLog]);

  // Award points
  const user = await getUser(userId);
  if(user) {
    user.profile.totalPoints = (user.profile.totalPoints || 0) + 10;
    await updateUserProfile(userId, { profile: user.profile });
  }

  return newLog;
};

export const updateFoodLog = async (
    userId: string,
    logId: string,
    updates: Partial<Omit<FoodLog, 'id'>>
): Promise<FoodLog> => {
    const userLogs = await getUserData(userId, 'foodLogs', defaultFoodLogs);
    const logIndex = userLogs.findIndex((log) => log.id === logId);
    if (logIndex === -1) throw new Error('Log not found');
    const updatedLog = { ...userLogs[logIndex], ...updates };
    userLogs[logIndex] = updatedLog;
    saveUserData(userId, 'foodLogs', userLogs);
    return updatedLog;
};


export const deleteFoodLog = async (
    userId: string,
    logId: string
): Promise<void> => {
    const userLogs = await getUserData(userId, 'foodLogs', defaultFoodLogs);
    const updatedLogs = userLogs.filter((log) => log.id !== logId);
    saveUserData(userId, 'foodLogs', updatedLogs);
}

// Activity Logs
export const getActivityLogs = async (
  userId: string,
  date: string
): Promise<ActivityLog[]> => {
  const userLogs = await getUserData(userId, 'activityLogs', defaultActivityLogs);
  return userLogs.filter((log) => log.date === date);
};

export const getRecentActivityLogs = async (userId: string, days = 7): Promise<ActivityLog[]> => {
    const userLogs = await getUserData(userId, 'activityLogs', defaultActivityLogs);
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
    const userLogs = await getUserData(userId, 'activityLogs', defaultActivityLogs);
    const newLog = { ...log, id: generateUniqueId('al') };
    saveUserData(userId, 'activityLogs', [...userLogs, newLog]);

    // Award points
    const user = await getUser(userId);
    if(user) {
        user.profile.totalPoints = (user.profile.totalPoints || 0) + 25;
        await updateUserProfile(userId, { profile: user.profile });
    }

    return newLog;
};

export const updateActivityLog = async (
    userId: string,
    logId: string,
    updates: Partial<Omit<ActivityLog, 'id'>>
): Promise<ActivityLog> => {
    const userLogs = await getUserData(userId, 'activityLogs', defaultActivityLogs);
    const logIndex = userLogs.findIndex((log) => log.id === logId);
    if (logIndex === -1) throw new Error('Log not found');
    const updatedLog = { ...userLogs[logIndex], ...updates };
    userLogs[logIndex] = updatedLog;
    saveUserData(userId, 'activityLogs', userLogs);
    return updatedLog;
};


export const deleteActivityLog = async (
    userId: string,
    logId: string
): Promise<void> => {
    const userLogs = await getUserData(userId, 'activityLogs', defaultActivityLogs);
    const updatedLogs = userLogs.filter((log) => log.id !== logId);
    saveUserData(userId, 'activityLogs', updatedLogs);
};


// Recipes
export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  return getUserData(userId, 'recipes', defaultRecipes);
};

export const addRecipe = async (
  userId: string,
  recipe: Omit<Recipe, 'id'>
): Promise<Recipe> => {
  const userRecipes = await getRecipes(userId);
  const newRecipe = { ...recipe, id: generateUniqueId('r') };
  saveUserData(userId, 'recipes', [...userRecipes, newRecipe]);
  return newRecipe;
};

export const updateRecipe = async (
    userId: string,
    recipeId: string,
    updates: Partial<Omit<Recipe, 'id'>>
): Promise<Recipe> => {
    const userRecipes = await getRecipes(userId);
    const recipeIndex = userRecipes.findIndex((recipe) => recipe.id === recipeId);
    if (recipeIndex === -1) throw new Error('Recipe not found');
    
    const updatedRecipe = { ...userRecipes[recipeIndex], ...updates };
    userRecipes[recipeIndex] = updatedRecipe;
    saveUserData(userId, 'recipes', userRecipes);
    return updatedRecipe;
};

export const deleteRecipe = async (
  userId: string,
  recipeId: string
): Promise<void> => {
  const userRecipes = await getRecipes(userId);
  const updatedRecipes = userRecipes.filter((recipe) => recipe.id !== recipeId);
  saveUserData(userId, 'recipes', updatedRecipes);
};

// Goals
export const getGoals = async (userId: string): Promise<Goal[]> => {
  return getUserData(userId, 'goals', defaultGoals);
};

export const addGoal = async (userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const userGoals = await getGoals(userId);
    const newGoal = { ...goal, id: generateUniqueId('g') };
    saveUserData(userId, 'goals', [...userGoals, newGoal]);
    return newGoal;
};

export const updateGoal = async (
    userId: string,
    updatedGoal: Goal
): Promise<Goal> => {
    const userGoals = await getGoals(userId);
    const goalIndex = userGoals.findIndex(g => g.id === updatedGoal.id);
    if(goalIndex === -1) throw new Error("Goal not found");
    
    const oldGoal = userGoals[goalIndex];
    userGoals[goalIndex] = updatedGoal;
    
    // If the goal was just completed, add points and an award
    if (updatedGoal.isCompleted && !oldGoal.isCompleted) {
        const user = await getUser(userId);
        if (user) {
            user.profile.totalPoints = (user.profile.totalPoints || 0) + updatedGoal.points;
            await updateUserProfile(userId, { profile: user.profile });
        }
        
        const userAwards = await getAwards(userId);
        const newAward: Award = {
            id: generateUniqueId('aw'),
            name: `Goal Achiever: ${updatedGoal.description}`,
            description: 'You successfully completed a personal goal.',
            dateAchieved: new Date().toISOString(),
            points: updatedGoal.points
        };
        saveUserData(userId, 'awards', [...userAwards, newAward]);
    }
    
    saveUserData(userId, 'goals', userGoals);
    return updatedGoal;
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    const userGoals = await getGoals(userId);
    const updatedGoals = userGoals.filter(g => g.id !== goalId);
    saveUserData(userId, 'goals', updatedGoals);
};

// Awards
export const getAwards = async (userId: string): Promise<Award[]> => {
  return getUserData(userId, 'awards', defaultAwards);
};

// Friends
export const getFriends = async (userId: string): Promise<Friend[]> => {
    return getUserData(userId, 'friends', initialFriends['user123'] || []);
};

export const getFriendById = async (userId: string, friendId: string): Promise<Friend | null> => {
    const userFriends = await getFriends(userId);
    return userFriends.find(f => f.id === friendId) || null;
}

// Shopping Cart
export const getShoppingCartItems = async (userId: string): Promise<ShoppingCartItem[]> => {
  return getUserData(userId, 'shoppingCart', defaultShoppingCart);
};

export const addShoppingCartItem = async (
  userId: string,
  item: Omit<ShoppingCartItem, 'id' | 'dateAdded'>
): Promise<ShoppingCartItem> => {
  const userItems = await getShoppingCartItems(userId);
  const newItem = { ...item, id: generateUniqueId('sc'), dateAdded: new Date().toISOString() };
  saveUserData(userId, 'shoppingCart', [...userItems, newItem]);
  return newItem;
};

export const updateShoppingCartItem = async (
  userId: string,
  itemId: string,
  updates: Partial<Omit<ShoppingCartItem, 'id'>>
): Promise<ShoppingCartItem> => {
  const userItems = await getShoppingCartItems(userId);
  const itemIndex = userItems.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found in shopping cart');

  const updatedItem = { ...userItems[itemIndex], ...updates };
  userItems[itemIndex] = updatedItem;
  saveUserData(userId, 'shoppingCart', userItems);
  return updatedItem;
};

export const deleteShoppingCartItem = async (
  userId: string,
  itemId: string
): Promise<void> => {
    const userItems = await getShoppingCartItems(userId);
    const itemIndex = userItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        userItems.splice(itemIndex, 1);
        saveUserData(userId, 'shoppingCart', userItems);
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
  const allUserData = getFromStorage('allUserData', {});
  if ((allUserData as Record<string, any>)[userId]) {
    delete (allUserData as Record<string, any>)[userId];
    saveToStorage('allUserData', allUserData);
  }

  const users = getFromStorage('users', {});
  const user = (users as Record<string, User>)[userId];

  if(user) {
    const newUser = getDefaultUserData(user.id, user.name, user.email);
    (users as Record<string, User>)[userId] = newUser;
    saveToStorage('users', users);
  }
  
  localStorage.removeItem(`city-grid-${userId}`);
  localStorage.removeItem(`game-start-date-${userId}`);
  localStorage.removeItem(`last-revenue-update-${userId}`);
};
