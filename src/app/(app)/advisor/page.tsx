
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { addGoal, getRecentActivityLogs, getRecentFoodLogs } from '@/lib/data';
import { Check, Lightbulb, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type GoalSuggestion = { description: string, target: number };
type HealthAdvice = { advice: string, goals: GoalSuggestion[] };

export default function AdvisorPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [healthGoal, setHealthGoal] = useState(user?.profile?.healthGoal || '');
  const [adviceResult, setAdviceResult] = useState<HealthAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [savingGoal, setSavingGoal] = useState<string | null>(null);


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
        toast({
            title: 'Goal Saved!',
            description: 'Your new goal has been added to your dashboard.',
            action: <Button asChild variant="secondary"><Link href="/dashboard">View Dashboard</Link></Button>
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

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">
        AI Advisor
      </h2>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Health Advisor & Goals</CardTitle>
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
                        <CardHeader><CardTitle>Actionable Goals</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {adviceResult.goals.map((goal, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-md border">
                                        <div className="flex items-start gap-2">
                                            <Check className="mt-1 h-4 w-4 text-primary" />
                                            <span>{goal.description} (Target: {goal.target})</span>
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
      </div>
    </main>
  );
}
