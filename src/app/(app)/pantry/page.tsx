'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getPantryItems, updatePantryItem } from '@/lib/data';
import type { PantryItem } from '@/lib/types';
import { PlusCircle, UtensilsCrossed, Edit, Trash2, CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const pantryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be a positive number.'),
  unit: z.enum(['units', 'lbs', 'kg', 'g', 'oz', 'ml', 'l']),
  category: z.enum(['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other']),
  purchaseDate: z.date(),
  expirationDate: z.date(),
});

type PantryFormValues = z.infer<typeof pantryItemSchema>;

function EditPantryItemDialog({ item, onUpdate }: { item: PantryItem, onUpdate: (updatedItem: PantryItem) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<PantryFormValues>({
    resolver: zodResolver(pantryItemSchema),
    defaultValues: {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      purchaseDate: new Date(item.purchaseDate),
      expirationDate: new Date(item.expirationDate),
    }
  });
  
  async function onSubmit(values: PantryFormValues) {
    setLoading(true);
    try {
      const updatedItemData = {
        ...values,
        purchaseDate: values.purchaseDate.toISOString(),
        expirationDate: values.expirationDate.toISOString(),
      };
      await updatePantryItem(updatedItemData.id, updatedItemData);
      onUpdate(updatedItemData);
      toast({ title: "Item Updated", description: `${item.name} was successfully updated.` });
      setOpen(false);
    } catch(e) {
      toast({ variant: 'destructive', title: "Update Failed", description: "Could not update the item." });
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
              <FormField control={form.control} name="name" render={({field}) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({field}) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="unit" render={({field}) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {['units', 'lbs', 'kg', 'g', 'oz', 'ml', 'l'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="category" render={({field}) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="expirationDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                        </PopoverContent>
                      </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
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
  )
}

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

  const handleItemUpdate = (updatedItem: PantryItem) => {
    setItems(currentItems => currentItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  }

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
                    <EditPantryItemDialog item={item} onUpdate={handleItemUpdate} />
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
