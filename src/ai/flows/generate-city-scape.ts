
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
  ROAD: '⬛',
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
  FARMLAND: '🌾',
  MOUNTAIN: '⛰️',
  POND: '💧',
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

// Helper to create clusters
const generateClusters = (grid: string[][], tile: string, clusterCount: number, clusterSize: number) => {
    for (let i = 0; i < clusterCount; i++) {
        const startX = Math.floor(Math.random() * GRID_WIDTH);
        const startY = Math.floor(Math.random() * GRID_HEIGHT);

        for (let j = 0; j < clusterSize; j++) {
            const x = startX + Math.floor(Math.random() * 5) - 2;
            const y = startY + Math.floor(Math.random() * 5) - 2;

            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && grid[y][x] === TILES.EMPTY) {
                grid[y][x] = tile;
            }
        }
    }
}

export async function generateCityScape(input: GenerateCityScapeInput): Promise<GenerateCityScapeOutput> {
  const grid: string[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(TILES.EMPTY));
  const roadY = Math.floor(GRID_HEIGHT / 2);

  // Generate natural features first
  generateClusters(grid, TILES.GRASS, 5, 20); // Forests
  generateClusters(grid, TILES.MOUNTAIN, 2, 8); // Mountains
  generateClusters(grid, TILES.POND, 3, 5); // Ponds
  generateClusters(grid, TILES.FARMLAND, 3, 15); // Farmland

  // Then add the road
  for (let x = 0; x < GRID_WIDTH; x++) {
    grid[roadY][x] = TILES.ROAD;
  }
  
  // Fill remaining empty space with grass
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x] === TILES.EMPTY) {
          grid[y][x] = TILES.GRASS;
      }
    }
  }

  return { grid };
}
