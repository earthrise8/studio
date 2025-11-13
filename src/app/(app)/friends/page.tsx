
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFriends } from '@/lib/data';
import type { Friend, Post } from '@/lib/types';
import { Flame, Loader2, PlusCircle, Search, Send, Users } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow } from 'date-fns';

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      Promise.all([
        getFriends(user.id),
        // In a real app, you'd fetch posts. For now, we'll get them from the friend data.
      ]).then(([friendData]) => {
        const allFriends = [
          ...friendData,
          {
            id: user.id,
            name: user.name,
            avatarUrl: user.profile.avatarUrl || '',
            weeklyPoints: 1100, // Mock weekly points for current user
            profile: { ...user.profile, cityGrid: [] },
            awards: [],
            posts: [{
                id: 'p0',
                authorId: user.id,
                authorName: user.name,
                authorAvatar: user.profile.avatarUrl,
                timestamp: new Date().toISOString(),
                content: "Just hit a new personal best on my morning run! Feeling great. 🏃‍♂️"
            }]
          },
        ];
        
        // Collate all posts
        const allPosts = allFriends.flatMap(f => f.posts || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setFriends(allFriends);
        setPosts(allPosts);
        setLoading(false);
      });
    }
  }, [user]);

  const leaderboard = useMemo(() => {
    return [...friends].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  }, [friends]);

  if (loading || !user) {
    return (
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">Friends Hub</h2>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
          <TabsTrigger value="find">Find Friends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
              <CardDescription>See how you stack up against your friends this week.</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <ul className="space-y-4">
                  {leaderboard.map((friend, index) => (
                    <li
                      key={friend.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                        <Link href={friend.id === user.id ? '/dashboard' : `/friends/${friend.id}`} className='flex items-center gap-4 hover:underline'>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{friend.name} {friend.id === user.id && '(You)'}</p>
                                <p className="text-sm text-muted-foreground">Level {Math.floor((friend.profile?.totalPoints || 0) / 100)}</p>
                            </div>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <Flame className="h-5 w-5 text-primary" />
                        <span>{friend.weeklyPoints.toLocaleString()} pts</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No friends to display.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feed" className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Create Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Textarea placeholder="What's on your mind?" />
                    <div className="flex justify-end">
                        <Button disabled>
                            <Send className="mr-2 h-4 w-4" />
                            Post
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>See what your friends have been up to.</CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                    <ul className='space-y-6'>
                        {posts.map(post => (
                            <li key={post.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <div className='flex justify-between items-center'>
                                        <p className='font-semibold'>{post.authorName}</p>
                                        <p className='text-xs text-muted-foreground'>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</p>
                                    </div>
                                    <p className='text-sm mt-1'>{post.content}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-sm text-muted-foreground text-center p-8'>The feed is quiet... for now.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Your Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className='space-y-4'>
                        {friends.filter(f => f.id !== user.id).map(friend => (
                            <li key={friend.id}>
                                <Link href={`/friends/${friend.id}`} className='flex items-center gap-3 hover:underline'>
                                    <Avatar>
                                        <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className='font-medium'>{friend.name}</p>
                                        <p className='text-xs text-muted-foreground'>Level {Math.floor((friend.profile.totalPoints || 0) / 100)}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="find">
            <Card>
                <CardHeader>
                    <CardTitle>Find New Friends</CardTitle>
                    <CardDescription>Search for other users to add to your friends list.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 font-semibold">Search for Friends</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use the search bar above to find and connect with friends.
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">(Friend search is a mock feature)</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

    