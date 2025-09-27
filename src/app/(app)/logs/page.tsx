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
} from '@/lib/data';
import type { ActivityLog, FoodLog } from '@/lib/types';
import { format, formatISO } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

const foodLogSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
});

const activityLogSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  caloriesBurned: z.coerce.number().min(0),
});

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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formSchema = type === 'food' ? foodLogSchema : activityLogSchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues:
      type === 'food'
        ? {
            name: item.name,
            calories: (item as FoodLog).calories,
            protein: (item as FoodLog).protein,
            carbs: (item as FoodLog).carbs,
            fat: (item as FoodLog).fat,
          }
        : {
            name: item.name,
            duration: (item as ActivityLog).duration,
            caloriesBurned: (item as ActivityLog).caloriesBurned,
          },
  });

  async function onSubmit(values: any) {
    setLoading(true);
    try {
      let updatedItem;
      if (type === 'food') {
        updatedItem = await updateFoodLog(item.id, values);
      } else {
        updatedItem = await updateActivityLog(item.id, values);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            {type === 'food' && (
              <>
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
                <div className="grid grid-cols-3 gap-4">
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
            <DialogFooter>
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

export default function LogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'food';

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setDate(new Date());
  }, []);

  useEffect(() => {
    if (user && date) {
      fetchLogs(user.id, date);
    }
  }, [user, date]);

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
  };

  const handleItemDelete = async (itemId: string, type: 'food' | 'activity') => {
    if (!user || !date) return;
    try {
      if (type === 'food') {
        await deleteFoodLog(itemId);
        toast({ title: 'Food log entry deleted.' });
      } else {
        await deleteActivityLog(itemId);
        toast({ title: 'Activity log entry deleted.' });
      }
      fetchLogs(user.id, date);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete log entry.',
      });
    }
  };

  const LogTable = ({
    data,
    type,
  }: {
    data: (FoodLog | ActivityLog)[];
    type: 'food' | 'activity';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">
            {type === 'food' ? 'Food Log' : 'Activity Log'}
          </CardTitle>
          {date && (
            <CardDescription>Entries for {format(date, 'PPP')}</CardDescription>
          )}
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log {type === 'food' ? 'Food' : 'Activity'}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
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
                  colSpan={type === 'food' ? 7 : 5}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
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
                  colSpan={type === 'food' ? 7 : 5}
                  className="h-24 text-center"
                >
                  No entries for this day.
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
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Daily Logs
        </h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
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
