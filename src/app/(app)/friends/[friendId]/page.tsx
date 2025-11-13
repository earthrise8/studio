
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { getFriendById } from '@/lib/data';
import type { Friend, Award } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Loader2, ArrowLeft, Trophy, Building, Users, DollarSign, BarChart, Leaf } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCityInfo, buildingDataMap } from '@/lib/city-data';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function FriendProfilePage({ params: { friendId } }: { params: { friendId: string } }) {
  const { user } = useAuth();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getFriendById(user.id, friendId).then(friendData => {
        setFriend(friendData);
        setLoading(false);
      });
    }
  }, [user, friendId]);
  
  const { cityInfo } = useMemo(() => {
    if (!friend?.profile.cityGrid) return { cityInfo: null };
    const { cityInfo: info } = getCityInfo(friend.profile.totalPoints, friend.profile.cityGrid);
    return { cityInfo: info };
  }, [friend]);


  if (loading || !user) {
    return (
      <main className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!friend) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/friends">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
            <AvatarImage src={friend.avatarUrl} alt={friend.name} />
            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="font-headline text-3xl font-bold">{friend.name}</h2>
                <p className="text-muted-foreground">Level {Math.floor(friend.profile.totalPoints / 100)}</p>
            </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{friend.profile.totalPoints.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Population</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{cityInfo?.population.toLocaleString() || 0}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${cityInfo?.netRevenue.toLocaleString() || 0}</div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eco Score</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{cityInfo?.ecoScore || 0}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className='font-headline flex items-center gap-2'>
              <Building /> {friend.profile.cityName || `${friend.name}'s City`}
            </CardTitle>
            <CardDescription>A view of your friend's city.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4">
             <div className="rounded-lg border bg-muted flex items-center justify-center p-4 overflow-x-auto">
                {friend.profile.cityGrid && friend.profile.cityGrid.length > 0 ? (
                    <TooltipProvider>
                        <div className="font-mono text-center text-lg leading-none select-none">
                            {friend.profile.cityGrid.map((row, y) => (
                                <div key={y} className="flex">
                                    {row.map((cell, x) => {
                                        const building = buildingDataMap.get(cell);
                                        return (
                                             <Tooltip key={x}>
                                                <TooltipTrigger asChild>
                                                    <div className={cn('flex items-center justify-center h-8 w-8')}>
                                                        <span>{cell}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                {building && (
                                                    <TooltipContent>
                                                        <p className="font-semibold">{building.name}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </TooltipProvider>
                ) : (
                    <p className="text-muted-foreground">This friend hasn't started building their city yet.</p>
                )}
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-headline'>Awards</CardTitle>
            <CardDescription>Trophies and achievements earned.</CardDescription>
          </CardHeader>
          <CardContent>
             {friend.awards.length > 0 ? (
                <ul className="space-y-4">
                    {friend.awards.map((award) => (
                        <li key={award.id} className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{award.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Achieved on {format(new Date(award.dateAchieved), 'PPP')}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-sm">No awards earned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
