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
import { getActivityLogs, getFoodLogs } from '@/lib/data';
import type { ActivityLog, FoodLog } from '@/lib/types';
import { format, formatISO } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export default function LogsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'food';

  const [date, setDate] = useState<Date>(new Date());
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && date) {
      setLoading(true);
      const dateStr = formatISO(date, { representation: 'date' });
      Promise.all([
        getFoodLogs(user.id, dateStr),
        getActivityLogs(user.id, dateStr),
      ]).then(([foodData, activityData]) => {
        setFoodLogs(foodData);
        setActivityLogs(activityData);
        setLoading(false);
      });
    }
  }, [user, date]);
  
  const LogTable = ({ data, type }: { data: FoodLog[] | ActivityLog[], type: 'food' | 'activity' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">{type === 'food' ? 'Food Log' : 'Activity Log'}</CardTitle>
            <CardDescription>
              Entries for {format(date, 'PPP')}
            </CardDescription>
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
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {type === 'food' && (item as FoodLog).calories !== undefined && <TableCell>{(item as FoodLog).calories} kcal</TableCell>}
                  {type === 'food' && (item as FoodLog).protein !== undefined && <TableCell>{(item as FoodLog).protein} g</TableCell>}
                  {type === 'food' && (item as FoodLog).carbs !== undefined && <TableCell>{(item as FoodLog).carbs} g</TableCell>}
                  {type === 'food' && (item as FoodLog).fat !== undefined && <TableCell>{(item as FoodLog).fat} g</TableCell>}
                  {type === 'activity' && (item as ActivityLog).duration !== undefined && <TableCell>{(item as ActivityLog).duration} min</TableCell>}
                  {type === 'activity' && (item as ActivityLog).caloriesBurned !== undefined && <TableCell>{(item as ActivityLog).caloriesBurned} kcal</TableCell>}
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={type === 'food' ? 6 : 4} className="h-24 text-center">
                  No entries for this day.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )


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
