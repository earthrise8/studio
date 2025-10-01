
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
  updateGoal,
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
  Target
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import type { Goal, FoodLog, ActivityLog, PantryItem } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function GoalProgress({ goal, onUpdate }: { goal: Goal, onUpdate: (amount: number) => void }) {
    const progressPercentage = (goal.progress / goal.target) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <p className={goal.isCompleted ? 'line-through text-muted-foreground' : ''}>{goal.description}</p>
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
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    pantryItems: PantryItem[],
    foodLogsToday: FoodLog[],
    activityLogsToday: ActivityLog[],
    goals: Goal[],
  } | null>(null);

  const loadDashboardData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
      // Refresh user to get updated points total
      await refreshUser(); 
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
         <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Points
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
             <div className="text-2xl font-bold">{user.profile.totalPoints || 0}</div>
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

    
