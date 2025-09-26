'use server';
/**
 * @fileOverview An AI agent for providing personalized health advice and generating actionable goals.
 *
 * - getPersonalizedHealthAdvice - A function that provides personalized health advice.
 * - GetPersonalizedHealthAdviceInput - The input type for the getPersonalizedHealthAdvice function.
 * - GetPersonalizedHealthAdviceOutput - The return type for the getPersonalizedHealthAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPersonalizedHealthAdviceInputSchema = z.object({
  foodLogs: z.string().describe('The user food logs.'),
  activityLogs: z.string().describe('The user activity logs.'),
  healthGoal: z.string().describe('The user health goal (e.g., lose weight).'),
});
export type GetPersonalizedHealthAdviceInput = z.infer<
  typeof GetPersonalizedHealthAdviceInputSchema
>;

const GetPersonalizedHealthAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized health advice based on user data.'),
  goals: z.array(
    z.string().describe('Actionable goals to achieve the health goal.')
  ),
});
export type GetPersonalizedHealthAdviceOutput = z.infer<
  typeof GetPersonalizedHealthAdviceOutputSchema
>;

export async function getPersonalizedHealthAdvice(
  input: GetPersonalizedHealthAdviceInput
): Promise<GetPersonalizedHealthAdviceOutput> {
  return getPersonalizedHealthAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPersonalizedHealthAdvicePrompt',
  input: {schema: GetPersonalizedHealthAdviceInputSchema},
  output: {schema: GetPersonalizedHealthAdviceOutputSchema},
  prompt: `You are a personal health advisor. Provide personalized advice and generate actionable goals based on the user's food and activity logs and stated health goal.\n\nFood Logs: {{{foodLogs}}}\nActivity Logs: {{{activityLogs}}}\nHealth Goal: {{{healthGoal}}}\n\nProvide advice and 2-3 specific, actionable goals.
`,
});

const getPersonalizedHealthAdviceFlow = ai.defineFlow(
  {
    name: 'getPersonalizedHealthAdviceFlow',
    inputSchema: GetPersonalizedHealthAdviceInputSchema,
    outputSchema: GetPersonalizedHealthAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
