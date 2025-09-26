import { config } from 'dotenv';
config();

import '@/ai/flows/get-personalized-health-advice.ts';
import '@/ai/flows/import-recipe-from-url.ts';
import '@/ai/flows/generate-pantry-recipes.ts';
import '@/ai/flows/generate-recipe.ts';
