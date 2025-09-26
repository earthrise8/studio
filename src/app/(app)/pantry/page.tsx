'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPantryItems } from '@/lib/data';
import type { PantryItem } from '@/lib/types';
import { PlusCircle, UtensilsCrossed, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function PantryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    if (user) {
      getPantryItems(user.id).then((data) => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [user]);

  const categories = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other'];
  
  const filteredItems = items.filter(item => filter === 'All' || item.category === filter);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Virtual Pantry
        </h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex space-x-2">
        {categories.map(category => (
            <Button 
                key={category} 
                variant={filter === category ? 'default' : 'outline'}
                onClick={() => setFilter(category)}
            >
                {category}
            </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const daysUntilExpiry = differenceInDays(new Date(item.expirationDate), new Date());
            let expiryBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
            if (daysUntilExpiry < 3) expiryBadgeVariant = 'destructive';
            else if (daysUntilExpiry < 7) expiryBadgeVariant = 'default';
            
            return (
                <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <Badge variant={expiryBadgeVariant}>
                        {daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry === 0 ? 'Expires Today' : `Expires in ${daysUntilExpiry}d`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {item.quantity} <span className="text-lg font-normal text-muted-foreground">{item.unit}</span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            )
        })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-10">
          <div className="flex flex-col items-center gap-1 text-center py-20">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">
              Your Pantry is Empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Add your first item to start tracking.
            </p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
