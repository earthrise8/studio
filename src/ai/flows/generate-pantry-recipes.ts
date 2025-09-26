// src/ai/flows/generate-pantry-recipes.ts
'use server';

/**
 * @fileOverview Generates recipe suggestions based on the user's pantry items.
 *
 * - generatePantryRecipes - A function that suggests recipes based on pantry items.
 * - GeneratePantryRecipesInput - The input type for the generatePantryRecipes function.
 * - GeneratePantryRecipesOutput - The return type for the generatePantryRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePantryRecipesInputSchema = z.object({
  pantryItems: z
    .array(
      z.object({
        name: z.string().describe('The name of the pantry item.'),
        quantity: z.number().describe('The quantity of the pantry item.'),
        unit: z.string().describe('The unit of measurement for the quantity (e.g., lbs, units).'),
      })
    )
    .describe('A list of items currently in the user\u2019s pantry.'),
});
export type GeneratePantryRecipesInput = z.infer<typeof GeneratePantryRecipesInputSchema>;

const GeneratePantryRecipesOutputSchema = z.object({
  recipes: z
    .array(
      z.object({
        name: z.string().describe('The name of the recipe.'),
        description: z.string().describe('A short, appetizing description of the recipe.'),
      })
    )
    .describe('A list of recipe suggestions based on the provided pantry items.'),
});
export type GeneratePantryRecipesOutput = z.infer<typeof GeneratePantryRecipesOutputSchema>;

export async function generatePantryRecipes(input: GeneratePantryRecipesInput): Promise<GeneratePantryRecipesOutput> {
  return generatePantryRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePantryRecipesPrompt',
  input: {schema: GeneratePantryRecipesInputSchema},
  output: {schema: GeneratePantryRecipesOutputSchema},
  prompt: `You are a personal chef who specializes in creating recipes based on available ingredients.

  Given the following list of pantry items, suggest 3-5 recipe ideas. Provide a name and a short, appetizing description for each recipe.

Pantry Items:
{{#each pantryItems}}
- {{quantity}} {{unit}} of {{name}}
{{/each}}`,
});

const generatePantryRecipesFlow = ai.defineFlow(
  {
    name: 'generatePantryRecipesFlow',
    inputSchema: GeneratePantryRecipesInputSchema,
    outputSchema: GeneratePantryRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
