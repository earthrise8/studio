
'use server';

/**
 * @fileOverview Generates a city scape image based on user points.
 *
 * - generateCityScape - A function that generates a city image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCityScapeInputSchema = z.object({
  points: z.number().describe('The total points the user has accumulated.'),
});
export type GenerateCityScapeInput = z.infer<typeof GenerateCityScapeInputSchema>;

const GenerateCityScapeOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated city image.'),
});
export type GenerateCityScapeOutput = z.infer<typeof GenerateCityScapeOutputSchema>;

function getCityDescription(points: number): string {
  if (points < 100) {
    return 'A small, humble village with a few small houses and a dirt path, pixel art style.';
  } else if (points < 500) {
    return 'A growing town with a mix of houses and small shops, a town square, and paved roads, pixel art style.';
  } else if (points < 1000) {
    return 'A bustling small city with multi-story buildings, a park, and cars on the street, vibrant pixel art style.';
  } else if (points < 2000) {
    return 'A large, modern city with skyscrapers, public transportation like buses and trains, and many citizens, detailed pixel art style.';
  } else {
    return 'A massive, futuristic metropolis with towering sci-fi skyscrapers, flying vehicles, and neon lights, epic pixel art cityscape.';
  }
}

export async function generateCityScape(input: GenerateCityScapeInput): Promise<GenerateCityScapeOutput> {
  const cityDescription = getCityDescription(input.points);
  const prompt = `Generate a 2D panoramic cityscape of ${cityDescription}. The style should be clean, retro-modern pixel art with a vibrant color palette. The city should look prosperous and clean.`;

  const { media } = await ai.generate({
    model: 'googleai/gemini-pro-vision',
    prompt: prompt,
     config: {
      responseModalities: ['IMAGE'],
    },
  });

  const imageUrl = media.url;
  if (!imageUrl) {
    throw new Error('Image generation failed.');
  }

  return { imageUrl };
}

// Note: defineFlow and definePrompt are not needed here as we are directly using ai.generate
// with a dynamically constructed prompt.
