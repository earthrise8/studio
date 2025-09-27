// This is a mock database. In a real application, you would use Firestore.
import type {
  PantryItem,
  FoodLog,
  ActivityLog,
  Recipe,
  Goal,
  Award,
  User,
  UserProfile,
} from '@/lib/types';
import { addDays, formatISO, subDays } from 'date-fns';

const today = new Date();

let MOCK_USERS: Record<string, User> = {
  'user1': {
    id: 'user1',
    email: 'user@example.com',
    name: 'Alex Doe',
    profile: {
      dailyCalorieGoal: 2200,
      healthGoal: 'Lose weight and build muscle',
      age: 30,
      height: 178,
      weight: 75,
      activityLevel: 'moderate'
    },
  },
};

let MOCK_PANTRY: Record<string, PantryItem[]> = {
  'user1': [
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
      name: 'Broccoli',
      quantity: 1,
      unit: 'units',
      category: 'Produce',
      purchaseDate: subDays(today, 3).toISOString(),
      expirationDate: addDays(today, 4).toISOString(),
    },
    {
      id: 'p4',
      name: 'Eggs',
      quantity: 12,
      unit: 'units',
      category: 'Dairy',
      purchaseDate: subDays(today, 5).toISOString(),
      expirationDate: addDays(today, 16).toISOString(),
    },
     {
      id: 'p5',
      name: 'Old Bread',
      quantity: 1,
      unit: 'units',
      category: 'Pantry',
      purchaseDate: subDays(today, 10).toISOString(),
      expirationDate: subDays(today, 2).toISOString(),
    },
  ],
};

let MOCK_FOOD_LOGS: Record<string, FoodLog[]> = {
  'user1': [
    {
      id: 'fl1',
      date: formatISO(today, { representation: 'date' }),
      name: 'Oatmeal with Berries',
      calories: 350,
      protein: 10,
      carbs: 60,
      fat: 8,
    },
    {
      id: 'fl2',
      date: formatISO(today, { representation: 'date' }),
      name: 'Grilled Chicken Salad',
      calories: 450,
      protein: 40,
      carbs: 15,
      fat: 25,
    },
    {
      id: 'fl3',
      date: formatISO(subDays(today,1), { representation: 'date' }),
      name: 'Salmon with Quinoa',
      calories: 600,
      protein: 45,
      carbs: 40,
      fat: 30,
    },
  ],
};

let MOCK_ACTIVITY_LOGS: Record<string, ActivityLog[]> = {
  'user1': [
    {
      id: 'al1',
      date: formatISO(today, { representation: 'date' }),
      name: 'Morning Run',
      duration: 30,
      caloriesBurned: 300,
    },
    {
      id: 'al2',
      date: formatISO(today, { representation: 'date' }),
      name: 'Weight Lifting',
      duration: 60,
      caloriesBurned: 400,
    },
  ],
};

let MOCK_RECIPES: Record<string, Recipe[]> = {
  'user1': [
    {
      id: 'r1',
      name: 'Classic Chicken Soup',
      description: 'A comforting and easy-to-make chicken soup.',
      ingredients: '1 lb chicken, 8 cups broth, 2 carrots, 2 celery stalks, 1 onion, noodles',
      instructions: '1. Cook chicken. 2. Sauté vegetables. 3. Add broth and chicken. 4. Simmer. 5. Add noodles and cook until tender.',
      prepTime: '15 min',
      cookTime: '45 min',
      totalTime: '1 hour',
      emoji: '🍲'
    },
  ],
};

let MOCK_GOALS: Record<string, Goal[]> = {
  'user1': [
    { id: 'g1', description: 'Run 3 times this week', progress: 1, target: 3, isCompleted: false },
    { id: 'g2', description: 'Drink 8 glasses of water daily', progress: 8, target: 8, isCompleted: true },
  ],
};

let MOCK_AWARDS: Record<string, Award[]> = {
  'user1': [
    { id: 'a1', name: 'First Workout', description: 'Completed your first logged activity.', dateAchieved: subDays(today, 10).toISOString() },
    { id: 'a2', name: 'Perfect Week', description: 'Logged an activity every day for 7 days.', dateAchieved: subDays(today, 3).toISOString() },
    { id: 'a3', name: 'Goal Achiever: Drink 8 glasses of water daily', description: 'You successfully completed a personal goal.', dateAchieved: today.toISOString()},
  ],
};

const checkAndGrantAwards = async (userId: string, completedGoal: Goal) => {
    if(!MOCK_AWARDS[userId]) MOCK_AWARDS[userId] = [];

    const awardName = `Goal Achiever: ${completedGoal.description}`;
    const existingAward = MOCK_AWARDS[userId].find(a => a.name === awardName);

    if(!existingAward) {
        const newAward: Award = {
            id: `a${Date.now()}`,
            name: awardName,
            description: 'You successfully completed a personal goal.',
            dateAchieved: new Date().toISOString()
        };
        MOCK_AWARDS[userId].push(newAward);
    }
}

// Mock data access functions
export const getUser = async (userId: string): Promise<User | null> => {
  return MOCK_USERS[userId] || null;
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return Object.values(MOCK_USERS).find(user => user.email === email) || null;
}

export const createUser = async(email: string, name:string): Promise<User> => {
    const id = `user${Object.keys(MOCK_USERS).length + 1}`;
    const newUser: User = {
        id, email, name, profile: { dailyCalorieGoal: 2000, healthGoal: 'Get started' }
    };
    MOCK_USERS[id] = newUser;
    MOCK_PANTRY[id] = [];
    MOCK_FOOD_LOGS[id] = [];
    MOCK_ACTIVITY_LOGS[id] = [];
    MOCK_RECIPES[id] = [];
    MOCK_GOALS[id] = [];
    MOCK_AWARDS[id] = [];
    return newUser;
}

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  if (!MOCK_USERS[userId]) {
    throw new Error('User not found');
  }

  // Update name and email if provided
  if (data.name) MOCK_USERS[userId].name = data.name;
  if (data.email) MOCK_USERS[userId].email = data.email;

  // Update profile if provided
  if (data.profile) {
    MOCK_USERS[userId].profile = {
      ...MOCK_USERS[userId].profile,
      ...data.profile,
    };
  }

  return MOCK_USERS[userId];
};


export const getPantryItems = async (userId: string): Promise<PantryItem[]> => {
  return MOCK_PANTRY[userId] || [];
};

export const addPantryItem = async (userId: string, itemData: Omit<PantryItem, 'id'>): Promise<PantryItem> => {
    if (!MOCK_PANTRY[userId]) {
        MOCK_PANTRY[userId] = [];
    }
    const newItem: PantryItem = {
        ...itemData,
        id: `p${Date.now()}${Math.random()}` // simple unique id
    };
    MOCK_PANTRY[userId].push(newItem);
    return newItem;
};

export const updatePantryItem = async (itemId: string, updatedData: PantryItem): Promise<PantryItem> => {
  const userEntries = Object.entries(MOCK_PANTRY);
  for(const [userId, items] of userEntries) {
      const itemIndex = items.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
          MOCK_PANTRY[userId][itemIndex] = { ...MOCK_PANTRY[userId][itemIndex], ...updatedData };
          return MOCK_PANTRY[userId][itemIndex];
      }
  }
  throw new Error("Item not found");
}

export const getFoodLogs = async (userId: string, date: string): Promise<FoodLog[]> => {
  return (MOCK_FOOD_LOGS[userId] || []).filter(log => log.date === date);
};

export const updateFoodLog = async (logId: string, updatedData: Partial<FoodLog>): Promise<FoodLog> => {
    for (const userId in MOCK_FOOD_LOGS) {
        const logIndex = MOCK_FOOD_LOGS[userId].findIndex(log => log.id === logId);
        if (logIndex !== -1) {
            MOCK_FOOD_LOGS[userId][logIndex] = { ...MOCK_FOOD_LOGS[userId][logIndex], ...updatedData };
            return MOCK_FOOD_LOGS[userId][logIndex];
        }
    }
    throw new Error("Food log not found");
};

export const deleteFoodLog = async (logId: string): Promise<void> => {
    for (const userId in MOCK_FOOD_LOGS) {
        MOCK_FOOD_LOGS[userId] = MOCK_FOOD_LOGS[userId].filter(log => log.id !== logId);
    }
};

export const getActivityLogs = async (userId: string, date: string): Promise<ActivityLog[]> => {
  return (MOCK_ACTIVITY_LOGS[userId] || []).filter(log => log.date === date);
};

export const updateActivityLog = async (logId: string, updatedData: Partial<ActivityLog>): Promise<ActivityLog> => {
    for (const userId in MOCK_ACTIVITY_LOGS) {
        const logIndex = MOCK_ACTIVITY_LOGS[userId].findIndex(log => log.id === logId);
        if (logIndex !== -1) {
            MOCK_ACTIVITY_LOGS[userId][logIndex] = { ...MOCK_ACTIVITY_LOGS[userId][logIndex], ...updatedData };
            return MOCK_ACTIVITY_LOGS[userId][logIndex];
        }
    }
    throw new Error("Activity log not found");
};

export const deleteActivityLog = async (logId: string): Promise<void> => {
    for (const userId in MOCK_ACTIVITY_LOGS) {
        MOCK_ACTIVITY_LOGS[userId] = MOCK_ACTIVITY_LOGS[userId].filter(log => log.id !== logId);
    }
};

export const getRecentFoodLogs = async (userId: string, days = 7): Promise<FoodLog[]> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  return (MOCK_FOOD_LOGS[userId] || []).filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  })
}

export const getRecentActivityLogs = async (userId: string, days = 7): Promise<ActivityLog[]> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  return (MOCK_ACTIVITY_LOGS[userId] || []).filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  })
}

export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  return MOCK_RECIPES[userId] || [];
};

export const addRecipe = async (userId: string, recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
    const newRecipe: Recipe = {
        ...recipe,
        id: `r${Date.now()}${Math.random()}`
    };
    if (!MOCK_RECIPES[userId]) {
        MOCK_RECIPES[userId] = [];
    }
    MOCK_RECIPES[userId].push(newRecipe);
    return newRecipe;
}

export const deleteRecipe = async (userId: string, recipeId: string): Promise<void> => {
  if (MOCK_RECIPES[userId]) {
    const index = MOCK_RECIPES[userId].findIndex(r => r.id === recipeId);
    if (index !== -1) {
      MOCK_RECIPES[userId].splice(index, 1);
    }
  }
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
  return [...(MOCK_GOALS[userId] || [])].sort((a,b) => a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
};

export const addGoal = async (userId: string, goalData: Omit<Goal, 'id'>): Promise<Goal> => {
    if (!MOCK_GOALS[userId]) MOCK_GOALS[userId] = [];
    const newGoal: Goal = { ...goalData, id: `g${Date.now()}`};
    MOCK_GOALS[userId].push(newGoal);
    return newGoal;
}

export const updateGoal = async (userId: string, updatedGoal: Goal): Promise<Goal> => {
    if (!MOCK_GOALS[userId]) throw new Error("User has no goals");
    const goalIndex = MOCK_GOALS[userId].findIndex(g => g.id === updatedGoal.id);
    if (goalIndex === -1) throw new Error("Goal not found");
    
    const wasCompleted = MOCK_GOALS[userId][goalIndex].isCompleted;
    MOCK_GOALS[userId][goalIndex] = updatedGoal;
    
    // Check if goal was just completed
    if(updatedGoal.isCompleted && !wasCompleted) {
        await checkAndGrantAwards(userId, updatedGoal);
    }
    return updatedGoal;
}

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    if (MOCK_GOALS[userId]) {
        MOCK_GOALS[userId] = MOCK_GOALS[userId].filter(g => g.id !== goalId);
    }
}


export const getAwards = async (userId: string): Promise<Award[]> => {
  return MOCK_AWARDS[userId] || [];
};
