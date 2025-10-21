
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
};

const initialFriends: Record<string, Friend[]> = {
    'user123': [
        { id: 'f1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice', weeklyPoints: 1250 },
        { id: 'f2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob', weeklyPoints: 980 },
        { id: 'f3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', weeklyPoints: 750 },
    ]
}

const initialShoppingCart: Record<string, ShoppingCartItem[]> = {
    'user123': [
        { id: 'sc1', name: 'Organic Apples', dateAdded: subDays(today, 1).toISOString(), store: 'Whole Foods', price: 3.99, healthRating: 5 },
        { id: 'sc2', name: 'Almond Milk', dateAdded: subDays(today, 2).toISOString(), store: 'Trader Joe\'s', price: 2.99, healthRating: 4 },
        { id: 'sc3', name: 'Whole Wheat Bread', dateAdded: subDays(today, 1).toISOString(), store: 'Walmart', price: 2.50, healthRating: 3 },
    ]
};


// --- Data Access Functions using localStorage ---

export const resetUserData = (userId: string) => {
    let users = getFromStorage('MOCK_USERS', initialUsers);
    let pantry = getFromStorage('MOCK_PANTRY', initialPantry);
    let foodLogs = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
    let activityLogs = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
    let recipes = getFromStorage('MOCK_RECIPES', initialRecipes);
    let goals = getFromStorage('MOCK_GOALS', initialGoals);
    let awards = getFromStorage('MOCK_AWARDS', initialAwards);
    let shoppingCart = getFromStorage('MOCK_SHOPPING_CART', initialShoppingCart);


    users[userId] = JSON.parse(JSON.stringify(initialUsers[userId]));
    pantry[userId] = JSON.parse(JSON.stringify(initialPantry[userId]));
    foodLogs[userId] = JSON.parse(JSON.stringify(initialFoodLogs[userId]));
    activityLogs[userId] = JSON.parse(JSON.stringify(initialActivityLogs[userId]));
    recipes[userId] = JSON.parse(JSON.stringify(initialRecipes[userId]));
    goals[userId] = JSON.parse(JSON.stringify(initialGoals[userId]));
    awards[userId] = JSON.parse(JSON.stringify(initialAwards[userId]));
    shoppingCart[userId] = JSON.parse(JSON.stringify(initialShoppingCart[userId]));

    saveToStorage('MOCK_USERS', users);
    saveToStorage('MOCK_PANTRY', pantry);
    saveToStorage('MOCK_FOOD_LOGS', foodLogs);
    saveToStorage('MOCK_ACTIVITY_LOGS', activityLogs);
    saveToStorage('MOCK_RECIPES', recipes);
    saveToStorage('MOCK_GOALS', goals);
    saveToStorage('MOCK_AWARDS', awards);
    saveToStorage('MOCK_SHOPPING_CART', shoppingCart);

    // Also clear any cached city grids and game state
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith(`city-grid-${userId}`) || key.startsWith(`game-start-date-${userId}`) || key.startsWith(`last-revenue-update-${userId}`)) {
            localStorage.removeItem(key);
        }
    })
}

const checkAndGrantAwards = async (userId: string, completedGoal: Goal) => {
    let MOCK_AWARDS = getFromStorage('MOCK_AWARDS', initialAwards);
    if(!MOCK_AWARDS[userId]) MOCK_AWARDS[userId] = [];

    const awardName = `Goal Achiever: ${completedGoal.description}`;
    const existingAward = MOCK_AWARDS[userId].find(a => a.name === awardName);

    if(!existingAward) {
        const newAward: Award = {
            id: `a${Date.now()}`,
            name: awardName,
            description: 'You successfully completed a personal goal.',
            dateAchieved: new Date().toISOString(),
            points: completedGoal.points,
        };
        MOCK_AWARDS[userId].push(newAward);
        saveToStorage('MOCK_AWARDS', MOCK_AWARDS);
    }
}

export const getUser = async (userId: string): Promise<User | null> => {
  const MOCK_USERS = getFromStorage('MOCK_USERS', initialUsers);
  return MOCK_USERS[userId] || null;
}

export const createUser = async(userData: Omit<User, 'profile'> & { profile: UserProfile }): Promise<User> => {
    let MOCK_USERS = getFromStorage('MOCK_USERS', initialUsers);
    if (MOCK_USERS[userData.id]) {
      throw new Error('User already exists');
    }
    const newUser: User = { ...userData };
    MOCK_USERS[newUser.id] = newUser;
    saveToStorage('MOCK_USERS', MOCK_USERS);

    let MOCK_PANTRY = getFromStorage('MOCK_PANTRY', initialPantry);
    MOCK_PANTRY[newUser.id] = [];
    saveToStorage('MOCK_PANTRY', MOCK_PANTRY);

    let MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
    MOCK_FOOD_LOGS[newUser.id] = [];
    saveToStorage('MOCK_FOOD_LOGS', MOCK_FOOD_LOGS);

    let MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
    MOCK_ACTIVITY_LOGS[newUser.id] = [];
    saveToStorage('MOCK_ACTIVITY_LOGS', MOCK_ACTIVITY_LOGS);

    let MOCK_RECIPES = getFromStorage('MOCK_RECIPES', initialRecipes);
    MOCK_RECIPES[newUser.id] = [];
    saveToStorage('MOCK_RECIPES', MOCK_RECIPES);

    let MOCK_GOALS = getFromStorage('MOCK_GOALS', initialGoals);
    MOCK_GOALS[newUser.id] = [];
    saveToStorage('MOCK_GOALS', MOCK_GOALS);
    
    let MOCK_AWARDS = getFromStorage('MOCK_AWARDS', initialAwards);
    MOCK_AWARDS[newUser.id] = [];
    saveToStorage('MOCK_AWARDS', MOCK_AWARDS);

    return newUser;
}

export const updateUserProfile = async (userId: string, data: Partial<{ name: string; email: string; profile: Partial<UserProfile> }>): Promise<User> => {
  let MOCK_USERS = getFromStorage('MOCK_USERS', initialUsers);
  if (!MOCK_USERS[userId]) {
    throw new Error('User not found');
  }

  if (data.name) MOCK_USERS[userId].name = data.name;
  if (data.email) MOCK_USERS[userId].email = data.email;
  if (data.profile) {
    MOCK_USERS[userId].profile = { ...MOCK_USERS[userId].profile, ...data.profile };
  }
  
  saveToStorage('MOCK_USERS', MOCK_USERS);
  return MOCK_USERS[userId];
};

export const getPantryItems = async (userId: string): Promise<PantryItem[]> => {
  const MOCK_PANTRY = getFromStorage('MOCK_PANTRY', initialPantry);
  return MOCK_PANTRY[userId] || [];
};

export const addPantryItem = async (userId: string, itemData: Omit<PantryItem, 'id'>): Promise<PantryItem> => {
    let MOCK_PANTRY = getFromStorage('MOCK_PANTRY', initialPantry);
    if (!MOCK_PANTRY[userId]) MOCK_PANTRY[userId] = [];
    
    const newItem: PantryItem = { ...itemData, id: `p${Date.now()}${Math.random()}` };
    MOCK_PANTRY[userId].push(newItem);
    saveToStorage('MOCK_PANTRY', MOCK_PANTRY);
    return newItem;
};

export const updatePantryItem = async (userId: string, itemId: string, updatedData: PantryItem): Promise<PantryItem> => {
  let MOCK_PANTRY = getFromStorage('MOCK_PANTRY', initialPantry);
  const userItems = MOCK_PANTRY[userId];
  if (!userItems) throw new Error("User pantry not found");
  
  const itemIndex = userItems.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
      userItems[itemIndex] = { ...userItems[itemIndex], ...updatedData };
      saveToStorage('MOCK_PANTRY', MOCK_PANTRY);
      return userItems[itemIndex];
  }
  throw new Error("Item not found");
}

export const deletePantryItem = async (userId: string, itemId: string): Promise<void> => {
  let MOCK_PANTRY = getFromStorage('MOCK_PANTRY', initialPantry);
  if (MOCK_PANTRY[userId]) {
    MOCK_PANTRY[userId] = MOCK_PANTRY[userId].filter(item => item.id !== itemId);
    saveToStorage('MOCK_PANTRY', MOCK_PANTRY);
  }
};

export const getFoodLogs = async (userId: string, date: string): Promise<FoodLog[]> => {
  const MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
  return (MOCK_FOOD_LOGS[userId] || []).filter(log => log.date === date);
};

export const addFoodLog = async (userId: string, logData: Omit<FoodLog, 'id'>): Promise<FoodLog> => {
    let MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
    if (!MOCK_FOOD_LOGS[userId]) MOCK_FOOD_LOGS[userId] = [];
    
    const newLog: FoodLog = { ...logData, id: `fl${Date.now()}` };
    MOCK_FOOD_LOGS[userId].push(newLog);
    saveToStorage('MOCK_FOOD_LOGS', MOCK_FOOD_LOGS);
    return newLog;
}

export const updateFoodLog = async (userId: string, logId: string, updatedData: Partial<FoodLog>): Promise<FoodLog> => {
    let MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
    const userLogs = MOCK_FOOD_LOGS[userId];
    if (!userLogs) throw new Error("User food logs not found");

    const logIndex = userLogs.findIndex(log => log.id === logId);
    if (logIndex !== -1) {
        userLogs[logIndex] = { ...userLogs[logIndex], ...updatedData };
        saveToStorage('MOCK_FOOD_LOGS', MOCK_FOOD_LOGS);
        return userLogs[logIndex];
    }
    throw new Error("Food log not found");
};

export const deleteFoodLog = async (userId: string, logId: string): Promise<void> => {
    let MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
    if (MOCK_FOOD_LOGS[userId]) {
        MOCK_FOOD_LOGS[userId] = MOCK_FOOD_LOGS[userId].filter(log => log.id !== logId);
        saveToStorage('MOCK_FOOD_LOGS', MOCK_FOOD_LOGS);
    }
};

export const getActivityLogs = async (userId: string, date: string): Promise<ActivityLog[]> => {
  const MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
  return (MOCK_ACTIVITY_LOGS[userId] || []).filter(log => log.date === date);
};

export const addActivityLog = async (userId: string, logData: Omit<ActivityLog, 'id'>): Promise<ActivityLog> => {
    let MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
    if (!MOCK_ACTIVITY_LOGS[userId]) MOCK_ACTIVITY_LOGS[userId] = [];

    const newLog: ActivityLog = { ...logData, id: `al${Date.now()}` };
    MOCK_ACTIVITY_LOGS[userId].push(newLog);
    saveToStorage('MOCK_ACTIVITY_LOGS', MOCK_ACTIVITY_LOGS);
    return newLog;
}

export const updateActivityLog = async (userId: string, logId: string, updatedData: Partial<ActivityLog>): Promise<ActivityLog> => {
    let MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
    const userLogs = MOCK_ACTIVITY_LOGS[userId];
    if (!userLogs) throw new Error("User activity logs not found");

    const logIndex = userLogs.findIndex(log => log.id === logId);
    if (logIndex !== -1) {
        userLogs[logIndex] = { ...userLogs[logIndex], ...updatedData };
        saveToStorage('MOCK_ACTIVITY_LOGS', MOCK_ACTIVITY_LOGS);
        return userLogs[logIndex];
    }
    throw new Error("Activity log not found");
};

export const deleteActivityLog = async (userId: string, logId: string): Promise<void> => {
    let MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
    if (MOCK_ACTIVITY_LOGS[userId]) {
        MOCK_ACTIVITY_LOGS[userId] = MOCK_ACTIVITY_LOGS[userId].filter(log => log.id !== logId);
        saveToStorage('MOCK_ACTIVITY_LOGS', MOCK_ACTIVITY_LOGS);
    }
};

export const getRecentFoodLogs = async (userId: string, days = 7): Promise<FoodLog[]> => {
  const MOCK_FOOD_LOGS = getFromStorage('MOCK_FOOD_LOGS', initialFoodLogs);
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  return (MOCK_FOOD_LOGS[userId] || []).filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  })
}

export const getRecentActivityLogs = async (userId: string, days = 7): Promise<ActivityLog[]> => {
  const MOCK_ACTIVITY_LOGS = getFromStorage('MOCK_ACTIVITY_LOGS', initialActivityLogs);
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  return (MOCK_ACTIVITY_LOGS[userId] || []).filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  })
}

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  const MOCK_RECIPES = getFromStorage('MOCK_RECIPES', initialRecipes);
  return MOCK_RECIPES[userId] || [];
};

export const addRecipe = async (userId: string, recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
    let MOCK_RECIPES = getFromStorage('MOCK_RECIPES', initialRecipes);
    const newRecipe: Recipe = { ...recipe, id: `r${Date.now()}${Math.random()}` };
    if (!MOCK_RECIPES[userId]) MOCK_RECIPES[userId] = [];

    MOCK_RECIPES[userId].push(newRecipe);
    saveToStorage('MOCK_RECIPES', MOCK_RECIPES);
    return newRecipe;
}

export const updateRecipe = async (userId: string, recipeId: string, updatedData: Partial<Recipe>): Promise<Recipe> => {
    let MOCK_RECIPES = getFromStorage('MOCK_RECIPES', initialRecipes);
    const userRecipes = MOCK_RECIPES[userId];
    if (!userRecipes) throw new Error("User recipes not found");

    const recipeIndex = userRecipes.findIndex(r => r.id === recipeId);
    if (recipeIndex !== -1) {
        userRecipes[recipeIndex] = { ...userRecipes[recipeIndex], ...updatedData };
        saveToStorage('MOCK_RECIPES', MOCK_RECIPES);
        return userRecipes[recipeIndex];
    }
    throw new Error("Recipe not found");
};

export const deleteRecipe = async (userId: string, recipeId: string): Promise<void> => {
  let MOCK_RECIPES = getFromStorage('MOCK_RECIPES', initialRecipes);
  if (MOCK_RECIPES[userId]) {
    const index = MOCK_RECIPES[userId].findIndex(r => r.id === recipeId);
    if (index !== -1) {
      MOCK_RECIPES[userId].splice(index, 1);
      saveToStorage('MOCK_RECIPES', MOCK_RECIPES);
    }
  }
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
  const MOCK_GOALS = getFromStorage('MOCK_GOALS', initialGoals);
  return [...(MOCK_GOALS[userId] || [])].sort((a,b) => a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
};

export const addGoal = async (userId: string, goalData: Omit<Goal, 'id'>): Promise<Goal> => {
    let MOCK_GOALS = getFromStorage('MOCK_GOALS', initialGoals);
    if (!MOCK_GOALS[userId]) MOCK_GOALS[userId] = [];

    const newGoal: Goal = { ...goalData, id: `g${Date.now()}`};
    MOCK_GOALS[userId].push(newGoal);
    saveToStorage('MOCK_GOALS', MOCK_GOALS);
    return newGoal;
}

export const updateGoal = async (userId: string, updatedGoal: Goal): Promise<Goal> => {
    let MOCK_USERS = getFromStorage('MOCK_USERS', initialUsers);
    let MOCK_GOALS = getFromStorage('MOCK_GOALS', initialGoals);
    if (!MOCK_GOALS[userId] || !MOCK_USERS[userId]) throw new Error("User data not found");
    
    const goalIndex = MOCK_GOALS[userId].findIndex(g => g.id === updatedGoal.id);
    if (goalIndex === -1) throw new Error("Goal not found");
    
    const oldGoal = MOCK_GOALS[userId][goalIndex];
    const wasCompleted = oldGoal.isCompleted;
    MOCK_GOALS[userId][goalIndex] = updatedGoal;
    
    if(updatedGoal.isCompleted && !wasCompleted) {
        await checkAndGrantAwards(userId, updatedGoal);
        const currentUser = MOCK_USERS[userId];
        const oldPoints = currentUser.profile.totalPoints || 0;
        const newPoints = oldPoints + updatedGoal.points;
        currentUser.profile.totalPoints = newPoints;
        
        const oldLevel = Math.floor(oldPoints / 100);
        const newLevel = Math.floor(newPoints / 100);

        if (newLevel > oldLevel) {
            const levelsGained = newLevel - oldLevel;
            const moneyEarned = levelsGained * (500 + oldLevel * 100);
            currentUser.profile.money = (currentUser.profile.money || 0) + moneyEarned;
            currentUser.profile.level = newLevel;
        }

        saveToStorage('MOCK_USERS', MOCK_USERS);
    } else if (!updatedGoal.isCompleted && wasCompleted) {
        // If a goal is "un-completed", subtract points
        const currentUser = MOCK_USERS[userId];
        currentUser.profile.totalPoints = Math.max(0, (currentUser.profile.totalPoints || 0) - updatedGoal.points);
        // Note: We are not revoking awards or money if a goal is un-completed to keep it simple.
        saveToStorage('MOCK_USERS', MOCK_USERS);
    }
    
    saveToStorage('MOCK_GOALS', MOCK_GOALS);
    return updatedGoal;
}

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    let MOCK_GOALS = getFromStorage('MOCK_GOALS', initialGoals);
    if (MOCK_GOALS[userId]) {
        MOCK_GOALS[userId] = MOCK_GOALS[userId].filter(g => g.id !== goalId);
        saveToStorage('MOCK_GOALS', MOCK_GOALS);
    }
}

export const getAwards = async (userId: string): Promise<Award[]> => {
  const MOCK_AWARDS = getFromStorage('MOCK_AWARDS', initialAwards);
  return MOCK_AWARDS[userId] || [];
};

export const getFriends = async (userId: string): Promise<Friend[]> => {
    const MOCK_FRIENDS = getFromStorage('MOCK_FRIENDS', initialFriends);
    return (MOCK_FRIENDS[userId] || []).sort((a,b) => b.weeklyPoints - a.weeklyPoints);
}

// Shopping Cart Functions
export const getShoppingCartItems = async (userId: string): Promise<ShoppingCartItem[]> => {
    const MOCK_SHOPPING_CART = getFromStorage('MOCK_SHOPPING_CART', initialShoppingCart);
    return MOCK_SHOPPING_CART[userId] || [];
};

export const addShoppingCartItem = async (userId: string, itemData: Omit<ShoppingCartItem, 'id' | 'dateAdded'>): Promise<ShoppingCartItem> => {
    let MOCK_SHOPPING_CART = getFromStorage('MOCK_SHOPPING_CART', initialShoppingCart);
    if (!MOCK_SHOPPING_CART[userId]) MOCK_SHOPPING_CART[userId] = [];
    
    const newItem: ShoppingCartItem = {
        ...itemData,
        id: `sc${Date.now()}`,
        dateAdded: new Date().toISOString(),
    };
    MOCK_SHOPPING_CART[userId].unshift(newItem);
    saveToStorage('MOCK_SHOPPING_CART', MOCK_SHOPPING_CART);
    return newItem;
};

export const updateShoppingCartItem = async (userId: string, itemId: string, updatedData: Partial<ShoppingCartItem>): Promise<ShoppingCartItem> => {
    let MOCK_SHOPPING_CART = getFromStorage('MOCK_SHOPPING_CART', initialShoppingCart);
    const userItems = MOCK_SHOPPING_CART[userId];
    if (!userItems) throw new Error("User shopping cart not found");

    const itemIndex = userItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        userItems[itemIndex] = { ...userItems[itemIndex], ...updatedData };
        saveToStorage('MOCK_SHOPPING_CART', MOCK_SHOPPING_CART);
        return userItems[itemIndex];
    }
    throw new Error("Shopping cart item not found");
};

export const deleteShoppingCartItem = async (userId: string, itemId: string): Promise<void> => {
    let MOCK_SHOPPING_CART = getFromStorage('MOCK_SHOPPING_CART', initialShoppingCart);
    if (MOCK_SHOPPING_CART[userId]) {
        MOCK_SHOPPING_CART[userId] = MOCK_SHOPPING_CART[userId].filter(item => item.id !== itemId);
        saveToStorage('MOCK_SHOPPING_CART', MOCK_SHOPPING_CART);
    }
};
    

    