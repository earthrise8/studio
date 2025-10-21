
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-provider';
import {
  getShoppingCartItems,
  addShoppingCartItem,
  updateShoppingCartItem,
  deleteShoppingCartItem,
  addPantryItem,
} from '@/lib/data';
import type { ShoppingCartItem, Store } from '@/lib/types';
import { PlusCircle, Trash2, Edit, Loader2, Star, ShoppingCart, PackagePlus } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, addDays } from 'date-fns';

const STORES: Store[] = ['Any', 'Costco', 'Walmart', 'Trader Joe\'s', 'Whole Foods'];

const shoppingCartItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  store: z.enum(STORES),
  healthRating: z.coerce.number().min(1).max(5),
});

type ShoppingCartFormValues = z.infer<typeof shoppingCartItemSchema>;

const HealthRatingInput = ({ value, onChange }: { value: number; onChange: (value: number) => void; }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`cursor-pointer h-6 w-6 ${value >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    onClick={() => onChange(star)}
                />
            ))}
        </div>
    );
};

function ShoppingCartItemDialog({
  item,
  onSave,
  trigger
}: {
  item?: ShoppingCartItem;
  onSave: (values: ShoppingCartFormValues, id?: string) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ShoppingCartFormValues>({
    resolver: zodResolver(shoppingCartItemSchema),
    defaultValues: item ? {
      name: item.name,
      price: item.price,
      store: item.store,
      healthRating: item.healthRating,
    } : {
      name: '',
      price: 0,
      store: 'Any',
      healthRating: 3,
    }
  });

  useEffect(() => {
    if(open) {
        form.reset(item ? {
            name: item.name,
            price: item.price,
            store: item.store,
            healthRating: item.healthRating,
          } : {
            name: '',
            price: 0,
            store: 'Any',
            healthRating: 3,
          });
    }
  }, [open, item, form]);

  async function onSubmit(values: ShoppingCartFormValues) {
    setLoading(true);
    try {
      await onSave(values, item?.id);
      toast({ title: item ? 'Item Updated' : 'Item Added' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {item ? `Editing "${item.name}"` : 'Add a new item to your shopping list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., Organic Bananas" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="store" render={({ field }) => (
                <FormItem>
                  <FormLabel>Store</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {STORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="healthRating" render={({ field }) => (
              <FormItem>
                <FormLabel>Health Rating</FormLabel>
                <FormControl>
                    <HealthRatingInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ShoppingCartPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ShoppingCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState<Store | 'All'>('All');

  const fetchItems = useCallback(() => {
    if (user) {
      setLoading(true);
      getShoppingCartItems(user.id).then((data) => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSaveItem = async (values: ShoppingCartFormValues, id?: string) => {
    if (!user) return;
    if (id) {
      await updateShoppingCartItem(user.id, id, values);
    } else {
      await addShoppingCartItem(user.id, values);
    }
    fetchItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    try {
      await deleteShoppingCartItem(user.id, itemId);
      toast({ title: 'Item Removed' });
      fetchItems();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Delete Failed' });
    }
  };

  const handleMoveToPantry = async (item: ShoppingCartItem) => {
    if (!user) return;
    try {
        await addPantryItem(user.id, {
            name: item.name,
            quantity: 1,
            unit: 'units',
            category: 'Other',
            purchaseDate: new Date().toISOString(),
            expirationDate: addDays(new Date(), 14).toISOString(),
        });
        await deleteShoppingCartItem(user.id, item.id);
        toast({
            title: "Item Moved",
            description: `"${item.name}" has been added to your pantry and removed from the cart.`,
        });
        fetchItems();
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Move Failed',
            description: 'Could not move the item to the pantry.'
        });
    }
  };

  const filteredItems = useMemo(() => {
    if (storeFilter === 'All') return items;
    return items.filter(item => item.store === storeFilter);
  }, [items, storeFilter]);

  const totalCost = filteredItems.reduce((acc, item) => acc + item.price, 0);
  const allStores: (Store | 'All')[] = ['All', ...STORES];

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold">Shopping Cart</h2>
        <ShoppingCartItemDialog
          onSave={handleSaveItem}
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Your Grocery List</CardTitle>
              <CardDescription>
                Manage items you plan to buy. Total estimated cost: ${totalCost.toFixed(2)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
                {allStores.map(store => (
                    <Button 
                        key={store} 
                        variant={storeFilter === store ? 'default' : 'outline'}
                        onClick={() => setStoreFilter(store)}
                        size="sm"
                    >
                        {store}
                    </Button>
                ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Health Rating</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.store}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${item.healthRating > i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(item.dateAdded), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleMoveToPantry(item)}>
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      <ShoppingCartItemDialog
                        item={item}
                        onSave={handleSaveItem}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove "{item.name}" from your list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">Your shopping cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {storeFilter === 'All' ? 'Click "Add Item" to start building your grocery list.' : `No items found for "${storeFilter}".`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

    

    