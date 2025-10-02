
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getActivityLogs,
  getFoodLogs,
  getPantryItems,
  getGoals,
  updateGoal,
  getFriends,
  updateUserProfile,
} from '@/lib/data';
import {
  Apple,
  Flame,
  PlusCircle,
  Dumbbell,
  Lightbulb,
  CheckCircle2,
  Trophy,
  Plus,
  Minus,
  Target,
  Users,
  Building,
  Loader2,
  RefreshCw,
  Edit,
  Grid3x3,
  List,
  Trash2,
  Search,
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import type { Goal, FoodLog, ActivityLog, PantryItem, Friend, UserProfile } from '@/lib/types';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateCityScape } from '@/ai/flows/generate-city-scape';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


function GoalProgress({ goal, onUpdate }: { goal: Goal, onUpdate: (amount: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <div className='flex-1'>
                    <p className={goal.isCompleted ? 'line-through text-muted-foreground' : ''}>{goal.description}</p>
                    <p className='text-xs text-muted-foreground'>{goal.points}</p>
                </div>
                <div className="flex items-center gap-2 font-medium">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdate(-1)}
                        disabled={goal.progress <= 0 || goal.isCompleted}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span>{goal.progress} / {goal.target}</span>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdate(1)}
                        disabled={goal.isCompleted}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

const TILES = {
  EMPTY: { emoji: ' ', name: 'Remove', cost: 0 },
  ROAD: { emoji: '⬛', name: 'Road', cost: 10 },
  GRASS: { emoji: '🌲', name: 'Tree', cost: 5 },
  POND: { emoji: '💧', name: 'Pond', cost: 15, ratingBonus: 5, ratingRange: 3 },
  MOUNTAIN: { emoji: '⛰️', name: 'Mountain', cost: 0 },
  FARMLAND: { emoji: '🌾', name: 'Farmland', cost: 20 },
  FACTORY: { emoji: '🏭', name: 'Factory', cost: 250, ratingPenalty: -15, ratingRange: 5 },
  STATION: { emoji: '🚉', name: 'Train Station', cost: 400 },
  AIRPORT: { emoji: '✈️', name: 'Airport', cost: 800, ratingPenalty: -20, ratingRange: 7 },
  SETTLEMENT: [
    { emoji: '⛺', name: 'Tent', cost: 10, defaultPopulation: 1, maxPopulation: 2, isResidential: true },
    { emoji: '🏡', name: 'House', cost: 50, defaultPopulation: 2, maxPopulation: 5, isResidential: true },
    { emoji: '🌳', name: 'Big Tree', cost: 5 },
  ],
  VILLAGE: [
    { emoji: '🏠', name: 'Family Home', cost: 75, defaultPopulation: 4, maxPopulation: 8, isResidential: true },
    { emoji: '⛪', name: 'Church', cost: 100, ratingBonus: 10, ratingRange: 4 },
  ],
  TOWN: [
    { emoji: '🏬', name: 'Store', cost: 150, ratingBonus: 15, ratingRange: 3 },
    { emoji: '🏨', name: 'Hotel', cost: 350 },
  ],
  SMALL_CITY: [
    { emoji: '🏢', name: 'Apartment', cost: 300, defaultPopulation: 20, maxPopulation: 60, isResidential: true },
    { emoji: '🏫', name: 'School', cost: 200, ratingBonus: 10, ratingRange: 5 },
    { emoji: '🏥', name: 'Hospital', cost: 450 },
  ],
  LARGE_CITY: [
    { emoji: '🏙️', name: 'Skyscraper', cost: 500, defaultPopulation: 80, maxPopulation: 250, isResidential: true },
    { emoji: '🎢', name: 'Roller Coaster', cost: 600, ratingBonus: 20, ratingRange: 6 },
    { emoji: '🎪', name: 'Circus', cost: 300, ratingBonus: 15, ratingRange: 5 },
  ],
  METROPOLIS: [
    { emoji: '🌃', name: 'City at Night', cost: 1000, defaultPopulation: 200, maxPopulation: 600, isResidential: true },
    { emoji: '🚀', name: 'Rocket', cost: 2000, ratingPenalty: -30, ratingRange: 10 },
    { emoji: '⛳', name: 'Golf Course', cost: 700, ratingBonus: 25, ratingRange: 8 },
    { emoji: '🏟️', name: 'Stadium', cost: 900, ratingBonus: 30, ratingRange: 10 },
  ],
};

const getBuildingSet = (points: number) => {
  let available = [TILES.ROAD, TILES.GRASS, TILES.EMPTY, TILES.POND, ...TILES.SETTLEMENT];
  if (points >= 200) available.push(...TILES.VILLAGE, TILES.FARMLAND);
  if (points >= 400) available.push(...TILES.TOWN);
  if (points >= 600) available.push(...TILES.SMALL_CITY, TILES.FACTORY);
  if (points >= 800) available.push(...TILES.LARGE_CITY, TILES.STATION);
  if (points >= 1000) available.push(...TILES.METROPOLIS, TILES.AIRPORT);

  // Remove duplicates by emoji
  const uniqueAvailable = available.filter((v,i,a)=>a.findIndex(t=>(t.emoji === v.emoji))===i);

  return uniqueAvailable.sort((a, b) => a.cost - b.cost);
};

const cityTiers = [
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

const getCityLevel = (points: number) => {
    return cityTiers.find(tier => points >= tier.points && (tier.next === null || points < tier.next)) || cityTiers[0];
}

const getAllBuildings = () => {
    return Object.values(TILES).flat().filter(b => typeof b === 'object');
};

const allBuildings = getAllBuildings() as {
    emoji: string;
    name: string;
    cost: number;
    defaultPopulation?: number;
    maxPopulation?: number;
    isResidential?: boolean;
    ratingBonus?: number;
    ratingPenalty?: number;
    ratingRange?: number;
}[];

const buildingDataMap = new Map(allBuildings.map(b => [b.emoji, b]));

const calculateTileRating = (y: number, x: number, grid: string[][]): number => {
    let rating = 100; // Base rating
    
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
        }
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


const getCityInfo = (points: number, cityGrid: string[][] | null) => {
    const tier = getCityLevel(points);
    
    let totalPopulation = 0;
    if (cityGrid) {
        for (let y = 0; y < cityGrid.length; y++) {
            for (let x = 0; x < cityGrid[y].length; x++) {
                const building = buildingDataMap.get(cityGrid[y][x]);
                if (building && building.isResidential) {
                    const rating = calculateTileRating(y, x, cityGrid);
                    const occupancy = calculateOccupancy(rating, building.defaultPopulation!, building.maxPopulation!);
                    totalPopulation += occupancy;
                }
            }
        }
    }

    return {
        name: tier.name,
        population: totalPopulation,
        totalRevenue: totalPopulation * 10,
        nextUpgrade: tier.next,
    };
};


export default function DashboardPage() {
  const { user, refreshUser, setUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [cityGrid, setCityGrid] = useState<string[][] | null>(null);
  const [cityLoading, setCityLoading] = useState(true);
  const [selectedTiles, setSelectedTiles] = useState<{y: number, x: number}[]>([]);
  const [tileView, setTileView] = useState<'grid' | 'list'>('grid');
  const [tileSearchTerm, setTileSearchTerm] = useState('');

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{y: number, x: number} | null>(null);
  const [dragOver, setDragOver] = useState<{y: number, x: number} | null>(null);


  const [data, setData] = useState<{
    pantryItems: PantryItem[],
    foodLogsToday: FoodLog[],
    activityLogsToday: ActivityLog[],
    goals: Goal[],
    friends: Friend[],
  } | null>(null);

  const getCachedGrid = useCallback(() => {
    if (typeof window === 'undefined' || !user) return null;
    const cached = localStorage.getItem(`city-grid-${user.id}`);
    return cached ? JSON.parse(cached) : null;
  }, [user]);

  const saveGridToCache = useCallback((grid: string[][]) => {
     if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`city-grid-${user.id}`, JSON.stringify(grid));
     }
  }, [user]);

  const handleGenerateCity = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    if (!forceRefresh) {
        const cachedGrid = getCachedGrid();
        if (cachedGrid) {
            setCityGrid(cachedGrid);
            setCityLoading(false);
            return;
        }
    }

    setCityLoading(true);
    try {
      const result = await generateCityScape({ points: user.profile.totalPoints || 0 });
      setCityGrid(result.grid);
      saveGridToCache(result.grid);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'City Generation Failed',
        description: 'Could not generate your city. Please try again.',
      });
    } finally {
      setCityLoading(false);
    }
  }, [user, toast, getCachedGrid, saveGridToCache]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const todayStr = formatISO(new Date(), { representation: 'date' });

    const [
      pantryItems,
      foodLogsToday,
      activityLogsToday,
      goals,
      friends,
    ] = await Promise.all([
      getPantryItems(user.id),
      getFoodLogs(user.id, todayStr),
      getActivityLogs(user.id, todayStr),
      getGoals(user.id),
      getFriends(user.id),
    ]);

    setData({ pantryItems, foodLogsToday, activityLogsToday, goals, friends });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      handleGenerateCity();
    }
  }, [user, loadDashboardData, handleGenerateCity]);

  const handleGoalUpdate = async (goal: Goal, amount: number) => {
    if (!user || !data) return;

    const newProgress = Math.max(0, goal.progress + amount);
    const isNowCompleted = newProgress >= goal.target;
    
    const updatedGoal: Goal = {
      ...goal,
      progress: newProgress,
      isCompleted: isNowCompleted,
    };
    
    // Optimistically update UI
    const originalGoals = data.goals;
    setData({
        ...data,
        goals: data.goals.map(g => g.id === goal.id ? updatedGoal : g)
    });

    try {
      await updateGoal(user.id, updatedGoal);
      if (updatedGoal.isCompleted && !goal.isCompleted) {
        toast({
          title: "Goal Complete!",
          description: `You've achieved: ${goal.description} and earned ${goal.points} points!`,
          action: <Button asChild variant="secondary"><Link href="/awards">View Awards</Link></Button>
        });
      }
      // Regardless of completion, refresh user to get latest points and tokens
      await refreshUser();
      // We still want to load dashboard data to ensure goal state is accurate from source
      await loadDashboardData();
    } catch (e) {
      // Revert if error
      setData({ ...data, goals: originalGoals });
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your goal progress.',
      });
    }
  }

  const handleTileClick = (e: React.MouseEvent, y: number, x: number) => {
    if (!cityGrid) return;
    
    const tile = cityGrid[y][x];
    if (tile === '⛰️') {
        toast({ variant: 'destructive', title: "Cannot build on mountains!" });
        return;
    }

    const tileCoord = {y, x};
    
    if(e.shiftKey) {
        const tileIndex = selectedTiles.findIndex(t => t.y === y && t.x === x);
        if (tileIndex > -1) {
            setSelectedTiles(current => current.filter((_, index) => index !== tileIndex));
        } else {
            setSelectedTiles(current => [...current, tileCoord]);
        }
    } else {
        setSelectedTiles([tileCoord]);
    }
  }
  
  const isAdjacentToRoad = (y: number, x: number, grid: string[][]): boolean => {
    const neighbors = [
        {dy: -1, dx: 0}, // up
        {dy: 1, dx: 0},  // down
        {dy: 0, dx: -1}, // left
        {dy: 0, dx: 1}   // right
    ];
    for (const {dy, dx} of neighbors) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] === TILES.ROAD.emoji) {
            return true;
        }
    }
    return false;
  };
  
  const isWithinDistanceOfRoad = (y: number, x: number, grid: string[][], distance: number): boolean => {
      for(let i = 0; i < grid.length; i++) {
          for (let j = 0; j < grid[i].length; j++) {
              if (grid[i][j] === TILES.ROAD.emoji) {
                  const dist = Math.abs(i - y) + Math.abs(j - x); // Manhattan distance
                  if (dist <= distance) {
                      return true;
                  }
              }
          }
      }
      return false;
  };

  const handleTileSelect = async (building: { emoji: string; name: string; cost: number }) => {
    if (selectedTiles.length === 0 || !cityGrid || !user) return;

    // --- Validation Logic ---
    const exemptFromRoadRule = ['Tree', 'Big Tree', 'Pond', 'Farmland', 'Tent', 'Remove'];

    if (building.emoji === TILES.ROAD.emoji) {
        const isAnyTileAdjacentToRoad = selectedTiles.some(tile => isAdjacentToRoad(tile.y, tile.x, cityGrid));
        if (!isAnyTileAdjacentToRoad) {
            toast({
                variant: 'destructive',
                title: 'Invalid Road Placement',
                description: 'At least one road tile must be connected to an existing road.',
            });
            return;
        }
    } else if (!exemptFromRoadRule.includes(building.name)) {
        for (const tile of selectedTiles) {
            if (!isWithinDistanceOfRoad(tile.y, tile.x, cityGrid, 3)) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid Building Placement',
                    description: `Building at (${tile.x}, ${tile.y}) must be within 3 tiles of a road.`,
                });
                return;
            }
        }
    }

    const currentTokens = user.profile.buildingTokens || 0;
    
    let totalNetCost = 0;

    for(const tile of selectedTiles) {
        let tokensToRefund = 0;
        const existingEmoji = cityGrid[tile.y][tile.x];
        const replacedBuilding = allBuildings.find(b => b.emoji === existingEmoji);

        if (replacedBuilding) {
            if (replacedBuilding.emoji === TILES.ROAD.emoji && (building.name === 'Remove' || building.name === 'Tree')) {
                 tokensToRefund = replacedBuilding.cost / 2; // Refund half for roads when removing
            } else if (building.name === 'Remove' || building.name === 'Tree') {
                tokensToRefund = replacedBuilding.cost; // Full refund for other buildings
            }
        }
        totalNetCost += (building.cost - tokensToRefund);
    }
    
    if (currentTokens < totalNetCost) {
      toast({
          variant: 'destructive',
          title: 'Not enough tokens!',
          description: `You need ${totalNetCost} tokens for this action, but you only have ${currentTokens}.`,
      });
      return;
    }

    const newGrid = cityGrid.map(row => [...row]);
    selectedTiles.forEach(tile => {
        newGrid[tile.y][tile.x] = building.emoji;
    });

    setCityGrid(newGrid);

    const newTotalTokens = currentTokens - totalNetCost;
    
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        buildingTokens: newTotalTokens,
      }
    };
    setUser(updatedUser);

    try {
      await updateUserProfile(user.id, { profile: { buildingTokens: newTotalTokens } });
      saveGridToCache(newGrid);
      
      toast({
          title: 'City Updated!',
          description: `Placed ${selectedTiles.length} "${building.name}" tile(s) for a net cost of ${totalNetCost} tokens.`,
      });

      await refreshUser();

    } catch (error) {
      setCityGrid(cityGrid); // Revert grid on error
      setUser(user); // Revert user tokens on error
       toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: `Could not update your city.`,
      });
    }

    setSelectedTiles([]);
  };

  const handleMouseDown = (e: React.MouseEvent, y: number, x: number) => {
    if(e.shiftKey) return; // Don't start drag if shift is held
    setIsDragging(true);
    setDragStart({y, x});
    setDragOver({y,x});
    setSelectedTiles([]);
  };

  const handleMouseEnter = (y: number, x: number) => {
    if (isDragging) {
      setDragOver({y, x});
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragOver && cityGrid) {
        const newSelectedTiles = [];
        const yMin = Math.min(dragStart.y, dragOver.y);
        const yMax = Math.max(dragStart.y, dragOver.y);
        const xMin = Math.min(dragStart.x, dragOver.x);
        const xMax = Math.max(dragStart.x, dragOver.x);

        for (let y = yMin; y <= yMax; y++) {
            for (let x = xMin; x <= xMax; x++) {
                const tile = cityGrid[y][x];
                 if (tile !== '⛰️') {
                    newSelectedTiles.push({ y, x });
                }
            }
        }
        setSelectedTiles(newSelectedTiles);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragOver(null);
  };

  const buildingCounts = useMemo(() => {
    if (!cityGrid) return null;
    const counts = new Map<string, number>();
    for (const row of cityGrid) {
        for (const cell of row) {
            const building = buildingDataMap.get(cell);
            if (building && building.name !== 'Tree' && building.name !== 'Remove' && building.emoji !== '⬛' && building.emoji !== '⛰️') {
                counts.set(cell, (counts.get(cell) || 0) + 1);
            }
        }
    }
    return Array.from(counts.entries())
      .map(([emoji, count]) => ({
          emoji,
          name: buildingDataMap.get(emoji)?.name || 'Unknown',
          count,
      }))
      .sort((a,b) => b.count - a.count);
  }, [cityGrid]);

  const availableBuildings = user ? getBuildingSet(user.profile.totalPoints || 0) : [];

  const filteredBuildings = useMemo(() => {
    if (!tileSearchTerm) return availableBuildings;
    return availableBuildings.filter(building => 
        building.name.toLowerCase().includes(tileSearchTerm.toLowerCase())
    );
  }, [availableBuildings, tileSearchTerm]);

  const cityInfo = user ? getCityInfo(user.profile.totalPoints || 0, cityGrid) : { name: 'Empty Lot', population: 0, totalRevenue: 0, nextUpgrade: 100 };
  const pointsToUpgrade = user && cityInfo.nextUpgrade ? cityInfo.nextUpgrade - (user.profile.totalPoints || 0) : 0;


  if (loading || !data || !user) {
    return (
       <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            </div>
       </main>
    )
  }

  const { pantryItems, foodLogsToday, activityLogsToday, goals, friends } = data;

  const caloriesIn = foodLogsToday.reduce(
    (acc, log) => acc + log.calories,
    0
  );
  const caloriesOut = activityLogsToday.reduce(
    (acc, log) => acc + log.caloriesBurned,
    0
  );
  const calorieGoal = user.profile?.dailyCalorieGoal || 2200;
  const activityGoal = 500; // Example goal for calories out

  const expiringSoonItems = pantryItems
    .map((item) => ({
      ...item,
      daysUntilExpiry: differenceInDays(new Date(item.expirationDate), new Date()),
    }))
    .filter(item => item.daysUntilExpiry >= -1 && item.daysUntilExpiry <= 7)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold font-headline">
        Welcome, {user.name.split(' ')[0]}!
      </h2>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Building />
                Your Fitropolis
            </CardTitle>
            <CardDescription>
                Your city grows as you earn points! Click a tile to customize it, or drag to select multiple tiles.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
             <div 
              className="lg:col-span-2 w-full rounded-lg border bg-muted flex items-center justify-center p-4 overflow-x-auto"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              >
                {cityLoading ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground h-64 justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p>Constructing your glorious city...</p>
                    </div>
                ) : cityGrid ? (
                   <TooltipProvider>
                       <div className="font-mono text-center text-3xl leading-none border-t border-l border-border/50 select-none">
                         {cityGrid.map((row, y) => (
                            <div key={y} className="flex">
                                {row.map((cell, x) => {
                                    const building = buildingDataMap.get(cell);
                                    
                                    const yMin = dragStart && dragOver ? Math.min(dragStart.y, dragOver.y) : -1;
                                    const yMax = dragStart && dragOver ? Math.max(dragStart.y, dragOver.y) : -1;
                                    const xMin = dragStart && dragOver ? Math.min(dragStart.x, dragOver.x) : -1;
                                    const xMax = dragStart && dragOver ? Math.max(dragStart.x, dragOver.x) : -1;

                                    const isSelected = selectedTiles.some(t => t.y === y && t.x === x) || (isDragging && y >= yMin && y <= yMax && x >= xMin && x <= xMax);
                                    
                                    const tileButton = (
                                        <button 
                                            key={x} 
                                            onClick={(e) => handleTileClick(e, y, x)}
                                            onMouseDown={(e) => handleMouseDown(e, y, x)}
                                            onMouseEnter={() => handleMouseEnter(y,x)}
                                            className={cn('flex items-center justify-center h-10 w-10 border-b border-r border-border/20 hover:bg-primary/20 rounded-sm transition-colors', isSelected && 'bg-primary/30 ring-2 ring-primary')}
                                            >
                                            <span>{cell}</span>
                                        </button>
                                    );

                                    if(building?.isResidential && cityGrid) {
                                        const rating = calculateTileRating(y, x, cityGrid);
                                        const grade = getRatingGrade(rating);
                                        const occupancy = calculateOccupancy(rating, building.defaultPopulation!, building.maxPopulation!);
                                        
                                        return (
                                            <Tooltip key={x}>
                                                <TooltipTrigger asChild>{tileButton}</TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-semibold">{building.name}</p>
                                                    <p>Rating: {grade} ({rating})</p>
                                                    <p>Occupants: {occupancy} / {building.maxPopulation}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }
                                    return tileButton;
                                })}
                            </div>
                         ))}
                       </div>
                   </TooltipProvider>
                ) : (
                     <div className="flex flex-col items-center gap-4 text-muted-foreground h-64 justify-center">
                        <Building className="h-12 w-12" />
                        <p>Start earning points to build your city!</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className='font-headline'>City Info</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                   <div className="flex justify-between text-sm">
                      <span className='font-medium text-muted-foreground'>City Size:</span>
                      <span className='font-bold'>{cityInfo.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className='font-medium text-muted-foreground'>Population:</span>
                      <span className='font-bold'>{cityInfo.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className='font-medium text-muted-foreground'>Revenue:</span>
                      <span className='font-bold'>${cityInfo.totalRevenue.toLocaleString()}/day</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">Building Tokens:</span>
                        <span className="font-bold">{(user.profile.buildingTokens || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">Points to Upgrade:</span>
                        {cityInfo.nextUpgrade ? (
                            <span className="font-bold">{pointsToUpgrade > 0 ? pointsToUpgrade.toLocaleString() : 'Ready!'}</span>
                        ) : (
                            <span className="font-bold text-primary">Max Level</span>
                        )}
                    </div>
                </CardContent>
              </Card>

                <Card className={cn("transition-opacity", selectedTiles.length === 0 && 'opacity-50 pointer-events-none')}>
                  <CardHeader>
                      <CardTitle className='font-headline'>Customize Tile</CardTitle>
                      <CardDescription>
                          {selectedTiles.length > 0 ? `Customizing ${selectedTiles.length} tile(s).` : 'Select a tile on the grid to customize.'}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input 
                                  placeholder="Search tiles..."
                                  className="pl-10"
                                  value={tileSearchTerm}
                                  onChange={(e) => setTileSearchTerm(e.target.value)}
                                  disabled={selectedTiles.length === 0}
                              />
                          </div>

                          <div className="flex items-center space-x-2">
                              <Grid3x3 className="h-4 w-4" />
                              <Switch
                                  id="view-mode-switch"
                                  checked={tileView === 'list'}
                                  onCheckedChange={(checked) => setTileView(checked ? 'list' : 'grid')}
                                  disabled={selectedTiles.length === 0}
                              />
                              <List className="h-4 w-4" />
                              <Label htmlFor="view-mode-switch">{tileView === 'list' ? 'List View' : 'Grid View'}</Label>
                          </div>
                      </div>

                      {tileView === 'list' ? (
                          <ScrollArea className="h-96 mt-4">
                              <div className="flex flex-col space-y-2 p-1">
                                  {filteredBuildings.map((building) => (
                                  <Button
                                      key={building.emoji}
                                      variant="outline"
                                      className="flex h-auto justify-start gap-4 p-4 text-left"
                                      onClick={() => handleTileSelect(building)}
                                      disabled={selectedTiles.length === 0 || (user.profile.buildingTokens || 0) < building.cost * selectedTiles.length}
                                  >
                                      <span className="text-3xl">{building.emoji}</span>
                                      <div className="flex-1">
                                      <p className="font-semibold">{building.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                          Cost: {building.cost} tokens
                                      </p>
                                      </div>
                                  </Button>
                                  ))}
                              </div>
                          </ScrollArea>
                      ) : (
                          <ScrollArea className="h-96 mt-4">
                              <div className="grid grid-cols-4 gap-2 p-1">
                                  {filteredBuildings.map((building) => (
                                      <TooltipProvider key={building.emoji}>
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button
                                                      variant="outline"
                                                      className="flex h-20 w-full items-center justify-center text-3xl"
                                                      onClick={() => handleTileSelect(building)}
                                                      disabled={selectedTiles.length === 0 || (user.profile.buildingTokens || 0) < building.cost * selectedTiles.length}
                                                  >
                                                      {building.emoji}
                                                  </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                  <p className="font-semibold">{building.name}</p>
                                                  <p>Cost: {building.cost} tokens</p>
                                              </TooltipContent>
                                          </Tooltip>
                                      </TooltipProvider>
                                  ))}
                              </div>
                          </ScrollArea>
                      )}
                  </CardContent>
              </Card>

              {buildingCounts && buildingCounts.length > 0 && (
                <Card>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className='border-none'>
                            <AccordionTrigger className='p-6'>
                                <CardTitle className='font-headline'>City Census</CardTitle>
                            </AccordionTrigger>
                            <AccordionContent>
                                <CardContent className='space-y-2 max-h-48 overflow-y-auto pt-0'>
                                    {buildingCounts.map(b => (
                                        <div key={b.emoji} className='flex justify-between items-center text-sm'>
                                            <span className='flex items-center gap-2'>
                                                <span className='text-lg'>{b.emoji}</span>
                                                <span>{b.name}</span>
                                            </span>
                                            <span className='font-bold'>{b.count}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
    </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories In</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{caloriesIn}</div>
            <p className="text-xs text-muted-foreground">/ {calorieGoal} kcal</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Out</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{caloriesOut}</div>
            <p className="text-xs text-muted-foreground">/ {activityGoal} kcal</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Done</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{completedGoals.length}/{goals.length}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-2xl font-bold">{user.profile.totalPoints || 0}</div>
            <p className="text-xs text-muted-foreground">points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Goals</CardTitle>
            <CardDescription>
              Your active goals and challenges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {activeGoals.length > 0 ? (
                 activeGoals.map(goal => <GoalProgress key={goal.id} goal={goal} onUpdate={(amount) => handleGoalUpdate(goal, amount)} />)
             ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg">
                    <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 font-semibold">No Active Goals</h3>
                    <p className="text-sm text-muted-foreground mt-1">Visit settings to add a new goal.</p>
                    <Button asChild variant="secondary" size="sm" className="mt-4">
                        <Link href="/settings">Set a Goal</Link>
                    </Button>
                </div>
             )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Friends</CardTitle>
            <CardDescription>
              Your friends' weekly points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {friends.length > 0 ? (
              <ul className="space-y-4">
                {friends.map((friend, index) => (
                  <li
                    key={friend.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-4">{index + 1}</span>
                      <Avatar>
                        <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>{friend.name}</span>
                    </div>
                    <span className="font-bold text-lg">{friend.weeklyPoints.toLocaleString()} pts</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg">
                <Users className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 font-semibold">No Friends Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Add friends to see their progress.</p>
                <Button variant="secondary" size="sm" className="mt-4" disabled>
                    Add Friends
                </Button>
             </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>A summary of your food logs for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {foodLogsToday.length > 0 ? (
                    <ul className="space-y-2">
                        {foodLogsToday.map(log => (
                            <li key={log.id} className="flex justify-between items-center">
                                <span>{log.name}</span>
                                <span className="font-medium text-muted-foreground">{log.calories} kcal</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg">
                        <Apple className="h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-2 font-semibold">No Meals Logged</h3>
                        <p className="text-sm text-muted-foreground mt-1">Log your first meal of the day!</p>
                        <Button asChild variant="secondary" size="sm" className="mt-4">
                            <Link href="/logs?tab=food">Log Meal</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Today's Activities</CardTitle>
                <CardDescription>A summary of your activity logs for today.</CardDescription>
            </CardHeader>
            <CardContent>
                 {activityLogsToday.length > 0 ? (
                    <ul className="space-y-2">
                        {activityLogsToday.map(log => (
                            <li key={log.id} className="flex justify-between items-center">
                                <span>{log.name} ({log.duration} min)</span>
                                <span className="font-medium text-muted-foreground">{log.caloriesBurned} kcal</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg">
                        <Dumbbell className="h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-2 font-semibold">No Activities Logged</h3>
                        <p className="text-sm text-muted-foreground mt-1">Log your first activity of the day!</p>
                        <Button asChild variant="secondary" size="sm" className="mt-4">
                            <Link href="/logs?tab=activity">Log Activity</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
       </div>

       <div className="grid gap-4">
         <Card>
            <CardHeader>
                <CardTitle>Expiring Soon</CardTitle>
                <CardDescription>
                Items from your pantry that are about to expire.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {expiringSoonItems.length > 0 ? (
                <ul className="space-y-2">
                    {expiringSoonItems.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between"
                    >
                        <span>
                        {item.name} ({item.quantity} {item.unit})
                        </span>
                        <Badge variant={item.daysUntilExpiry < 1 ? 'destructive' : 'secondary'}>
                        {item.daysUntilExpiry < 0 ? 'Expired' : item.daysUntilExpiry === 0 ? 'Today' : `in ${item.daysUntilExpiry}d`}
                        </Badge>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground">
                    Nothing is expiring soon. Your pantry is fresh!
                </p>
                )}
            </CardContent>
            </Card>
       </div>
    </main>
  );
}

    

    

    
