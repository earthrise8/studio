
'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-provider';
import {
  getActivityLogs,
  getFoodLogs,
  deleteFoodLog,
  deleteActivityLog,
  updateFoodLog,
  updateActivityLog,
  addFoodLog,
  addActivityLog,
  getRecipes,
  getRecentFoodLogs,
  getRecentActivityLogs,
} from '@/lib/data';
import type { ActivityLog, FoodLog, Recipe } from '@/lib/types';
import { format, formatISO, subDays, addDays } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  BookHeart,
  ChevronLeft,
  ChevronRight,
  Flame,
  Apple,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';


const foodLogSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  sugar: z.coerce.number().min(0).optional(),
  fiber: z.coerce.number().min(0).optional(),
});

const activityLogSchema = z.object({
  type: z.string().min(1, 'Activity type is required'),
  name: z.string().min(1, 'A name for your activity is required.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  caloriesBurned: z.coerce.number().min(0),
});


const COMMON_ACTIVITIES = ['Run', 'Walk', 'Swim', 'Bike', 'HIIT', 'Weight Training', 'Sport'];

function AddFoodLogDialog({
  date,
  userId,
  onLog,
}: {
  date: Date;
  userId: string;
  onLog: (newLog: FoodLog) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState('custom');

  const form = useForm({
    resolver: zodResolver(foodLogSchema),
    defaultValues: {
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      fiber: 0,
    },
  });
  
  useEffect(() => {
    if(open && userId) {
        getRecipes(userId).then(setRecipes);
    }
  }, [open, userId]);

  async function onSubmit(values: z.infer<typeof foodLogSchema>) {
    setLoading(true);
    try {
      const newLogData = {
        ...values,
        date: formatISO(date, { representation: 'date' }),
      };
      const newLog = await addFoodLog(userId, newLogData);
      onLog(newLog);
      toast({ title: 'Food Logged', description: `${newLog.name} has been logged.` });
      setOpen(false);
      form.reset();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Log Failed',
        description: 'Could not log the food item.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRecipeLog(recipe: Recipe) {
    const recipeLog: z.infer<typeof foodLogSchema> = {
        name: recipe.name,
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        carbs: recipe.carbs || 0,
        fat: recipe.fat || 0,
        sugar: 0,
        fiber: 0,
    };
    await onSubmit(recipeLog);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log Food
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Food for {format(date, 'PPP')}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="recipe">From Recipe</TabsTrigger>
          </TabsList>
          <TabsContent value="custom">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Apple" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sugar (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiber (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className='pt-4'>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log Food Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="recipe">
            <ScrollArea className="h-72">
                <div className="space-y-2 p-1">
                    {recipes.length > 0 ? (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="flex justify-between items-center border p-3 rounded-md">
                                <div className='flex items-center gap-3'>
                                    <span className="text-2xl">{recipe.emoji}</span>
                                    <div>
                                        <p className="font-medium">{recipe.name}</p>
                                        <p className="text-xs text-muted-foreground">{recipe.calories || 0} kcal</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleRecipeLog(recipe)} disabled={loading}>
                                    <BookHeart className="mr-2 h-4 w-4" />
                                    Log
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-10">You have no saved recipes.</p>
                    )}
                </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AddActivityLogDialog({
    date,
    userId,
    onLog,
  }: {
    date: Date;
    userId: string;
    onLog: (newLog: ActivityLog) => void;
  }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const form = useForm({
      resolver: zodResolver(activityLogSchema),
      defaultValues: {
        type: 'Run',
        name: '',
        duration: 30,
        caloriesBurned: 0,
      },
    });

    async function onSubmit(values: z.infer<typeof activityLogSchema>) {
      setLoading(true);
      try {
        const newLogData = {
          ...values,
          date: formatISO(date, { representation: 'date' }),
        };
        const newLog = await addActivityLog(userId, newLogData);
        onLog(newLog);
        toast({ title: 'Activity Logged', description: `${newLog.name} has been logged.` });
        setOpen(false);
        form.reset();
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Log Failed',
          description: 'Could not log the activity.',
        });
      } finally {
        setLoading(false);
        }
    }
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Log Activity
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Activity for {format(date, 'PPP')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Morning Run, Leg Day" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an activity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...COMMON_ACTIVITIES, 'Other'].map(activity => (
                            <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caloriesBurned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories Burned (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log Activity
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

function EditLogDialog({
  item,
  type,
  onUpdate,
}: {
  item: FoodLog | ActivityLog;
  type: 'food' | 'activity';
  onUpdate: (updatedItem: FoodLog | ActivityLog) => void;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formSchema = type === 'food' ? foodLogSchema : activityLogSchema;
  const defaultValues = useMemo(() => {
    if (type === 'food') {
      const foodItem = item as FoodLog;
      return {
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        sugar: foodItem.sugar || 0,
        fiber: foodItem.fiber || 0,
      };
    } else {
      return {
        type: (item as ActivityLog).type,
        name: item.name,
        duration: (item as ActivityLog).duration,
        caloriesBurned: (item as ActivityLog).caloriesBurned,
      };
    }
  }, [item, type]);

  const form = useForm({
    resolver: zodResolver(formSchema as any), // Using `any` due to conditional schema
    defaultValues: defaultValues,
  });
  
  async function onSubmit(values: any) {
    if (!user) return;
    setLoading(true);
    try {
      let updatedItem;
      if (type === 'food') {
        updatedItem = await updateFoodLog(user.id, item.id, values);
      } else {
        updatedItem = await updateActivityLog(user.id, item.id, values);
      }
      onUpdate(updatedItem);
      toast({ title: 'Log Updated' });
      setOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the log entry.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
             {type === 'activity' && (
              <>
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Morning Run, Leg Day" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an activity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...COMMON_ACTIVITIES, 'Other'].map(activity => (
                              <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {type === 'food' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sugar (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiber (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            {type === 'activity' && (
              <>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caloriesBurned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories Burned (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter className='pt-4'>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};


function WeeklySummary({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const endDate = currentDate;
    const startDate = subDays(endDate, 2);

    const [foodLogs, activityLogs] = await Promise.all([
      getRecentFoodLogs(user.id, 30), // Fetch a larger chunk to allow navigation
      getRecentActivityLogs(user.id, 30),
    ]);

    const summary: Record<string, any> = {};
    for (let i = 0; i < 3; i++) {
      const date = subDays(endDate, i);
      const dateStr = formatISO(date, { representation: 'date' });
      summary[dateStr] = {
        date: dateStr,
        caloriesIn: 0,
        caloriesOut: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        foods: [],
        activities: [],
      };
    }

    foodLogs.forEach(log => {
      const logDate = new Date(log.date);
       // Adjust for timezone differences by comparing date parts
      const logDateStr = formatISO(logDate, { representation: 'date' });
      if (summary[logDateStr]) {
          summary[logDateStr].caloriesIn += log.calories;
          summary[logDateStr].protein += log.protein;
          summary[logDateStr].carbs += log.carbs;
          summary[logDateStr].fat += log.fat;
          summary[logDateStr].sugar += log.sugar || 0;
          summary[logDateStr].fiber += log.fiber || 0;
          summary[logDateStr].foods.push(log.name);
      }
    });

    activityLogs.forEach(log => {
       const logDate = new Date(log.date);
       const logDateStr = formatISO(logDate, { representation: 'date' });
       if (summary[logDateStr]) {
           summary[logDateStr].caloriesOut += log.caloriesBurned;
           summary[logDateStr].activities.push(log.name);
       }
    });
    
    setData(Object.values(summary).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setLoading(false);
  }, [user, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    caloriesIn: { label: 'Calories In', color: 'hsl(var(--chart-1))' },
    caloriesOut: { label: 'Calories Out', color: 'hsl(var(--chart-2))' },
  } satisfies z.infer<typeof foodLogSchema> & z.infer<typeof activityLogSchema>;

  const handlePrevious = () => {
    setCurrentDate(subDays(currentDate, 3));
  };

  const handleNext = () => {
    setCurrentDate(addDays(currentDate, 3));
  };
  
  const isNextDisabled = data.length > 0 && isToday(new Date(data[data.length -1].date));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>3-Day Summary</CardTitle>
          <CardDescription>Your stats for the last 3 days.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={isNextDisabled}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((day) => (
            <Card key={day.date} className="w-full">
                <CardHeader>
                <CardTitle className="text-lg">{format(new Date(day.date), 'EEE, MMM d')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ChartContainer config={chartConfig} className="h-40 w-full">
                        <BarChart accessibilityLayer data={[day]} margin={{top: 20}}>
                            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={() => ''} />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Legend />
                            <Bar dataKey="caloriesIn" fill="var(--color-caloriesIn)" radius={4} name="Calories In" />
                            <Bar dataKey="caloriesOut" fill="var(--color-caloriesOut)" radius={4} name="Calories Out" />
                        </BarChart>
                    </ChartContainer>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex justify-between"><span>Protein</span><span className="font-medium">{day.protein.toFixed(0)}g</span></div>
                        <div className="flex justify-between"><span>Carbs</span><span className="font-medium">{day.carbs.toFixed(0)}g</span></div>
                        <div className="flex justify-between"><span>Fat</span><span className="font-medium">{day.fat.toFixed(0)}g</span></div>
                        <div className="flex justify-between"><span>Sugar</span><span className="font-medium">{day.sugar.toFixed(0)}g</span></div>
                        <div className="flex justify-between"><span>Fiber</span><span className="font-medium">{day.fiber.toFixed(0)}g</span></div>
                    </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Foods Eaten</h4>
                        <p className="text-xs text-muted-foreground truncate">{day.foods.join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Activities</h4>
                        <p className="text-xs text-muted-foreground truncate">{day.activities.join(', ') || 'None'}</p>
                      </div>
                </CardContent>
            </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'food';

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('All');
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const fetchLogs = (userId: string, date: Date) => {
    setLoading(true);
    const dateStr = formatISO(date, { representation: 'date' });
    Promise.all([
      getFoodLogs(userId, dateStr),
      getActivityLogs(userId, dateStr),
    ]).then(([foodData, activityData]) => {
      setFoodLogs(foodData);
      setActivityLogs(activityData);
      setLoading(false);
    });
  };
  
  const refreshSummary = () => setSummaryRefreshKey(prev => prev + 1);

  useEffect(() => {
    if (user && date) {
      fetchLogs(user.id, date);
    }
  }, [user, date]);
  
  const handleFoodLog = (newLog: FoodLog) => {
    setFoodLogs(current => [...current, newLog]);
    refreshSummary();
  }

  const handleActivityLog = (newLog: ActivityLog) => {
    setActivityLogs(current => [...current, newLog]);
    refreshSummary();
  }

  const handleItemUpdate = (updatedItem: FoodLog | ActivityLog, type: 'food' | 'activity') => {
    if (type === 'food') {
      setFoodLogs((current) =>
        current.map((item) => (item.id === updatedItem.id ? (updatedItem as FoodLog) : item))
      );
    } else {
      setActivityLogs((current) =>
        current.map((item) => (item.id === updatedItem.id ? (updatedItem as ActivityLog) : item))
      );
    }
    refreshSummary();
  };

  const handleItemDelete = async (itemId: string, type: 'food' | 'activity') => {
    if (!user || !date) return;
    try {
      if (type === 'food') {
        await deleteFoodLog(user.id, itemId);
        toast({ title: 'Food log entry deleted.' });
      } else {
        await deleteActivityLog(user.id, itemId);
        toast({ title: 'Activity log entry deleted.' });
      }
      fetchLogs(user.id, date);
      refreshSummary();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete log entry.',
      });
    }
  };

  const activityTypes = useMemo(() => ['All', ...new Set(activityLogs.map(log => log.type))], [activityLogs]);
  
  const filteredActivityLogs = useMemo(() => {
    if (activityFilter === 'All') {
      return activityLogs;
    }
    return activityLogs.filter(log => log.type === activityFilter);
  }, [activityLogs, activityFilter]);


  const LogTable = ({
    data,
    type,
  }: {
    data: (FoodLog | ActivityLog)[];
    type: 'food' | 'activity';
  }) => (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>
                {type === 'food' ? 'Food Log' : 'Activity Log'}
              </CardTitle>
              {date && (
                <CardDescription>Entries for {format(date, 'PPP')}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
                {type === 'activity' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {activityTypes.map(filterType => (
                        <div key={filterType}>
                          <Button
                              variant={activityFilter === filterType ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActivityFilter(filterType)}
                          >
                              {filterType}
                          </Button>
                        </div>
                      ))}
                    </div>
                )}
                {type === 'food' && user && date && (
                <AddFoodLogDialog date={date} userId={user.id} onLog={handleFoodLog} />
                )}
                {type === 'activity' && user && date && (
                    <AddActivityLogDialog date={date} userId={user.id} onLog={handleActivityLog} />
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {type === 'activity' && <TableHead>Type</TableHead>}
              {type === 'food' && <TableHead>Calories</TableHead>}
              {type === 'food' && <TableHead>Protein</TableHead>}
              {type === 'food' && <TableHead>Carbs</TableHead>}
              {type === 'food' && <TableHead>Fat</TableHead>}
              {type === 'activity' && <TableHead>Duration</TableHead>}
              {type === 'activity' && <TableHead>Calories Burned</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={type === 'food' ? 6 : 5}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (type === 'food' ? data : filteredActivityLogs).length > 0 ? (
              (type === 'food' ? data : filteredActivityLogs).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                   {type === 'activity' && <TableCell>{(item as ActivityLog).type}</TableCell>}
                  {type === 'food' && (
                    <>
                      <TableCell>{(item as FoodLog).calories} kcal</TableCell>
                      <TableCell>{(item as FoodLog).protein} g</TableCell>
                      <TableCell>{(item as FoodLog).carbs} g</TableCell>
                      <TableCell>{(item as FoodLog).fat} g</TableCell>
                    </>
                  )}
                  {type === 'activity' && (
                    <>
                      <TableCell>{(item as ActivityLog).duration} min</TableCell>
                      <TableCell>
                        {(item as ActivityLog).caloriesBurned} kcal
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <EditLogDialog
                      item={item}
                      type={type}
                      onUpdate={(updated) => handleItemUpdate(updated, type)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the log entry for "{item.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleItemDelete(item.id, type)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={type === 'food' ? 6 : 5}
                  className="h-24 text-center"
                >
                  No entries for this day{activityFilter !== 'All' ? ` matching "${activityFilter}"` : ''}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold">
          Daily Logs
        </h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full md:w-auto justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => day && setDate(day)}
              initialFocus
              disabled={(d) => d > new Date() || d < new Date('2000-01-01')}
            />
          </PopoverContent>
        </Popover>
      </div>

      <WeeklySummary key={summaryRefreshKey} />

      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="food">Food Log</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="food">
          <LogTable data={foodLogs} type="food" />
        </TabsContent>
        <TabsContent value="activity">
          <LogTable data={activityLogs} type="activity" />
        </TabsContent>
      </Tabs>
    </main>
  );
}

    