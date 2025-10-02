
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
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import type { Goal, FoodLog, ActivityLog, PantryItem, Friend } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateCityScape } from '@/ai/flows/generate-city-scape';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  EMPTY: { emoji: ' ', name: 'Empty' },
  ROAD: { emoji: '➖', name: 'Road' },
  GRASS: { emoji: '🌲', name: 'Tree' },
  POND: { emoji: '💧', name: 'Pond' },
  MOUNTAIN: { emoji: '⛰️', name: 'Mountain' },
  FARMLAND: { emoji: '🌾', name: 'Farmland' },
  SETTLEMENT: [
    { emoji: '🏡', name: 'House' },
    { emoji: '🌳', name: 'Big Tree' },
  ],
  VILLAGE: [
    { emoji: '🏡', name: 'House' },
    { emoji: '🏠', name: 'Family Home' },
  ],
  TOWN: [
    { emoji: '🏠', name: 'Family Home' },
    { emoji: '🏬', name: 'Store' },
  ],
  SMALL_CITY: [
    { emoji: '🏢', name: 'Apartment' },
    { emoji: '🏫', name: 'School' },
    { emoji: '🏭', name: 'Factory' },
  ],
  LARGE_CITY: [
    { emoji: '🏙️', name: 'Skyscraper' },
    { emoji: '🚉', name: 'Train Station' },
  ],
  METROPOLIS: [
    { emoji: '🌃', name: 'City at Night' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '✈️', name: 'Airport' },
  ],
};

const getBuildingSet = (points: number) => {
  let available = [TILES.GRASS, TILES.POND, TILES.MOUNTAIN, ...TILES.SETTLEMENT];
  if (points >= 200) available.push(...TILES.VILLAGE, TILES.FARMLAND);
  if (points >= 400) available.push(...TILES.TOWN);
  if (points >= 600) available.push(...TILES.SMALL_CITY);
  if (points >= 800) available.push(...TILES.LARGE_CITY);
  if (points >= 1000) available.push(...TILES.METROPOLIS);

  // Remove duplicates by emoji
  const uniqueAvailable = available.filter((v,i,a)=>a.findIndex(t=>(t.emoji === v.emoji))===i);

  return uniqueAvailable;
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

const getCityInfo = (points: number) => {
    const tier = getCityLevel(points);
    return {
        name: tier.name,
        population: points * tier.multiplier,
        numberOfHouses: Math.floor(points / 20 * tier.multiplier / 2),
        totalRevenue: points * tier.multiplier * 10,
        nextUpgrade: tier.next,
    };
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [cityGrid, setCityGrid] = useState<string[][] | null>(null);
  const [cityLoading, setCityLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<{y: number, x: number} | null>(null);
  const [isTilePickerOpen, setTilePickerOpen] = useState(false);

  const [data, setData] = useState<{
    pantryItems: PantryItem[],
    foodLogsToday: FoodLog[],
    activityLogsToday: ActivityLog[],
    goals: Goal[],
    friends: Friend[],
  } | null>(null);

  const getCachedGrid = useCallback((level: number) => {
    if (typeof window === 'undefined' || !user) return null;
    const cached = localStorage.getItem(`city-grid-${user.id}-${level}`);
    return cached ? JSON.parse(cached) : null;
  }, [user]);

  const saveGridToCache = useCallback((level: number, grid: string[][]) => {
     if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`city-grid-${user.id}-${level}`, JSON.stringify(grid));
     }
  }, [user]);

  const handleGenerateCity = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    const currentLevel = getCityLevel(user.profile.totalPoints || 0).points;

    if (!forceRefresh) {
        const cachedGrid = getCachedGrid(currentLevel);
        if (cachedGrid) {
        setCityGrid(cachedGrid);
        setCityLoading(false);
        return;
        }
    }

    setCityLoading(true);
    try {
      const result = await generateCityScape({ points: currentLevel });
      setCityGrid(result.grid);
      saveGridToCache(currentLevel, result.grid);
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
        await refreshUser(); // Refresh user to get updated points total
      } else {
        await loadDashboardData();
      }
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

  const handleTileClick = (y: number, x: number) => {
    if (cityGrid && cityGrid[y][x] !== ' ' && cityGrid[y][x] !== '➖') {
      setSelectedTile({y, x});
      setTilePickerOpen(true);
    }
  }

  const handleTileSelect = (newTile: string) => {
    if (selectedTile && cityGrid && user) {
      const newGrid = cityGrid.map(row => [...row]);
      newGrid[selectedTile.y][selectedTile.x] = newTile;
      setCityGrid(newGrid);
      const currentLevel = getCityLevel(user.profile.totalPoints || 0).points;
      saveGridToCache(currentLevel, newGrid);
      setTilePickerOpen(false);
    }
  };

  const availableBuildings = user ? getBuildingSet(user.profile.totalPoints || 0) : [];
  const cityInfo = user ? getCityInfo(user.profile.totalPoints || 0) : { name: 'Empty Lot', population: 0, numberOfHouses: 0, totalRevenue: 0, nextUpgrade: 100 };
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
                Your city grows as you earn points! Click a tile to customize it.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 w-full rounded-lg border bg-muted flex items-center justify-center p-4 overflow-x-auto">
                {cityLoading ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground h-64 justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p>Constructing your glorious city...</p>
                    </div>
                ) : cityGrid ? (
                   <div className="font-mono text-center text-3xl leading-none">
                     {cityGrid.map((row, y) => (
                        <div key={y} className="flex">
                            {row.map((cell, x) => (
                                <button key={x} onClick={() => handleTileClick(y,x)} className='hover:bg-primary/20 rounded-sm transition-colors'>
                                    <span>{cell}</span>
                                </button>
                            ))}
                        </div>
                     ))}
                   </div>
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
                      <span className='font-medium text-muted-foreground'>Houses:</span>
                      <span className='font-bold'>{cityInfo.numberOfHouses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className='font-medium text-muted-foreground'>Revenue:</span>
                      <span className='font-bold'>${cityInfo.totalRevenue.toLocaleString()}/day</span>
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
                            <Link href="/logs?tab=food">Log Meal</Link>
                        </Button>
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
                            <Link href="/logs?tab=activity">Log Activity</Link>
                        </Button>
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

        <Dialog open={isTilePickerOpen} onOpenChange={setTilePickerOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize Tile</DialogTitle>
                </DialogHeader>
                 <TooltipProvider>
                    <div className='grid grid-cols-4 gap-2'>
                        {availableBuildings.map(building => (
                            <Tooltip key={building.emoji}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className='text-3xl h-20'
                                        onClick={() => handleTileSelect(building.emoji)}
                                    >
                                        {building.emoji}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{building.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </DialogContent>
       </Dialog>
    </main>
  );

}
