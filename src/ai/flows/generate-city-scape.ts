
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
  SETTLEMENT: ['🏡', '🌳'],
  VILLAGE: ['🏡', '🏠', '🌳'],
  TOWN: ['🏠', '🏡', '🏬', '🌳'],
  SMALL_CITY: ['🏢', '🏠', '🏬', '🏫', '🏭'],
  LARGE_CITY: ['🏢', '🏬', '🏙️', '🏫', '🚉'],
  METROPOLIS: ['🏙️', '🌃', '🏢', '🚀', '✈️'],
  FACTORY: '🏭',
  STATION: '🚉',
  AIRPORT: '✈️',
};

const getBuildingSet = (points: number) => {
  if (points < 200) return TILES.SETTLEMENT;
  if (points < 400) return TILES.VILLAGE;
  if (points < 600) return TILES.TOWN;
  if (points < 800) return TILES.SMALL_CITY;
  if (points < 1000) return TILES.LARGE_CITY;
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
      
      let baseTile = Math.random() > 0.1 ? TILES.GRASS : TILES.EMPTY;
      grid[y][x] = baseTile;
      
      // Road
      if (y === roadY || y === roadY + 1) {
        grid[y][x] = TILES.ROAD;
        continue;
      }

      // Buildings and stuff
      if (baseTile === TILES.GRASS) {
        const distFromRoad = Math.abs(y - roadY);
        // Higher chance of buildings closer to the road
        if (Math.random() < 0.3 / (distFromRoad + 1)) {
           grid[y][x] = buildingSet[Math.floor(Math.random() * buildingSet.length)];
       } else {
           // Further away from road, chance for special buildings
           if (input.points >= 600 && Math.random() > 0.95) {
               grid[y][x] = TILES.FACTORY;
           }
            if (input.points >= 800 && Math.random() > 0.98) {
               grid[y][x] = TILES.STATION;
           }
            if (input.points >= 1000 && Math.random() > 0.99) {
               grid[y][x] = TILES.AIRPORT;
           }
       }
      }
    }
  }

  return { grid };
}
