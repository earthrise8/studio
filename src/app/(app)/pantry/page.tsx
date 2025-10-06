
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { getPantryItems, updatePantryItem, addPantryItem, deletePantryItem } from '@/lib/data';
import type { PantryItem } from '@/lib/types';
import { PlusCircle, UtensilsCrossed, Edit, Trash2, CalendarIcon, Loader2, ScanLine, Search } from 'lucide-react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const pantryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be a positive number.'),
  unit: z.enum(['units', 'lbs', 'kg', 'g', 'oz', 'ml', 'l']),
  category: z.enum(['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other']),
  purchaseDate: z.date(),
  expirationDate: z.date(),
});

const editPantryItemSchema = pantryItemSchema.extend({
    id: z.string(),
});

type PantryFormValues = z.infer<typeof pantryItemSchema>;
type EditPantryFormValues = z.infer<typeof editPantryItemSchema>;

function BarcodeScanner({ onBarcodeScan }: { onBarcodeScan: (barcode: string) => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
  
    useEffect(() => {
      if (open) {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
  
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
        getCameraPermission();
      } else {
        // Stop camera stream when dialog is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
      }
    }, [open, toast]);
  
    const handleSimulateScan = () => {
        const fakeBarcode = `0${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        toast({
            title: "Barcode Scanned (Simulated)",
            description: `Scanned barcode: ${fakeBarcode}`
        })
        onBarcodeScan(fakeBarcode);
        setOpen(false);
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="md:hidden">
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Pantry Item</DialogTitle>
            <DialogDescription>
              Position the item's barcode in front of the camera.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1/2 border-2 border-primary rounded-lg" />
            </div>
          </div>
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}
           <Button onClick={handleSimulateScan} disabled={!hasCameraPermission}>Simulate Scan</Button>
        </DialogContent>
      </Dialog>
    );
}

const defaultExpirationDays: Record<PantryFormValues['category'], number> = {
    Produce: 7,
    Dairy: 10,
    Meat: 4,
    Pantry: 365,
    Frozen: 180,
    Other: 14,
};

function AddPantryItemDialog({ onAdd }: { onAdd: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const form = useForm<PantryFormValues>({
      resolver: zodResolver(pantryItemSchema),
      defaultValues: {
        name: '',
        quantity: 1,
        unit: 'units',
        category: 'Pantry',
        purchaseDate: new Date(),
        expirationDate: addDays(new Date(), defaultExpirationDays.Pantry),
      }
    });

    const watchedCategory = form.watch('category');
    const watchedPurchaseDate = form.watch('purchaseDate');

    useEffect(() => {
        const daysToadd = defaultExpirationDays[watchedCategory] || 7;
        form.setValue('expirationDate', addDays(watchedPurchaseDate, daysToadd));
    }, [watchedCategory, watchedPurchaseDate, form]);

    const handleBarcodeData = (barcode: string) => {
        // In a real app, you would look this barcode up.
        // For now, we'll pre-fill with dummy data.
        form.setValue("name", `Item ${barcode.substring(0,5)}`);
        form.setValue("category", "Pantry");
        setOpen(true); // Open the add dialog after scanning
    }
    
    async function onSubmit(values: PantryFormValues) {
      if (!user) return;
      setLoading(true);
      try {
        const newItemData = {
          ...values,
          purchaseDate: values.purchaseDate.toISOString(),
          expirationDate: values.expirationDate.toISOString(),
        };
        await addPantryItem(user.id, newItemData);
        onAdd();
        toast({ title: "Item Added", description: `${values.name} was successfully added to your pantry.` });
        setOpen(false);
        form.reset({
            name: '',
            quantity: 1,
            unit: 'units',
            category: 'Pantry',
            purchaseDate: new Date(),
            expirationDate: addDays(new Date(), defaultExpirationDays.Pantry),
        });
      } catch(e) {
        toast({ variant: 'destructive', title: "Add Failed", description: "Could not add the item." });
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <>
        <BarcodeScanner onBarcodeScan={handleBarcodeData} />
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Pantry Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({field}) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Almond Milk" /></FormControl>
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
                <div className="space-y-4">
                    <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Purchase Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                  <FormField control={form.control} name="expirationDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiration Date</FormLabel>
                      <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                    Add Item
                  </Button>
                </DialogFooter>
              </form>
          </Form>
        </DialogContent>
      </Dialog>
      </>
    )
}

function EditPantryItemDialog({ item, onUpdate }: { item: PantryItem, onUpdate: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<EditPantryFormValues>({
    resolver: zodResolver(editPantryItemSchema),
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
  
  async function onSubmit(values: EditPantryFormValues) {
    if (!user) return;
    setLoading(true);
    try {
      const updatedItemData = {
        ...values,
        purchaseDate: values.purchaseDate.toISOString(),
        expirationDate: values.expirationDate.toISOString(),
      };
      await updatePantryItem(user.id, updatedItemData.id, updatedItemData);
      onUpdate();
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
              <div className="space-y-4">
                <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                <FormField control={form.control} name="expirationDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
  const { toast } = useToast();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = useCallback(() => {
    if (user) {
        setLoading(true);
        getPantryItems(user.id).then((data) => {
          setItems(data);
          setLoading(false);
        });
      }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemUpdate = () => {
    fetchItems();
  }

  const handleItemAdd = () => {
    fetchItems();
  }
  
  const handleItemDelete = async (itemId: string) => {
    if (!user) return;
    try {
      await deletePantryItem(user.id, itemId);
      toast({ title: 'Item Deleted' });
      fetchItems(); // Refetch to get the updated list
    } catch (error) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete item.' });
    }
  }

  const categories = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other'];
  
  const filteredItems = useMemo(() => {
    return items
      .filter(item => categoryFilter === 'All' || item.category === categoryFilter)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, categoryFilter, searchTerm]);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold">
          Virtual Pantry
        </h2>
        <div className="flex gap-2">
            <AddPantryItemDialog onAdd={handleItemAdd} />
        </div>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex space-x-2">
                    {categories.map(category => (
                        <Button 
                            key={category} 
                            variant={categoryFilter === category ? 'default' : 'outline'}
                            onClick={() => setCategoryFilter(category)}
                            size="sm"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        className="pl-10 max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : filteredItems.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => {
                            const daysUntilExpiry = differenceInDays(new Date(item.expirationDate), new Date());
                            let expiryBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
                            if (daysUntilExpiry < 1) expiryBadgeVariant = 'destructive';
                            else if (daysUntilExpiry < 7) expiryBadgeVariant = 'default';

                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.quantity} {item.unit}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={expiryBadgeVariant}>
                                            {daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry === 0 ? 'Today' : `in ${daysUntilExpiry}d`}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditPantryItemDialog item={item} onUpdate={handleItemUpdate} />
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
                                                    This will permanently delete "{item.name}" from your pantry.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleItemDelete(item.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
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
                        <div className="mt-4">
                            <AddPantryItemDialog onAdd={handleItemAdd} />
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}

    
