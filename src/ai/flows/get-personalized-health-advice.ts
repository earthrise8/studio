
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
    z.object({
        description: z.string().describe('A specific, actionable goal to achieve the health goal.'),
        target: z.coerce.number().describe('A measurable target for the goal (e.g., 30 for 30 minutes, 5 for 5 times).'),
        points: z.coerce.number().describe('The number of points awarded for completing the goal, based on its difficulty (e.g., 50, 100, 150).'),
    }).describe('A specific, actionable goal with a measurable target and points.')
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
  prompt: `You are a personal health advisor. Provide personalized advice and generate 2-3 specific, actionable goals based on the user's food and activity logs and stated health goal.\n\nFood Logs: {{{foodLogs}}}\nActivity Logs: {{{activityLogs}}}\nHealth Goal: {{{healthGoal}}}\n\nFor each goal, provide a clear description, a numeric target, and a point value based on its difficulty (e.g., easy=50, medium=100, hard=150). For example, for a goal "Exercise for 30 minutes, 3 times a week", a good description would be "Exercise for 30 minutes" and the target would be 3.
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
