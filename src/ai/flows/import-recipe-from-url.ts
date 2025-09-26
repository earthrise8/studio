'use server';

/**
 * @fileOverview Imports a recipe from a given URL.
 *
 * - importRecipeFromUrl - A function that imports recipe details from a URL.
 * - ImportRecipeFromUrlInput - The input type for the importRecipeFromUrl function.
 * - ImportRecipeFromUrlOutput - The return type for the importRecipeFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportRecipeFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the recipe to import.'),
});
export type ImportRecipeFromUrlInput = z.infer<typeof ImportRecipeFromUrlInputSchema>;

const ImportRecipeFromUrlOutputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('The ingredients required for the recipe, formatted as a markdown list.'),
  instructions: z.string().describe('The step-by-step instructions for preparing the recipe, formatted as a numbered list.'),
  prepTime: z.string().optional().describe('The preparation time for the recipe.'),
  cookTime: z.string().optional().describe('The cooking time for the recipe.'),
  totalTime: z.string().optional().describe('The total time for the recipe.'),
  description: z.string().optional().describe('A short description of the recipe.'),
});
export type ImportRecipeFromUrlOutput = z.infer<typeof ImportRecipeFromUrlOutputSchema>;

export async function importRecipeFromUrl(input: ImportRecipeFromUrlInput): Promise<ImportRecipeFromUrlOutput> {
  return importRecipeFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importRecipeFromUrlPrompt',
  input: {schema: ImportRecipeFromUrlInputSchema},
  output: {schema: ImportRecipeFromUrlOutputSchema},
  prompt: `You are a recipe extraction expert. Given a URL, extract the recipe details.

URL: {{{url}}}

Extract the name, ingredients as a markdown list, and instructions as a numbered markdown list. Also include prep time, cook time, total time, and a short description if available.

Ensure the output is well-formatted and easy to read.
If prep time, cook time, or total time are not found, leave them blank.
`,
});

const importRecipeFromUrlFlow = ai.defineFlow(
  {
    name: 'importRecipeFromUrlFlow',
    inputSchema: ImportRecipeFromUrlInputSchema,
    outputSchema: ImportRecipeFromUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
