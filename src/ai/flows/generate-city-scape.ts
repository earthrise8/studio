
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
  POND: '💧',
  MOUNTAIN: '⛰️',
  FARMLAND: '🌾',
  BIG_TREE: '🌳',
  SUNFLOWER: '🌻',
};

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

// Helper to create clusters
const generateClusters = (grid: string[][], tile: string, clusterCount: number, minSize: number, maxSize: number) => {
    for (let i = 0; i < clusterCount; i++) {
        const startX = Math.floor(Math.random() * GRID_WIDTH);
        const startY = Math.floor(Math.random() * GRID_HEIGHT);
        const clusterSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

        for (let j = 0; j < clusterSize; j++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * (clusterSize / 4);
            const x = Math.round(startX + Math.cos(angle) * radius);
            const y = Math.round(startY + Math.sin(angle) * radius);

            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && grid[y][x] === TILES.EMPTY) {
                grid[y][x] = tile;
            }
        }
    }
}

const generateRiver = (grid: string[][]) => {
    const isHorizontal = Math.random() > 0.5;
    let x, y, dx, dy;
    let turnChance = 0.3;
    let turnDirection = (Math.random() > 0.5) ? 1 : -1;

    if (isHorizontal) {
        x = 0;
        y = Math.floor(Math.random() * (GRID_HEIGHT / 2)) + Math.floor(GRID_HEIGHT / 4);
        dx = 1;
        dy = 0;
    } else {
        x = Math.floor(Math.random() * (GRID_WIDTH / 2)) + Math.floor(GRID_WIDTH / 4);
        y = 0;
        dx = 0;
        dy = 1;
    }

    while (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
        // Main path
        if (grid[y] && grid[y][x] === TILES.EMPTY) grid[y][x] = TILES.POND;
        
        // Second path for width
        if (isHorizontal) {
            if (y + 1 < GRID_HEIGHT && grid[y+1] && grid[y+1][x] === TILES.EMPTY) grid[y+1][x] = TILES.POND;
        } else {
            if (x + 1 < GRID_WIDTH && grid[y] && grid[y][x+1] === TILES.EMPTY) grid[y][x+1] = TILES.POND;
        }

        // Move
        x += dx;
        y += dy;

        // Winding logic
        if (Math.random() < turnChance) {
             if (isHorizontal) {
                dy = turnDirection;
                dx = 0;
             } else {
                dx = turnDirection;
                dy = 0;
             }
        } else {
             if (isHorizontal) {
                 dx = 1;
                 dy = 0;
             } else {
                 dx = 0;
                 dy = 1;
             }
        }
        
        // Chance to change turning direction
        if (Math.random() < 0.1) {
            turnDirection *= -1;
        }
    }
}


export async function generateCityScape(input: GenerateCityScapeInput): Promise<GenerateCityScapeOutput> {
  const grid: string[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(TILES.EMPTY));
  
  // Generate natural features first
  generateClusters(grid, TILES.MOUNTAIN, 2, 8, 12); // Mountains
  generateClusters(grid, TILES.FARMLAND, 3, 10, 20); // Farmland
  generateRiver(grid);
  generateClusters(grid, TILES.GRASS, 5, 15, 30); // Forests

  // Then add the road
  const isHorizontal = Math.random() > 0.5;
  if (isHorizontal) {
    const roadY = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2; // Avoid edges
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[roadY][x] = TILES.ROAD;
    }
  } else {
    const roadX = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2; // Avoid edges
    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y][roadX] = TILES.ROAD;
    }
  }
  
  // Fill remaining empty space with decorative grass and trees
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x] === TILES.EMPTY) {
          const rand = Math.random();
          if (rand < 0.7) {
            grid[y][x] = TILES.GRASS;
          } else if (rand < 0.85) {
            grid[y][x] = TILES.BIG_TREE;
          } else if (rand < 0.95) {
             grid[y][x] = TILES.SUNFLOWER;
          } else {
             grid[y][x] = ' '; // Leave some truly empty
          }
      }
    }
  }

  return { grid };
}
