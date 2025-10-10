
'use server';

/**
 * @fileOverview Generates a recipe based on a user's prompt.
 *
 * - generateRecipe - A function that generates recipe details from a text prompt.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for a recipe. e.g., "a healthy chicken and broccoli stir-fry"'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('The ingredients required for the recipe, formatted as a markdown list, with each ingredient on a new line starting with "-".'),
  instructions: z.string().describe('The step-by-step instructions for preparing the recipe, formatted as a numbered list, with each step on its own line starting with a number and a period (e.g., "1. ...").'),
  prepTime: z.string().optional().describe('The preparation time for the recipe (e.g., "15 min").'),
  cookTime: z.string().optional().describe('The cooking time for the recipe (e.g., "30 min").'),
  totalTime: z.string().optional().describe('The total time for the recipe (e.g., "45 min").'),
  description: z.string().optional().describe('A short, appetizing description of the recipe.'),
  emoji: z.string().describe('A single emoji that represents the recipe.'),
  servings: z.coerce.number().optional().describe('The number of servings this recipe makes.'),
  calories: z.coerce.number().optional().describe('Estimated calories per serving.'),
  protein: z.coerce.number().optional().describe('Estimated protein (grams) per serving.'),
  carbs: z.coerce.number().optional().describe('Estimated carbohydrates (grams) per serving.'),
  fat: z.coerce.number().optional().describe('Estimated fat (grams) per serving.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a creative chef. Given a user's request, create a delicious recipe.

Request: {{{prompt}}}

Generate a recipe with a name, a single emoji, and a short description.
Format the ingredients as a markdown list, with each ingredient on its own line (e.g., "- 1 cup flour\n- 2 eggs").
Format the step-by-step instructions as a numbered markdown list, with each step on its own line (e.g., "1. Preheat oven.\n2. Mix ingredients.").
Within the instructions, be specific about cooking times and temperatures where applicable (e.g., "Bake at 350°F/175°C for 20-25 minutes.").
Also provide the prep time, cook time, and total time if applicable.
Finally, provide the number of servings this recipe makes, and an estimation for the nutritional information per serving: calories, protein, carbs, and fat.
Ensure the output is well-formatted and easy to read.
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    

