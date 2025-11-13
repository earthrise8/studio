

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
  CheckCircle2,
  Dumbbell,
  Lightbulb,
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
  TrendingUp,
  TrendingDown,
  Info,
  Home,
  DollarSign,
  ShieldCheck,
  CalendarDays,
  Globe,
  Leaf,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import type { Goal, FoodLog, ActivityLog, PantryItem, Friend } from '@/lib/types';
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
import { getBuildingSet, allBuildings, buildingDataMap, getCityInfo, TILES } from '@/lib/city-data';
import { Progress } from '@/components/ui/progress';


function GoalProgress({ goal, onUpdate }: { goal: Goal, onUpdate: (amount: number) => void }) {
    const progressPercentage = (goal.progress / goal.target) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <div className='flex-1'>
                    <p className={goal.isCompleted ? 'line-through text-muted-foreground' : ''}>{goal.description}</p>
                    <p className='text-xs text-muted-foreground'>Reward: {goal.points}pts</p>
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
            <Progress value={progressPercentage} />
        </div>
    )
}

export default function DashboardPage() {
  const { user, refreshUser, setUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [cityGrid, setCityGrid] = useState<string[][] | null>(null);
  const [cityLoading, setCityLoading] = useState(true);
  const [permanentRoads, setPermanentRoads] = useState<{y: number, x:number}[]>([]);
  const [permanentRiverEnds, setPermanentRiverEnds] = useState<{y: number, x:number}[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<{y: number, x: number}[]>([]);
  const [tileView, setTileView] = useState<'grid' | 'list'>('grid');
  const [tileSearchTerm, setTileSearchTerm] = useState('');
  const [inGameDay, setInGameDay] = useState(1);
  const [isCityVisible, setIsCityVisible] = useState(true);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{y: number, x: number} | null>(null);
  const [dragOver, setDragOver] = useState<{y: number, x: number} | null>(null);
  
  // Hover highlight state
  const [hoveredTile, setHoveredTile] = useState<{y: number, x: number} | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<{y: number, x: number, type: 'positive' | 'negative' | 'area-positive' | 'area-negative'}[]>([]);
  const [hoveredCensusEmoji, setHoveredCensusEmoji] = useState<string | null>(null);


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

  const findPermanentRoads = (grid: string[][]): {y: number, x:number}[] => {
    const height = grid.length;
    if (height === 0) return [];
    const width = grid[0].length;
    if(width === 0) return [];

    let roadEnds: {y: number, x:number}[] = [];

    // Check for a horizontal road spanning the whole width
    for (let y = 0; y < height; y++) {
        let isFullRoad = true;
        for (let x = 0; x < width; x++) {
            if (grid[y][x] !== TILES.ROAD.emoji) {
                isFullRoad = false;
                break;
            }
        }
        if (isFullRoad) {
            roadEnds.push({y, x: 0}, {y, x: width - 1});
            return roadEnds;
        }
    }

    // Check for a vertical road spanning the whole height
    for (let x = 0; x < width; x++) {
       let isFullRoad = true;
        for (let y = 0; y < height; y++) {
            if (grid[y][x] !== TILES.ROAD.emoji) {
                isFullRoad = false;
                break;
            }
        }
        if (isFullRoad) {
            roadEnds.push({y: 0, x}, {y: height - 1, x});
            return roadEnds;
        }
    }

    return [];
  };

  const findPermanentRiverEnds = (grid: string[][]): { y: number, x: number }[] => {
    const height = grid.length;
    if (height === 0) return [];
    const width = grid[0].length;
    if (width === 0) return [];
    
    let riverEnds: { y: number, x: number }[] = [];

    // Scan edges for river tiles
    for (let y = 0; y < height; y++) {
        if (grid[y][0] === TILES.POND.emoji) riverEnds.push({ y, x: 0 });
        if (grid[y][width - 1] === TILES.POND.emoji) riverEnds.push({ y, x: width - 1 });
    }
    for (let x = 1; x < width - 1; x++) {
        if (grid[0][x] === TILES.POND.emoji) riverEnds.push({ y: 0, x });
        if (grid[height - 1][x] === TILES.POND.emoji) riverEnds.push({ y: height - 1, x });
    }
    return riverEnds;
};

  const handleGenerateCity = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    if (!forceRefresh) {
        const cachedGrid = getCachedGrid();
        if (cachedGrid) {
            setCityGrid(cachedGrid);
            setPermanentRoads(findPermanentRoads(cachedGrid));
            setPermanentRiverEnds(findPermanentRiverEnds(cachedGrid));
            setCityLoading(false);
            return;
        }
    }

    setCityLoading(true);
    try {
      const result = await generateCityScape({ points: user.profile.totalPoints || 0 });
      setCityGrid(result.grid);
      setPermanentRoads(findPermanentRoads(result.grid));
      setPermanentRiverEnds(findPermanentRiverEnds(result.grid));
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
  
  const { cityInfo, buildingCounts } = useMemo(() => {
    if (!cityGrid || !user) return { cityInfo: null, buildingCounts: null };

    const { cityInfo: info, buildingCounts: counts } = getCityInfo(user.profile.totalPoints || 0, cityGrid);
    
    return { cityInfo: info, buildingCounts: counts };
  }, [cityGrid, user]);
  
    const isAdjacentToWater = (y: number, x: number, grid: string[][], distance: number): boolean => {
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          const tile = buildingDataMap.get(grid[i][j]);
          if (tile && tile.name === 'Pond') { // Pond or River
            const dist = Math.abs(i - y) + Math.abs(j - x); // Manhattan distance
            if (dist <= distance) {
              return true;
            }
          }
        }
      }
      return false;
    };

  useEffect(() => {
    if (user && cityInfo) {
      const lastUpdateKey = `last-revenue-update-${user.id}`;
      const lastUpdate = localStorage.getItem(lastUpdateKey);
      const now = new Date().getTime();
      let moneyToCollect = 0;
      let gridToUpdate: string[][] | null = null;
      let decayedCount = 0;
      let daysPassed = 0;

      if (lastUpdate) {
        const lastUpdateTime = parseInt(lastUpdate, 10);
        // 1 hour in real time is 1 day in game time
        const hoursPassed = (now - lastUpdateTime) / (1000 * 60 * 60); 
        daysPassed = Math.floor(hoursPassed);

        if (daysPassed > 0) {
          moneyToCollect = daysPassed * Math.floor(cityInfo.netRevenue);

          // Farmland decay logic
          const currentGrid = getCachedGrid();
          if (currentGrid) {
            gridToUpdate = JSON.parse(JSON.stringify(currentGrid));
            // Apply decay for each day that passed
            for (let day = 0; day < daysPassed; day++) {
                let dailyDecay = 0;
                let tempGrid = JSON.parse(JSON.stringify(gridToUpdate)); // Work on a copy for this day's check
                for (let y = 0; y < tempGrid.length; y++) {
                    for (let x = 0; x < tempGrid[y].length; x++) {
                        const tile = buildingDataMap.get(tempGrid[y][x]);
                        if (tile?.isFarmland) {
                            if (!isAdjacentToWater(y, x, tempGrid, 3)) {
                                const leaflessTree = allBuildings.find(b => b.name === 'Leafless Tree');
                                if(leaflessTree) {
                                    gridToUpdate![y][x] = leaflessTree.emoji; // Apply decay to the main grid for this loop
                                    dailyDecay++;
                                }
                            }
                        }
                    }
                }
                decayedCount += dailyDecay;
            }

            if (decayedCount > 0) {
              setCityGrid(gridToUpdate);
              saveGridToCache(gridToUpdate!);
              toast({
                  variant: 'destructive',
                  title: 'Farmland Withered',
                  description: `${decayedCount} farmland plot(s) withered due to lack of water.`
              });
            }
          }
        }
      }

      if (moneyToCollect > 0) {
        const newTotalMoney = (user.profile.money || 0) + moneyToCollect;
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            money: newTotalMoney,
          }
        };
        setUser(updatedUser);
        updateUserProfile(user.id, { profile: { money: newTotalMoney } });
        localStorage.setItem(lastUpdateKey, now.toString());
        toast({
          title: 'Offline Revenue Collected!',
          description: `Your city earned $${moneyToCollect.toLocaleString()} while you were away for ${daysPassed} day(s).`,
        });
      } else if (!lastUpdate) {
        localStorage.setItem(lastUpdateKey, now.toString());
      }
    }
  }, [user, cityInfo, setUser, toast, getCachedGrid, saveGridToCache]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      handleGenerateCity();
      
      const gameStartDateKey = `game-start-date-${user.id}`;
      let gameStartDate = localStorage.getItem(gameStartDateKey);
      if (!gameStartDate) {
        gameStartDate = new Date().toISOString();
        localStorage.setItem(gameStartDateKey, gameStartDate);
      }
      const hoursPassed = (new Date().getTime() - new Date(gameStartDate).getTime()) / (1000 * 60 * 60);
      setInGameDay(Math.floor(hoursPassed / 1) + 1); // 1 hour = 1 day
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
      // Regardless of completion, refresh user to get latest points and money
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
  
  const isAdjacentToTile = (y: number, x: number, grid: string[][], tileEmoji: string): boolean => {
    const neighbors = [
        {dy: -1, dx: 0}, // up
        {dy: 1, dx: 0},  // down
        {dy: 0, dx: -1}, // left
        {dy: 0, dx: 1}   // right
    ];
    for (const {dy, dx} of neighbors) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && grid[ny][nx] === tileEmoji) {
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

  const handleTileSelect = async (building: { emoji: string; name: string; cost: number, isFarmland?: boolean; }) => {
    if (selectedTiles.length === 0 || !cityGrid || !user) return;

    for (const tile of selectedTiles) {
        if(permanentRoads.some(pr => pr.x === tile.x && pr.y === tile.y)) {
            toast({
                variant: 'destructive',
                title: 'Cannot Build Here',
                description: 'This part of the main road cannot be changed.',
            });
            return;
        }
        if(permanentRiverEnds.some(pr => pr.x === tile.x && pr.y === tile.y)) {
            toast({
                variant: 'destructive',
                title: 'Cannot Build Here',
                description: 'The start and end points of a river cannot be removed.',
            });
            return;
        }
    }

    // --- Validation Logic ---
    const exemptFromRoadRule = [
      'Tree', 'Big Tree', 'Pond', 'Farmland', 'Tent', 'Remove',
      'Sunflower Field', 'Palm Tree', 'Cactus', 'Leafless Tree', 'Leaf',
      'Volcano', 'National Park', 'Mountain'
    ];

    if (building.emoji === TILES.ROAD.emoji) {
        const isAnyTileAdjacentToRoad = selectedTiles.some(tile => isAdjacentToTile(tile.y, tile.x, cityGrid, TILES.ROAD.emoji));
        if (!isAnyTileAdjacentToRoad) {
            toast({
                variant: 'destructive',
                title: 'Invalid Road Placement',
                description: 'At least one road tile must be connected to an existing road.',
            });
            return;
        }
    } else if (building.emoji === TILES.POND.emoji) {
        const isAnyTileAdjacentToWater = selectedTiles.some(tile => isAdjacentToTile(tile.y, tile.x, cityGrid, TILES.POND.emoji));
        if (!isAnyTileAdjacentToWater) {
            toast({
                variant: 'destructive',
                title: 'Invalid River Placement',
                description: 'At least one river tile must be connected to an existing river.',
            });
            return;
        }
    } else if (building.isFarmland) {
      for (const tile of selectedTiles) {
        if (!isAdjacentToWater(tile.y, tile.x, cityGrid, 3)) {
          toast({
            variant: 'destructive',
            title: 'Invalid Farmland Placement',
            description: `Farmland at (${tile.x}, ${tile.y}) must be within 3 tiles of water.`,
          });
          return;
        }
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

    const currentMoney = user.profile.money || 0;
    
    let totalNetCost = 0;

    for(const tile of selectedTiles) {
        let moneyToRefund = 0;
        const existingEmoji = cityGrid[tile.y][tile.x];
        const replacedBuilding = allBuildings.find(b => b.emoji === existingEmoji);

        if (replacedBuilding && (building.name === 'Remove' || building.name === 'Tree')) {
            if (replacedBuilding.emoji === TILES.ROAD.emoji) {
                 moneyToRefund = replacedBuilding.cost / 2; // Refund half for roads
            } else if (replacedBuilding.emoji !== TILES.POND.emoji) {
                moneyToRefund = replacedBuilding.cost; // Full refund for most buildings
            }
            // No refund for removing a Pond
        }
        
        let placementCost = building.cost;
        if(existingEmoji === TILES.POND.emoji && building.name === 'Remove') {
            // Cost to remove a river tile is the same as placing it
            placementCost = TILES.POND.cost;
        }

        totalNetCost += (placementCost - moneyToRefund);
    }
    
    if (currentMoney < totalNetCost) {
      toast({
          variant: 'destructive',
          title: 'Not enough money!',
          description: `You need $${totalNetCost.toLocaleString()} for this action, but you only have $${currentMoney.toLocaleString()}.`,
      });
      return;
    }

    const newGrid = cityGrid.map(row => [...row]);
    selectedTiles.forEach(tile => {
        newGrid[tile.y][tile.x] = building.emoji;
    });

    setCityGrid(newGrid);

    const newTotalMoney = currentMoney - totalNetCost;
    
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        money: newTotalMoney,
      }
    };
    setUser(updatedUser);

    try {
      await updateUserProfile(user.id, { profile: { money: newTotalMoney } });
      saveGridToCache(newGrid);
      
      toast({
          title: 'City Updated!',
          description: `Placed ${selectedTiles.length} "${building.name}" tile(s) for a net cost of $${totalNetCost.toLocaleString()}.`,
      });

      await refreshUser();

    } catch (error) {
      setCityGrid(cityGrid); // Revert grid on error
      setUser(user); // Revert user money on error
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

  const handleMouseEnterTile = (y: number, x: number) => {
    if (isDragging) {
      setDragOver({y, x});
    }
    
    if (!cityGrid) return;
    const building = buildingDataMap.get(cityGrid[y][x]);
    const highlights: {y: number, x: number, type: 'positive' | 'negative' | 'area-positive' | 'area-negative'}[] = [];

    if (building?.isResidential) {
        // Hovering over residential: highlight sources
        for (let i = 0; i < cityGrid.length; i++) {
            for (let j = 0; j < cityGrid[i].length; j++) {
                const sourceBuilding = buildingDataMap.get(cityGrid[i][j]);
                if (!sourceBuilding) continue;

                const distance = Math.abs(i - y) + Math.abs(j - x);
                if (sourceBuilding.ratingBonus && sourceBuilding.ratingRange && distance <= sourceBuilding.ratingRange) {
                    highlights.push({ y: i, x: j, type: 'positive' });
                }
                if (sourceBuilding.ratingPenalty && sourceBuilding.ratingRange && distance <= sourceBuilding.ratingRange) {
                    highlights.push({ y: i, x: j, type: 'negative' });
                }
            }
        }
    } else if (building?.ratingBonus || building?.ratingPenalty) {
        // Hovering over amenity/nuisance: highlight affected area
        const range = building.ratingRange || 0;
        const type = building.ratingBonus ? 'area-positive' : 'area-negative';
        for (let i = y - range; i <= y + range; i++) {
            for (let j = x - range; j <= x + range; j++) {
                if (i >= 0 && i < cityGrid.length && j >= 0 && j < cityGrid[0].length) {
                    const distance = Math.abs(i - y) + Math.abs(j - x);
                    if (distance <= range) {
                        highlights.push({ y: i, x: j, type });
                    }
                }
            }
        }
    }
    setHighlightedCells(highlights);
  };
  
  const handleMouseLeaveGrid = () => {
    if (isDragging) return; // Don't clear highlights while dragging
    setHighlightedCells([]);
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



  const availableBuildings = user ? getBuildingSet(user.profile.totalPoints || 0) : [];

  const filteredBuildings = useMemo(() => {
    if (!tileSearchTerm) return availableBuildings;
    return availableBuildings.filter(building => 
        building.name.toLowerCase().includes(tileSearchTerm.toLowerCase())
    );
  }, [availableBuildings, tileSearchTerm]);

  if (!user) {
    return (
       <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
       </main>
    )
  }

  const cityInfoForLoading = cityInfo || getCityInfo(user.profile.totalPoints || 0, null).cityInfo;


  if (loading || !data || !cityInfo) {
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
  const pointsToUpgrade = cityInfo.nextUpgrade ? cityInfo.nextUpgrade - (user.profile.totalPoints || 0) : 0;


  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold font-headline">
        Welcome, {user.name.split(' ')[0]}!
      </h2>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Building />
                    {user.profile.cityName || 'Your Fitropolis'}
                </CardTitle>
                {isCityVisible && (
                    <CardDescription>
                        Your city grows as you earn points! Click a tile to customize it, or drag to select multiple tiles.
                    </CardDescription>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="city-visibility"
                    checked={isCityVisible}
                    onCheckedChange={setIsCityVisible}
                />
                <Label htmlFor="city-visibility" className="flex items-center gap-2">
                    {isCityVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                     <span className="hidden sm:inline">{isCityVisible ? 'Show' : 'Hide'} City</span>
                </Label>
            </div>
        </CardHeader>
        {isCityVisible && (
            <CardContent className="space-y-4">
            <Card>
                <CardContent className='pt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 text-center'>
                <div>
                    <CardTitle className='text-lg font-headline flex items-center justify-center gap-2'><Building className='h-5 w-5' /> City Size</CardTitle>
                    <p className='text-md font-bold text-primary'>{cityInfo.name}</p>
                </div>
                <div>
                    <CardTitle className='text-lg font-headline flex items-center justify-center gap-2'><Globe className='h-5 w-5' /> Population</CardTitle>
                    <p className='text-md font-bold text-primary'>{cityInfo.population.toLocaleString()}</p>
                </div>
                <div>
                    <CardTitle className='text-lg font-headline flex items-center justify-center gap-2'><CalendarDays className='h-5 w-5' /> In-Game Time</CardTitle>
                    <p className='text-md font-bold text-primary'>Day {inGameDay}</p>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-headline"><Leaf className='h-5 w-5' /> Eco Score</div>
                    <p className='text-md font-bold'>{cityInfo.ecoScore}</p>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-headline"><DollarSign className='h-5 w-5' /> Revenue</div>
                    <p className='text-md font-bold'>${Math.floor(cityInfo.netRevenue).toLocaleString()}/day</p>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-headline"><DollarSign className='h-5 w-5' /> Money</div>
                    <p className="text-md font-bold">${(user.profile.money || 0).toLocaleString()}</p>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-headline"><Trophy className='h-5 w-5' /> Next Upgrade</div>
                    {cityInfo.nextUpgrade ? (
                        <p className="text-md font-bold">{pointsToUpgrade > 0 ? `${pointsToUpgrade.toLocaleString()} pts` : 'Ready!'}</p>
                    ) : (
                        <p className="text-md font-bold text-primary">Max Level</p>
                    )}
                </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                <div 
                className="lg:col-span-2 w-full rounded-lg border bg-muted flex items-center justify-center p-4 overflow-x-auto"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeaveGrid}
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
                                        const highlight = highlightedCells.find(h => h.y === y && h.x === x);
                                        const isPermanentRoad = permanentRoads.some(pr => pr.x === x && pr.y === y);
                                        const isPermanentRiver = permanentRiverEnds.some(pr => pr.x === x && pr.y === y);
                                        const isHoveredCensus = hoveredCensusEmoji === cell;
                                        
                                        const tileButton = (
                                            <button 
                                                key={x} 
                                                onClick={(e) => handleTileClick(e, y, x)}
                                                onMouseDown={(e) => handleMouseDown(e, y, x)}
                                                onMouseEnter={() => handleMouseEnterTile(y,x)}
                                                className={cn(
                                                    'relative flex items-center justify-center h-10 w-10 border-b border-r border-border/20 hover:bg-primary/20 rounded-sm transition-colors', 
                                                    isSelected && 'bg-primary/30 ring-2 ring-primary',
                                                    isHoveredCensus && 'bg-blue-500/30 ring-2 ring-blue-400',
                                                    highlight?.type === 'positive' && 'ring-2 ring-blue-500 bg-blue-500/20',
                                                    highlight?.type === 'negative' && 'ring-2 ring-red-500 bg-red-500/20',
                                                    (isPermanentRoad || isPermanentRiver) && 'cursor-not-allowed'
                                                )}
                                                >
                                                <span className={cn(
                                                    highlight?.type === 'area-positive' && 'outline outline-2 outline-blue-500 outline-offset-[-2px] rounded-sm',
                                                    highlight?.type === 'area-negative' && 'outline outline-2 outline-red-500 outline-offset-[-2px] rounded-sm'
                                                )}>{cell}</span>
                                                {(isPermanentRoad || isPermanentRiver) && <div className="absolute inset-0 bg-black/30" />}
                                            </button>
                                        );

                                        let tooltipContent: React.ReactNode = null;
                                        
                                        if (isPermanentRoad) {
                                            tooltipContent = <p className="font-semibold">Main Road (Permanent)</p>;
                                        } else if(isPermanentRiver) {
                                            tooltipContent = <p className="font-semibold">River End (Permanent)</p>;
                                        } else if (cityGrid && cityInfo && building?.isResidential) {
                                            const { rating, grade, occupancy } = getCityInfo(user.profile.totalPoints || 0, cityGrid, y, x).tileInfo!;

                                            tooltipContent = <>
                                                <p className="font-semibold">{building.name}</p>
                                                <p>Rating: {grade} ({rating})</p>
                                                <p>Occupants: {occupancy} / {building.maxPopulation}</p>
                                            </>;
                                        } else if (cityGrid && cityInfo && building?.revenueMultiplier) {
                                            const revenue = (building.cost * building.revenueMultiplier * (cityInfo.population / 100));
                                            tooltipContent = <>
                                                <p className="font-semibold">{building.name}</p>
                                                <p>Daily Revenue: ${Math.floor(revenue).toLocaleString()}</p>
                                            </>
                                        } else if (cityGrid && cityInfo && building?.isPublicService) {
                                            const cost = (building.maintenanceCostPerCitizen! * cityInfo.population);
                                            tooltipContent = <>
                                                <p className="font-semibold">{building.name}</p>
                                                <p>Daily Cost: ${Math.floor(cost).toLocaleString()}</p>
                                            </>
                                        } else if (cityGrid && cityInfo && building?.isFarmland) {
                                            const plot = cityInfo.farmlandPlots.find(p => p.tiles.some(t => t.y === y && t.x === x));
                                            if(plot) {
                                                const revenuePerTile = plot.revenue / plot.size;
                                                tooltipContent = <>
                                                    <p className="font-semibold">{building.name}</p>
                                                    <p>Daily Revenue: ${Math.floor(revenuePerTile).toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">Part of a {plot.size}-tile plot</p>
                                                </>
                                            }
                                        }

                                        if (tooltipContent) {
                                            return (
                                                <Tooltip key={x}>
                                                    <TooltipTrigger asChild>{tileButton}</TooltipTrigger>
                                                    <TooltipContent>
                                                        {tooltipContent}
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
                        <CardTitle className='font-headline'>Customize Tile</CardTitle>
                        <CardDescription>
                            {selectedTiles.length > 0 ? `Customizing ${selectedTiles.length} tile(s).` : 'Select a tile on the grid to customize.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className={cn("transition-opacity", selectedTiles.length === 0 && 'opacity-50 pointer-events-none')}>
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
                                <Accordion type="single" collapsible className="w-full">
                                    {filteredBuildings.map((building) => (
                                    <AccordionItem value={building.name} key={building.name}>
                                        <div className="flex items-center justify-between py-1 pr-4">
                                            <AccordionTrigger className='flex-1 p-0 hover:no-underline disabled:opacity-50' disabled={selectedTiles.length === 0 || (user.profile.money || 0) < building.cost * selectedTiles.length}>
                                                <div className='flex items-center gap-4 text-left w-full'>
                                                    <span className="text-3xl p-4">{building.emoji}</span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{building.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Cost: ${building.cost.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <Button
                                                size="sm"
                                                className="ml-4"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTileSelect(building);
                                                }}
                                                disabled={selectedTiles.length === 0 || (user.profile.money || 0) < building.cost * selectedTiles.length}
                                            >
                                                Build
                                            </Button>
                                        </div>
                                        <AccordionContent className='text-xs text-muted-foreground ml-4'>
                                            <div className='p-4 border-t space-y-2'>
                                                {building.isResidential && (
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-3 w-3" />
                                                        <span>Residential: Pop. {building.defaultPopulation}-{building.maxPopulation}</span>
                                                    </div>
                                                )}
                                                {building.revenueMultiplier && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>Commercial: Earns revenue based on population.</span>
                                                    </div>
                                                )}
                                                {building.isFarmland && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>Special Commercial: Generates income in large plots.</span>
                                                    </div>
                                                )}
                                                {building.isPublicService && (
                                                    <div className="flex items-center gap-2 text-yellow-500">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        <span>Public Service: Costs ${building.maintenanceCostPerCitizen} per citizen. Increases rating by +{building.ratingBonus} in a {building.ratingRange}-tile radius.</span>
                                                    </div>
                                                )}
                                                {building.ratingBonus && !building.isPublicService && (
                                                    <div className="flex items-center gap-2 text-green-500">
                                                        <TrendingUp className="h-3 w-3" />
                                                        <span>Amenity: Increases rating by +{building.ratingBonus} in a {building.ratingRange}-tile radius.</span>
                                                    </div>
                                                )}
                                                {building.ratingPenalty && (
                                                    <div className="flex items-center gap-2 text-red-500">
                                                        <TrendingDown className="h-3 w-3" />
                                                        <span>Nuisance: Decreases rating by {building.ratingPenalty} in a {building.ratingRange}-tile radius.</span>
                                                    </div>
                                                )}
                                                {!building.isResidential && !building.revenueMultiplier && !building.isPublicService && !building.ratingBonus && !building.ratingPenalty && !building.isFarmland && building.name !== 'Road' && building.name !== 'Remove' && (
                                                    <div className="flex items-center gap-2">
                                                        <Info className="h-3 w-3" />
                                                        <span>Decorative or special-purpose tile.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    ))}
                                </Accordion>
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
                                                        disabled={selectedTiles.length === 0 || (user.profile.money || 0) < building.cost * selectedTiles.length}
                                                    >
                                                        {building.emoji}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-semibold">{building.name}</p>
                                                    <p>Cost: ${building.cost.toLocaleString()}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                {buildingCounts && cityInfo && (
                    <Accordion type="single" collapsible className="w-full" asChild>
                        <Card>
                        <AccordionItem value="item-1" className='border-0'>
                            <CardHeader>
                                <AccordionTrigger className='p-0 font-headline text-lg hover:no-underline'>
                                    City Census
                                </AccordionTrigger>
                            </CardHeader>
                            <AccordionContent>
                                <CardContent className='pt-0'>
                                    <div className='space-y-2 max-h-48 overflow-y-auto' onMouseLeave={() => setHoveredCensusEmoji(null)}>
                                        {buildingCounts.map(b => (
                                            <div 
                                                key={b.emoji} 
                                                className='flex justify-between items-center text-sm p-1 rounded-md'
                                                onMouseEnter={() => setHoveredCensusEmoji(b.emoji)}
                                            >
                                                <span className='flex items-center gap-2'>
                                                    <span className='text-lg'>{b.emoji}</span>
                                                    <span>{b.name}</span>
                                                </span>
                                                <div className="text-right">
                                                    <span className='font-bold'>{b.count}</span>
                                                    {b.totalRevenue > 0 && (
                                                        <p className="text-xs text-green-500">${Math.floor(b.totalRevenue).toLocaleString()}</p>
                                                    )}
                                                    {b.totalCost > 0 && (
                                                        <p className="text-xs text-red-500">-${Math.floor(b.totalCost).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className='flex justify-between items-center text-sm pt-2 border-t'>
                                            <span className='flex items-center gap-2'>
                                            <Leaf className='h-4 w-4' />
                                            <span>Eco Bonus/Penalty</span>
                                            </span>
                                            <div className="text-right">
                                                <p className={cn("text-sm font-bold", cityInfo.ecoBonus >= 0 ? "text-green-500" : "text-red-500")}>
                                                    ${Math.floor(cityInfo.ecoBonus).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </AccordionContent>
                        </AccordionItem>
                        </Card>
                    </Accordion>
                )}

                </div>
            </div>
            </CardContent>
        )}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Goals</CardTitle>
              <CardDescription>
                Your active goals and challenges.
              </CardDescription>
            </div>
            <Button asChild variant="secondary" size="sm">
                <Link href="/advisor">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    AI Goals
                </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {activeGoals.length > 0 ? (
                 activeGoals.map(goal => <GoalProgress key={goal.id} goal={goal} onUpdate={(amount) => handleGoalUpdate(goal, amount)} />)
             ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg">
                    <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 font-semibold">No Active Goals</h3>
                    <p className="text-sm text-muted-foreground mt-1">Visit the Goals page to generate new goals.</p>
                    <Button asChild variant="secondary" size="sm" className="mt-4">
                        <Link href="/advisor">Set Goals</Link>
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

    
