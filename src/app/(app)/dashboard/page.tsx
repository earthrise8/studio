'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  getActivityLogs,
  getFoodLogs,
  getPantryItems,
  getGoals,
} from '@/lib/data';
import {
  Apple,
  Flame,
  PlusCircle,
  Dumbbell,
  Lightbulb,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import type { Goal, FoodLog, ActivityLog, PantryItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function GoalProgress({ goal }: { goal: Goal }) {
    const progressPercentage = (goal.progress / goal.target) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <p>{goal.description}</p>
                <p className="font-medium">{goal.progress} / {goal.target}</p>
            </div>
            <Progress value={progressPercentage} />
        </div>
    )
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    pantryItems: PantryItem[],
    foodLogsToday: FoodLog[],
    activityLogsToday: ActivityLog[],
    goals: Goal[],
  } | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      
      setLoading(true);
      const todayStr = formatISO(new Date(), { representation: 'date' });

      const [
        pantryItems,
        foodLogsToday,
        activityLogsToday,
        goals,
      ] = await Promise.all([
        getPantryItems(user.id),
        getFoodLogs(user.id, todayStr),
        getActivityLogs(user.id, todayStr),
        getGoals(user.id),
      ]);

      setData({ pantryItems, foodLogsToday, activityLogsToday, goals });
      setLoading(false);
    }
    loadDashboardData();
  }, [user]);

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

  const { pantryItems, foodLogsToday, activityLogsToday, goals } = data;

  const caloriesIn = foodLogsToday.reduce(
    (acc, log) => acc + log.calories,
    0
  );
  const caloriesOut = activityLogsToday.reduce(
    (acc, log) => acc + log.caloriesBurned,
    0
  );
  const calorieGoal = user.profile?.dailyCalorieGoal || 2200;

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
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Welcome, {user.name.split(' ')[0]}!
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Today&apos;s Summary</CardTitle>
            <CardDescription>
              Your progress towards your daily calorie goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>{caloriesIn}</span>
              <span>{calorieGoal} kcal</span>
            </div>
            <Progress value={(caloriesIn / calorieGoal) * 100} />
            <p className="text-sm text-muted-foreground">
              You have{' '}
              <span className="font-bold text-foreground">
                {Math.max(0, calorieGoal - caloriesIn)}
              </span>{' '}
              calories remaining.
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories In</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <div className="text-2xl font-bold">{caloriesIn} kcal</div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calories Out
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <div className="text-2xl font-bold">{caloriesOut} kcal</div>
          </CardContent>
        </Card>
         <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Goals
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
             <div className="text-2xl font-bold">{completedGoals.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Your Goals</CardTitle>
            <CardDescription>
              Your active goals and challenges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {activeGoals.length > 0 ? (
                 activeGoals.map(goal => <GoalProgress key={goal.id} goal={goal} />)
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
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Expiring Soon</CardTitle>
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
