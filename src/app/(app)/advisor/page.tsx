
'use client';

import { getPersonalizedHealthAdvice } from '@/ai/flows/get-personalized-health-advice';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { addGoal, getGoals, getRecentActivityLogs, getRecentFoodLogs, updateGoal } from '@/lib/data';
import type { Goal } from '@/lib/types';
import { Check, CheckCircle2, Lightbulb, Loader2, Minus, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

type GoalSuggestion = { description: string; target: number; points: number; };
type HealthAdvice = { advice: string; goals: GoalSuggestion[] };


function GoalProgress({ goal, onUpdate }: { goal: Goal, onUpdate: (goal: Goal, amount: number) => void }) {
    const progressPercentage = (goal.progress / goal.target) * 100;
    return (
        <div className="space-y-2 p-4 border rounded-lg">
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
                        onClick={() => onUpdate(goal, -1)}
                        disabled={goal.progress <= 0 || goal.isCompleted}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span>{goal.progress} / {goal.target}</span>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdate(goal, 1)}
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

export default function AdvisorPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [healthGoal, setHealthGoal] = useState(user?.profile?.healthGoal || '');
  const [adviceResult, setAdviceResult] = useState<HealthAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [savingGoal, setSavingGoal] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if(!user) return;
    setGoalsLoading(true);
    const userGoals = await getGoals(user.id);
    setGoals(userGoals);
    setGoalsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchGoals();
        setHealthGoal(user.profile?.healthGoal || '');
    }
  }, [user, fetchGoals]);


  const handleGetAdvice = async () => {
    if (!user || !healthGoal) {
        toast({ variant: 'destructive', title: 'Please enter a health goal.' });
        return;
    }
    setAdviceLoading(true);
    setAdviceResult(null);
    try {
        const [foodLogs, activityLogs] = await Promise.all([
            getRecentFoodLogs(user.id),
            getRecentActivityLogs(user.id)
        ]);

        const foodLogStr = foodLogs.map(l => `${l.name}: ${l.calories}kcal`).join(', ');
        const activityLogStr = activityLogs.map(l => `${l.name}: ${l.duration}min`).join(', ');

        const result = await getPersonalizedHealthAdvice({
            foodLogs: foodLogStr || 'No food logs.',
            activityLogs: activityLogStr || 'No activity logs.',
            healthGoal
        });
        setAdviceResult(result);

    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Error Getting Advice',
            description: 'Something went wrong. Please try again.',
        });
    } finally {
        setAdviceLoading(false);
    }
  }

  const handleSaveGoal = async (goal: GoalSuggestion) => {
    if(!user) return;
    setSavingGoal(goal.description);
    try {
        await addGoal(user.id, {
            ...goal,
            progress: 0,
            isCompleted: false,
        });
        await fetchGoals();
        toast({
            title: 'Goal Saved!',
            description: 'Your new goal has been added to your active goals.',
        });
    } catch(error) {
         toast({
            variant: 'destructive',
            title: 'Error Saving Goal',
            description: 'Could not save the goal. Please try again.',
        });
    } finally {
        setSavingGoal(null);
    }
  }

    const handleGoalUpdate = async (goal: Goal, amount: number) => {
    if (!user) return;

    const newProgress = Math.max(0, goal.progress + amount);
    const isNowCompleted = newProgress >= goal.target;
    
    const updatedGoal: Goal = {
      ...goal,
      progress: newProgress,
      isCompleted: isNowCompleted,
    };
    
    // Optimistically update UI
    const originalGoals = goals;
    setGoals(currentGoals => currentGoals.map(g => g.id === goal.id ? updatedGoal : g));

    try {
      await updateGoal(user.id, updatedGoal);
      if (updatedGoal.isCompleted && !goal.isCompleted) {
        toast({
          title: "Goal Complete!",
          description: `You've achieved: ${goal.description} and earned ${goal.points} points!`,
          action: <Button asChild variant="secondary"><Link href="/awards">View Awards</Link></Button>
        });
      }
      await refreshUser();
      // Refetch to ensure state is accurate
      await fetchGoals();
    } catch (e) {
      // Revert if error
      setGoals(originalGoals);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your goal progress.',
      });
    }
  }

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">
        Goals
      </h2>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Target /> AI Goal Generator</CardTitle>
            <CardDescription>
              Get personalized health advice and generate actionable goals based on your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="healthGoal">Your Health Goal</Label>
              <Input
                id="healthGoal"
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                placeholder="e.g., Lose 5 pounds in a month"
              />
            </div>
            <Button onClick={handleGetAdvice} disabled={adviceLoading}>
              {adviceLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Advice & Goals
            </Button>
             <div className="mt-6 space-y-4">
                {adviceLoading && <Skeleton className="h-40 w-full" />}
                {adviceResult && (
                    <>
                    <Card>
                        <CardHeader><CardTitle>Personalized Advice</CardTitle></CardHeader>
                        <CardContent><p>{adviceResult.advice}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Suggested Goals</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {adviceResult.goals.map((goal, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-md border">
                                        <div className="flex items-start gap-2">
                                            <Check className="mt-1 h-4 w-4 text-primary" />
                                            <span>{goal.description} (Target: {goal.target}) - {goal.points} pts</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSaveGoal(goal)}
                                            disabled={savingGoal === goal.description}
                                        >
                                            {savingGoal === goal.description ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-4 w-4" />
                                            )}
                                            Save Goal
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    </>
                )}
             </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className='font-headline'>Your Goals</CardTitle>
                <CardDescription>Track and manage your active and completed goals.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="active">
                    <TabsList>
                        <TabsTrigger value="active">Active Goals</TabsTrigger>
                        <TabsTrigger value="completed">Completed Goals</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="space-y-4 pt-4">
                        {goalsLoading ? (
                           [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : activeGoals.length > 0 ? (
                            activeGoals.map(goal => <GoalProgress key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-2 font-semibold">No Active Goals</h3>
                                <p className="text-sm text-muted-foreground mt-1">Use the AI Goal Generator above to set new goals.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="completed" className="space-y-4 pt-4">
                       {goalsLoading ? (
                           [...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                        ) : completedGoals.length > 0 ? (
                             completedGoals.map(goal => <GoalProgress key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
                                <Target className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-2 font-semibold">No Completed Goals Yet</h3>
                                <p className="text-sm text-muted-foreground mt-1">Keep working on your active goals to see them here!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

      </div>
    </main>
  );
}
