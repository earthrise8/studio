

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { updateUserProfile, getGoals, addGoal, deleteGoal, updateGoal, resetUserData } from '@/lib/data';
import type { Goal } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  weight: z.coerce.number().positive().optional().or(z.literal('')),
  age: z.coerce.number().positive().int().optional().or(z.literal('')),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']).optional(),
  dailyCalorieGoal: z.coerce.number().positive().int().optional().or(z.literal('')),
  healthGoal: z.string().optional(),
});

const goalFormSchema = z.object({
    description: z.string().min(3, "Goal description is required."),
    target: z.coerce.number().min(1, "Target must be at least 1."),
    points: z.coerce.number().min(0, "Points must be a positive number.")
})

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalDialogOpen, setGoalDialogOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      height: '',
      weight: '',
      age: '',
      activityLevel: undefined,
      dailyCalorieGoal: '',
      healthGoal: '',
    },
  });
  
  const goalForm = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
        description: '',
        target: 1,
        points: 50,
    }
  });

  const fetchGoals = useCallback(async () => {
    if(user) {
        const userGoals = await getGoals(user.id);
        setGoals(userGoals);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
        fetchGoals();
    }
  }, [user, fetchGoals]);


  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        height: user.profile?.height || '',
        weight: user.profile?.weight || '',
        age: user.profile?.age || '',
        activityLevel: user.profile?.activityLevel || undefined,
        dailyCalorieGoal: user.profile?.dailyCalorieGoal || '',
        healthGoal: user.profile?.healthGoal || '',
      });
    }
  }, [user, form]);

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    setLoading(true);
    try {
        const { name, email, ...profileData} = data;
        
        const profileToUpdate = {
          ...user.profile, // Preserve existing profile data like totalPoints
          ...profileData,
          height: profileData.height === '' ? undefined : Number(profileData.height),
          weight: profileData.weight === '' ? undefined : Number(profileData.weight),
          age: profileData.age === '' ? undefined : Number(profileData.age),
          dailyCalorieGoal: profileData.dailyCalorieGoal === '' ? undefined : Number(profileData.dailyCalorieGoal),
        };

        await updateUserProfile(user.id, {
            name,
            email,
            profile: profileToUpdate
        });
        await refreshUser();
        toast({
            title: 'Profile Updated',
            description: 'Your settings have been saved.',
        });
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Something went wrong while updating your profile.',
        });
    } finally {
        setLoading(false);
    }
  }

  async function onGoalSubmit(data: GoalFormValues) {
    if (!user) return;
    try {
        await addGoal(user.id, {
            description: data.description,
            target: data.target,
            points: data.points,
            progress: 0,
            isCompleted: false,
        });
        await fetchGoals();
        toast({ title: "Goal Added", description: "Your new goal has been set." });
        setGoalDialogOpen(false);
        goalForm.reset();
    } catch(error) {
        toast({ variant: 'destructive', title: "Add Failed", description: "Could not add goal." });
    }
  }

  const handleGoalDelete = async (goalId: string) => {
    if(!user) return;
    try {
        await deleteGoal(user.id, goalId);
        await fetchGoals();
        toast({ title: 'Goal Deleted' });
    } catch(error) {
        toast({ variant: 'destructive', title: "Delete Failed", description: "Could not delete goal." });
    }
  }
  
  const handleProgressChange = async (goal: Goal, newProgress: number) => {
    if(!user) return;
    const updatedGoal = {...goal, progress: newProgress };
    if(updatedGoal.progress >= updatedGoal.target) {
        updatedGoal.progress = updatedGoal.target;
        updatedGoal.isCompleted = true;
    } else {
        updatedGoal.isCompleted = false;
    }
    
    try {
        await updateGoal(user.id, updatedGoal);
        await fetchGoals();
        if(updatedGoal.isCompleted && !goal.isCompleted) {
            toast({ title: 'Goal Complete!', description: `You achieved: ${goal.description}`});
        }
        await refreshUser();
    } catch(e) {
        //
    }
  }

  const handleResetData = () => {
    if(!user) return;
    try {
        resetUserData(user.id);
        toast({
            title: "Data Reset",
            description: "All your data has been reset to the default state."
        });
        // Force a reload to get the new state
        window.location.reload();
    } catch (e) {
        toast({
            variant: 'destructive',
            title: "Reset Failed",
            description: "Could not reset your data. Please try again."
        });
    }
  }

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">
        Settings
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                This is how others will see you on the site.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                                disabled
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="25" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="175" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="70" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="activityLevel"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Physical Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select your activity level" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                                    <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                                    <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                                    <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                                    <SelectItem value="very-active">Extra active (very hard exercise/sports & physical job)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dailyCalorieGoal"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Daily Calorie Goal (kcal)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="2200" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="healthGoal"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Health Goal</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Lose weight, build muscle" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Health Goals & Challenges</CardTitle>
                        <CardDescription>
                            Set and track your progress towards your goals.
                        </CardDescription>
                    </div>
                     <Dialog open={isGoalDialogOpen} onOpenChange={setGoalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Goal</DialogTitle>
                            </DialogHeader>
                            <Form {...goalForm}>
                                <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
                                    <FormField control={goalForm.control} name="description" render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Goal</FormLabel>
                                            <FormControl><Input {...field} placeholder="e.g., Run 10 miles this month" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={goalForm.control} name="target" render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Target</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={goalForm.control} name="points" render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Points</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Add Goal</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                    {goals.length > 0 ? (
                        goals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{goal.description}</p>
                                    <p className="text-xs text-muted-foreground">Target: {goal.target} | Points: {goal.points}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={goal.progress}
                                      onChange={(e) => handleProgressChange(goal, parseInt(e.target.value))}
                                      className="w-20"
                                      max={goal.target}
                                      min={0}
                                      disabled={goal.isCompleted}
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete this goal.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleGoalDelete(goal.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">You haven't set any goals yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable dark theme for the application.
                            </p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Compact View</Label>
                            <p className="text-sm text-muted-foreground">
                                Reduce padding and margins for a denser layout.
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Admin Actions</CardTitle>
                    <CardDescription>These are destructive actions. Use with caution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Reset All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all of your
                                logs, goals, points, and recipes, resetting your account to its default state.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetData}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}

    

    

