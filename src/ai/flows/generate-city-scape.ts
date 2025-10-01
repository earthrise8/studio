
'use server';

/**
 * @fileOverview Generates an emoji city grid based on user points.
 *
 * - generateCityScape - A function that generates a city grid.
 */
import { z } from 'zod';

const GenerateCityScapeInputSchema = z.object({
  points: z.number().describe('The total points the user has accumulated.'),
});
export type GenerateCityScapeInput = z.infer<typeof GenerateCityScapeInputSchema>;

const GenerateCityScapeOutputSchema = z.object({
  grid: z.array(z.array(z.string())).describe('The 2D grid of emojis representing the city.'),
});
export type GenerateCityScapeOutput = z.infer<typeof GenerateCityScapeOutputSchema>;

const TILES = {
  EMPTY: ' ',
  ROAD: '➖',
  GRASS: '🌲',
  WATER: '🟦',
  VILLAGE: ['🏡', '🌳', '🌳'],
  TOWN: ['🏠', '🏡', '🏬', '🌳'],
  SMALL_CITY: ['🏢', '🏠', '🏬', '🏫', '🌳'],
  LARGE_CITY: ['🏢', '🏬', '🏙️', '🏫', '🌳'],
  METROPOLIS: ['🏙️', '🌃', '🏢', '🚀'],
};

const getBuildingSet = (points: number) => {
  if (points < 100) return TILES.VILLAGE;
  if (points < 500) return TILES.TOWN;
  if (points < 1000) return TILES.SMALL_CITY;
  if (points < 2000) return TILES.LARGE_CITY;
  return TILES.METROPOLIS;
};

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

export async function generateCityScape(input: GenerateCityScapeInput): Promise<GenerateCityScapeOutput> {
  const grid: string[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(TILES.EMPTY));
  const buildingSet = getBuildingSet(input.points);

  // Simple generation logic
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Horizon
      if (y > GRID_HEIGHT / 2 ) {
         grid[y][x] = TILES.GRASS;
      }
      
      // Road
      if (y === GRID_HEIGHT - 5) {
        grid[y][x] = TILES.ROAD;
      }

      // Buildings
      if (y > GRID_HEIGHT / 2 && y < GRID_HEIGHT - 5) {
          if (Math.random() > 0.6) {
            grid[y][x] = buildingSet[Math.floor(Math.random() * buildingSet.length)];
          }
      }
    }
  }

  return { grid };
}
