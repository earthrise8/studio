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
  getUser,
} from '@/lib/data';
import {
  Apple,
  Flame,
  PlusCircle,
  Dumbbell,
  Lightbulb,
} from 'lucide-react';
import { formatISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/actions';

export default async function DashboardPage() {
  // In a real app, you would get the logged-in user's ID
  const user = await getCurrentUser();
  if (!user) return <p>Please log in.</p>; // Or redirect

  const todayStr = formatISO(new Date(), { representation: 'date' });

  const [
    pantryItems,
    foodLogsToday,
    activityLogsToday,
  ] = await Promise.all([
    getPantryItems(user.id),
    getFoodLogs(user.id, todayStr),
    getActivityLogs(user.id, todayStr),
  ]);

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


  const quickActions = [
    {
      label: 'Log Food',
      icon: Apple,
      href: '/logs?tab=food',
      color: 'bg-green-500',
    },
    {
      label: 'Log Activity',
      icon: Dumbbell,
      href: '/logs?tab=activity',
      color: 'bg-blue-500',
    },
    {
      label: 'Add to Pantry',
      icon: PlusCircle,
      href: '/pantry',
      color: 'bg-yellow-500',
    },
    {
      label: 'Get Advice',
      icon: Lightbulb,
      href: '/advisor',
      color: 'bg-purple-500',
    },
  ];

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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-28 flex-col gap-2"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="h-8 w-8" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
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
