

export const TILES = {
  EMPTY: { emoji: ' ', name: 'Remove', cost: 0 },
  ROAD: { emoji: '⬛', name: 'Road', cost: 100 },
  GRASS: { emoji: '🌲', name: 'Tree', cost: 25, ecoBonus: 1 },
  POND: { emoji: '💧', name: 'Pond', cost: 150, ratingBonus: 5, ratingRange: 3, ecoBonus: 5 },
  MOUNTAIN: { emoji: '⛰️', name: 'Mountain', cost: 0, ecoBonus: 2 },
  FARMLAND: { emoji: '🌾', name: 'Farmland', cost: 200, isFarmland: true, ecoBonus: 0.5 },
  FACTORY: { emoji: '🏭', name: 'Factory', cost: 25000, ratingPenalty: -15, ratingRange: 5, revenueMultiplier: 5, ecoPenalty: 20 },
  STATION: { emoji: '🚉', name: 'Train Station', cost: 1000, isPublicService: true, maintenanceCostPerCitizen: 0.1, ratingBonus: 20, ratingRange: 15, serviceType: 'transport', ecoPenalty: 3 },
  AIRPORT: { emoji: '✈️', name: 'Airport', cost: 80000, ratingPenalty: -20, ratingRange: 7, revenueMultiplier: 10, ecoPenalty: 50 },
  GRAVEYARD: { emoji: '🪦', name: 'Graveyard', cost: 500, isPublicService: true, maintenanceCostPerCitizen: 0.02, ratingPenalty: -5, ratingRange: 4, serviceType: 'cemetery' },
  POLICE: { emoji: '🚓', name: 'Police Department', cost: 750, isPublicService: true, maintenanceCostPerCitizen: 0.25, ratingBonus: 25, ratingRange: 15, serviceType: 'police', ecoPenalty: 2 },
  FIRE: { emoji: '🚒', name: 'Fire Department', cost: 750, isPublicService: true, maintenanceCostPerCitizen: 0.25, ratingBonus: 25, ratingRange: 15, serviceType: 'fire', ecoPenalty: 2 },
  SCHOOL: { emoji: '🏫', name: 'School', cost: 1000, isPublicService: true, maintenanceCostPerCitizen: 0.2, ratingBonus: 20, ratingRange: 15, serviceType: 'education', ecoPenalty: 1 },
  HOSPITAL: { emoji: '🏥', name: 'Hospital', cost: 1250, isPublicService: true, maintenanceCostPerCitizen: 0.3, ratingBonus: 20, ratingRange: 15, serviceType: 'health', ecoPenalty: 2 },
  'POST OFFICE': { emoji: '🏣', name: 'Post Office', cost: 500, isPublicService: true, maintenanceCostPerCitizen: 0.05, ratingBonus: 5, ratingRange: 8, serviceType: 'communication', ecoPenalty: 1 },
  
  SETTLEMENT: [
    { emoji: '⛺', name: 'Tent', cost: 100, defaultPopulation: 1, maxPopulation: 2, isResidential: true },
    { emoji: '🌳', name: 'Big Tree', cost: 50, ecoBonus: 2 },
    { emoji: '🛖', name: 'Hut', cost: 250, defaultPopulation: 2, maxPopulation: 3, isResidential: true },
    { emoji: '🌻', name: 'Sunflower Field', cost: 75, ratingBonus: 1, ratingRange: 1, ecoBonus: 3 },
    { emoji: '🌴', name: 'Palm Tree', cost: 60, ratingBonus: 1, ratingRange: 1, ecoBonus: 1 },
    { emoji: '🌵', name: 'Cactus', cost: 60, ecoBonus: 0.5 },
    { emoji: '🍂', name: 'Leafless Tree', cost: 40, ecoBonus: 0.5 },
    { emoji: '🍃', name: 'Leaf', cost: 10, ecoBonus: 0.2 },
  ],
  VILLAGE: [
    { emoji: '🏪', name: 'Convenience Store', cost: 1000, ratingBonus: 5, ratingRange: 2, revenueMultiplier: 0.5, ecoPenalty: 1 },
  ],
  GRAND_VILLAGE: [
    { emoji: '🏡', name: 'House', cost: 5000, defaultPopulation: 2, maxPopulation: 5, isResidential: true, ecoPenalty: 0.5 },
  ],
  TOWN: [
    { emoji: '🏠', name: 'Family Home', cost: 7500, defaultPopulation: 4, maxPopulation: 8, isResidential: true, ecoPenalty: 0.5 },
    { emoji: '🍔', name: 'Restaurant', cost: 4000, ratingBonus: 10, ratingRange: 3, revenueMultiplier: 0.8, ecoPenalty: 2 },
  ],
  BOOM_TOWN: [
      { emoji: '🏬', name: 'Store', cost: 8000, ratingBonus: 15, ratingRange: 3, revenueMultiplier: 1, ecoPenalty: 1 },
  ],
  BUSY_TOWN: [
      { emoji: '🏋️', name: 'Gym', cost: 6000, ratingBonus: 15, ratingRange: 4, revenueMultiplier: 0.7, ecoPenalty: 1 },
  ],
  BIG_TOWN: [
      { emoji: '🏨', name: 'Hotel', cost: 12000, revenueMultiplier: 2, ecoPenalty: 2 },
  ],
  GREAT_TOWN: [
      { emoji: '🎬', name: 'Movie Theater', cost: 10000, ratingBonus: 18, ratingRange: 5, revenueMultiplier: 1.2, ecoPenalty: 2 },
  ],
  SMALL_CITY: [
    { emoji: '🏢', name: 'Apartment', cost: 30000, defaultPopulation: 20, maxPopulation: 60, isResidential: true, ecoPenalty: 1 },
  ],
  BIG_CITY: [
      { emoji: '🏦', name: 'Bank', cost: 20000, ratingBonus: 10, ratingRange: 4, revenueMultiplier: 2.2, ecoPenalty: 2 },
  ],
  LARGE_CITY: [
      { emoji: '⛽', name: 'Gas Station', cost: 15000, ratingPenalty: -5, ratingRange: 3, revenueMultiplier: 1.8, ecoPenalty: 10 },
  ],
  HUGE_CITY: [
      { emoji: '🏟️', name: 'Stadium', cost: 50000, ratingBonus: 30, ratingRange: 10, revenueMultiplier: 4, ecoPenalty: 15 },
  ],
  GRAND_CITY: [
    { emoji: '🏙️', name: 'Skyscraper', cost: 50000, defaultPopulation: 80, maxPopulation: 250, isResidential: true, ecoPenalty: 5 },
    { emoji: '⛳', name: 'Golf Course', cost: 40000, ratingBonus: 25, ratingRange: 8, revenueMultiplier: 3, ecoBonus: 10 },
  ],
  METROPOLIS: [
    { emoji: '🎢', name: 'Roller Coaster', cost: 60000, ratingBonus: 20, ratingRange: 6, revenueMultiplier: 2.5, ecoPenalty: 5 },
    { emoji: '🎪', name: 'Circus', cost: 30000, ratingBonus: 15, ratingRange: 5, revenueMultiplier: 1.5, ecoPenalty: 5 },
    { emoji: '🗼', name: 'Tokyo Tower', cost: 150000, ratingBonus: 50, ratingRange: 12, revenueMultiplier: 5, ecoPenalty: 10 },
  ],
  MEGALOPOLIS: [
    { emoji: '🌃', name: 'City at Night', cost: 100000, defaultPopulation: 200, maxPopulation: 600, isResidential: true, ecoPenalty: 8 },
    { emoji: '🚀', name: 'Rocket', cost: 200000, ratingPenalty: -30, ratingRange: 10, revenueMultiplier: 20, ecoPenalty: 100 },
    { emoji: '🏇', name: 'Horse Racing', cost: 120000, ratingBonus: 15, ratingRange: 7, revenueMultiplier: 6, ecoPenalty: 10 },
    { emoji: '🎰', name: 'Casino', cost: 180000, ratingPenalty: -10, ratingRange: 5, revenueMultiplier: 15, ecoPenalty: 8 },
    { emoji: '🌋', name: 'Volcano', cost: 500000, ratingPenalty: -100, ratingRange: 20, revenueMultiplier: 50, ecoPenalty: 200 },
    { emoji: '🏞️', name: 'National Park', cost: 100000, ratingBonus: 40, ratingRange: 15, ecoBonus: 100 },
  ],
};

export const getBuildingSet = (points: number) => {
  const findBuilding = (name: string) => TILES.SETTLEMENT.find(b => b.name === name)!;
  let available = [TILES.ROAD, TILES.GRASS, TILES.EMPTY, TILES.POND, findBuilding('Tent'), findBuilding('Hut')];
  
  if (points >= 0) available.push(TILES.FARMLAND, TILES.POLICE, TILES.FIRE, TILES.HOSPITAL, TILES.SCHOOL, TILES.GRAVEYARD, TILES['POST OFFICE'], TILES.STATION);
  if (points >= 100) available.push(...TILES.VILLAGE);
  if (points >= 200) available.push(findBuilding('Big Tree'));
  if (points >= 300) available.push(...TILES.GRAND_VILLAGE);
  if (points >= 400) available.push(...TILES.TOWN);
  if (points >= 500) available.push(...TILES.BOOM_TOWN);
  if (points >= 600) available.push(...TILES.BUSY_TOWN);
  if (points >= 700) available.push(...TILES.BIG_TOWN, findBuilding('Sunflower Field'));
  if (points >= 800) available.push(...TILES.GREAT_TOWN);
  if (points >= 900) available.push(...TILES.SMALL_CITY, TILES.FACTORY, findBuilding('Palm Tree'));
  if (points >= 1000) available.push(...TILES.BIG_CITY);
  if (points >= 1100) available.push(...TILES.LARGE_CITY, findBuilding('Cactus'));
  if (points >= 1200) available.push(...TILES.HUGE_CITY);
  if (points >= 1300) available.push(...TILES.GRAND_CITY, findBuilding('Leafless Tree'));
  if (points >= 1400) available.push(...TILES.METROPOLIS, TILES.AIRPORT);
  if (points >= 1500) available.push(...TILES.MEGALOPOLIS, findBuilding('Leaf'));

  // Remove duplicates by emoji
  const uniqueAvailable = available.filter((v,i,a)=>a.findIndex(t=>(t.emoji === v.emoji))===i);

  return uniqueAvailable.sort((a, b) => a.cost - b.cost);
};

export const cityTiers = [
    { points: 0, name: 'Tiny Village', multiplier: 2, next: 100 },
    { points: 100, name: 'Small Village', multiplier: 4, next: 200 },
    { points: 200, name: 'Large Village', multiplier: 6, next: 300 },
    { points: 300, name: 'Grand Village', multiplier: 8, next: 400 },
    { points: 400, name: 'Tiny Town', multiplier: 12, next: 500 },
    { points: 500, name: 'Boom Town', multiplier: 16, next: 600 },
    { points: 600, name: 'Busy Town', multiplier: 20, next: 700 },
    { points: 700, name: 'Big Town', multiplier: 25, next: 800 },
    { points: 800, name: 'Great Town', multiplier: 30, next: 900 },
    { points: 900, name: 'Small City', multiplier: 40, next: 1000 },
    { points: 1000, name: 'Big City', multiplier: 50, next: 1100 },
    { points: 1100, name: 'Large City', multiplier: 60, next: 1200 },
    { points: 1200, name: 'Huge City', multiplier: 75, next: 1300 },
    { points: 1300, name: 'Grand City', multiplier: 100, next: 1400 },
    { points: 1400, name: 'Metropolis', multiplier: 150, next: 1500 },
    { points: 1500, name: 'Megalopolis', multiplier: 200, next: null },
];

export const getCityLevel = (points: number) => {
    return cityTiers.find(tier => points >= tier.points && (tier.next === null || points < tier.next)) || cityTiers[0];
}

export const getAllBuildings = () => {
    return Object.values(TILES).flat().filter(b => typeof b === 'object' && b.name !== 'Mountain');
};

export const allBuildings = getAllBuildings() as {
    emoji: string;
    name: string;
    cost: number;
    isFarmland?: boolean;
    defaultPopulation?: number;
    maxPopulation?: number;
    isResidential?: boolean;
    ratingBonus?: number;
    ratingPenalty?: number;
    ratingRange?: number;
    revenueMultiplier?: number;
    isPublicService?: boolean;
    maintenanceCostPerCitizen?: number;
    serviceType?: string;
    ecoBonus?: number;
    ecoPenalty?: number;
}[];

export const buildingDataMap = new Map(allBuildings.map(b => [b.emoji, b]));

const calculateTileRating = (y: number, x: number, grid: string[][]): number => {
    let rating = 100; // Base rating

    const currentBuilding = buildingDataMap.get(grid[y][x]);
    const requiredServices = ['police', 'fire', 'health', 'education'];
    const foundServices = new Set<string>();
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            const building = buildingDataMap.get(grid[i][j]);
            if (!building) continue;

            const distance = Math.abs(i - y) + Math.abs(j - x);

            // Apply amenities
            if (building.ratingBonus && building.ratingRange && distance <= building.ratingRange) {
                // Effect diminishes with distance
                rating += Math.round(building.ratingBonus * (1 - distance / building.ratingRange));
            }

            // Apply nuisances
            if (building.ratingPenalty && building.ratingRange && distance <= building.ratingRange) {
                // Effect diminishes with distance
                rating += Math.round(building.ratingPenalty * (1 - distance / building.ratingRange));
            }

            // Check for service coverage
            if(building.isPublicService && building.ratingRange && distance <= building.ratingRange) {
                foundServices.add(building.serviceType!);
            }
        }
    }

    // Apply penalty for missing services, but not for tents or huts
    if (currentBuilding?.name !== 'Tent' && currentBuilding?.name !== 'Hut') {
        const missingServices = requiredServices.filter(s => !foundServices.has(s));
        rating -= missingServices.length * 15;
    }


    return rating;
}

const getRatingGrade = (rating: number): string => {
    if (rating >= 130) return 'A+';
    if (rating >= 120) return 'A';
    if (rating >= 110) return 'A-';
    if (rating >= 105) return 'B+';
    if (rating >= 100) return 'B';
    if (rating >= 95) return 'B-';
    if (rating >= 90) return 'C+';
    if (rating >= 80) return 'C';
    if (rating >= 70) return 'C-';
    if (rating >= 60) return 'D';
    return 'F';
};

const calculateOccupancy = (rating: number, defaultPop: number, maxPop: number): number => {
    const grade = getRatingGrade(rating);
    if (grade === 'F') return 0;

    const percentage = Math.min(rating / 150, 1); // Cap rating effect at 150 for 100%
    const dynamicPopulation = Math.round(defaultPop + (maxPop - defaultPop) * percentage);
    return Math.max(0, Math.min(dynamicPopulation, maxPop));
};

export const getCityInfo = (points: number, cityGrid: string[][] | null, tileY?: number, tileX?: number) => {
    const tier = getCityLevel(points);
    
    let totalPopulation = 0;
    let commercialRevenue = 0;
    let publicServiceCost = 0;
    let farmlandRevenue = 0;
    let ecoScore = 0;
    const farmlandPlots: { size: number; revenue: number; tiles: {y: number, x: number}[] }[] = [];
    const buildingCounts = new Map<string, { count: number; totalRevenue: number; totalCost: number; }>();

    if (cityGrid) {
        // --- Farmland Revenue Calculation ---
        const visited = new Set<string>();
        const plots: {y: number, x: number}[][] = [];

        const findPlot = (y: number, x: number, currentPlot: {y: number, x: number}[]) => {
            const key = `${y},${x}`;
            if (y < 0 || y >= cityGrid.length || x < 0 || x >= cityGrid[0].length || visited.has(key) || !buildingDataMap.get(cityGrid[y][x])?.isFarmland) {
                return;
            }
            visited.add(key);
            currentPlot.push({y, x});
            findPlot(y + 1, x, currentPlot);
            findPlot(y - 1, x, currentPlot);
            findPlot(y, x + 1, currentPlot);
            findPlot(y, x - 1, currentPlot);
        };

        for (let y = 0; y < cityGrid.length; y++) {
            for (let x = 0; x < cityGrid[y].length; x++) {
                if (buildingDataMap.get(cityGrid[y][x])?.isFarmland && !visited.has(`${y},${x}`)) {
                    const newPlot: {y: number, x: number}[] = [];
                    findPlot(y, x, newPlot);
                    if (newPlot.length > 0) {
                        plots.push(newPlot);
                    }
                }
            }
        }

        for (const plot of plots) {
            const size = plot.length;
            let totalPlotRevenue = 0;
            if (size >= 4) {
                const revenuePerTile = 50 + (size - 4) * 10;
                totalPlotRevenue = size * revenuePerTile;
                farmlandRevenue += totalPlotRevenue;
            }
            farmlandPlots.push({ size, revenue: totalPlotRevenue, tiles: plot });
        }
        
        // --- First pass: calculate population and eco score ---
        for (let y = 0; y < cityGrid.length; y++) {
            for (let x = 0; x < cityGrid[y].length; x++) {
                 const building = buildingDataMap.get(cityGrid[y][x]);
                 if (building) {
                    if (building.isResidential) {
                        const rating = calculateTileRating(y, x, cityGrid);
                        const occupancy = calculateOccupancy(rating, building.defaultPopulation!, building.maxPopulation!);
                        totalPopulation += occupancy;
                    }
                    ecoScore += building.ecoBonus || 0;
                    ecoScore -= building.ecoPenalty || 0;
                 }
            }
        }

        // --- Second pass: calculate revenue and costs based on total population ---
        for (let y = 0; y < cityGrid.length; y++) {
            for (let x = 0; x < cityGrid[y].length; x++) {
                const cell = cityGrid[y][x];
                const building = buildingDataMap.get(cell);

                let entry = buildingCounts.get(cell);
                if (building) {
                    if (!entry) {
                        entry = { count: 0, totalRevenue: 0, totalCost: 0 };
                    }
                    entry.count += 1;

                    if (building.revenueMultiplier) {
                        const buildingRevenue = (building.cost * building.revenueMultiplier * (totalPopulation / 100));
                        commercialRevenue += buildingRevenue;
                        entry.totalRevenue += buildingRevenue;
                    }
                    
                    if (building.isFarmland) {
                        const plot = farmlandPlots.find(p => p.tiles.some(t => t.y === y && t.x === x));
                        if(plot && plot.size > 0) {
                            const revenuePerTile = plot.revenue / plot.size;
                            entry.totalRevenue += revenuePerTile;
                        }
                    }
                    
                    if (building.isPublicService && building.maintenanceCostPerCitizen) {
                        publicServiceCost += building.maintenanceCostPerCitizen * totalPopulation;
                        entry.totalCost += building.maintenanceCostPerCitizen * totalPopulation;
                    }

                     buildingCounts.set(cell, entry);
                }
            }
        }
    }
    const residentialRevenue = totalPopulation * 10;
    const totalRevenue = residentialRevenue + commercialRevenue + farmlandRevenue;

    const ecoBonusMultiplier = ecoScore / 500; // e.g., 50 eco score = 10% bonus
    const ecoBonus = totalRevenue * ecoBonusMultiplier;

    const netRevenue = totalRevenue + ecoBonus - publicServiceCost;

    const sortedCounts = Array.from(buildingCounts.entries())
      .map(([emoji, data]) => ({
          emoji,
          name: buildingDataMap.get(emoji)?.name || 'Unknown',
          ...data
      }))
      .sort((a,b) => (b.totalRevenue - b.totalCost) - (a.totalRevenue - a.totalCost));

    let tileInfo = null;
    if (tileY !== undefined && tileX !== undefined && cityGrid) {
        const building = buildingDataMap.get(cityGrid[tileY][tileX]);
        if (building?.isResidential) {
            const rating = calculateTileRating(tileY, tileX, cityGrid);
            const grade = getRatingGrade(rating);
            const occupancy = calculateOccupancy(rating, building.defaultPopulation!, building.maxPopulation!);
            tileInfo = { rating, grade, occupancy };
        }
    }

    return {
        cityInfo: {
            name: tier.name,
            population: totalPopulation,
            totalRevenue: totalRevenue,
            totalCost: publicServiceCost,
            netRevenue: netRevenue,
            nextUpgrade: tier.next,
            farmlandPlots,
            ecoScore,
            ecoBonus,
        },
        buildingCounts: sortedCounts,
        tileInfo,
    };
};
