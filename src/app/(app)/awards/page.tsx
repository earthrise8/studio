
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAwards } from '@/lib/data';
import type { Award } from '@/lib/types';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AwardsPage() {
  const { user } = useAuth();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getAwards(user.id).then((data) => {
        const sortedData = data.sort((a, b) => new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime());
        setAwards(sortedData);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">
        Your Awards
      </h2>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : awards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {awards.map((award) => (
            <Card key={award.id} className="text-center flex flex-col">
              <CardHeader className="items-center flex-1">
                <div className="p-4 bg-primary/20 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">{award.name}</CardTitle>
                <CardDescription>
                  Achieved on {format(new Date(award.dateAchieved), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{award.description}</p>
                <Badge className="mt-4">+{award.points} Points</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-10">
          <div className="flex flex-col items-center gap-1 text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">
              No Awards Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep logging and achieving goals to earn your first trophy!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
