
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
  VILLAGE: ['🏡', '🌳', '🌳'],
  TOWN: ['🏠', '🏡', '🏬', '🌳'],
  SMALL_CITY: ['🏢', '🏠', '🏬', '🏫', '🏭'],
  LARGE_CITY: ['🏢', '🏬', '🏙️', '🏫', '🚉'],
  METROPOLIS: ['🏙️', '🌃', '🏢', '🚀', '✈️'],
  FACTORY: '🏭',
  STATION: '🚉',
  AIRPORT: '✈️',
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
  const roadY = GRID_HEIGHT - 5;


  // Simple generation logic
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      
      let baseTile = TILES.EMPTY;
      if (y > GRID_HEIGHT / 2) {
        baseTile = TILES.GRASS;
      }
      grid[y][x] = baseTile;
      
      // Road
      if (y === roadY) {
        grid[y][x] = TILES.ROAD;
        continue;
      }

      // Buildings and stuff
      if (y > GRID_HEIGHT / 2) {
        // Place buildings near the road
        const distFromRoad = Math.abs(y - roadY);
        if (distFromRoad > 0 && distFromRoad < 4) {
             if (Math.random() > 0.6) {
                grid[y][x] = buildingSet[Math.floor(Math.random() * buildingSet.length)];
            }
        } else if (baseTile === TILES.GRASS) {
            // Further away from road, chance for special buildings
            if (input.points >= 500 && Math.random() > 0.95) {
                grid[y][x] = TILES.FACTORY;
            }
             if (input.points >= 1000 && Math.random() > 0.98) {
                grid[y][x] = TILES.STATION;
            }
             if (input.points >= 2000 && Math.random() > 0.99) {
                grid[y][x] = TILES.AIRPORT;
            }
        }
      }
    }
  }

  return { grid };
}
