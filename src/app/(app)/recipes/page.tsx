
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogClose,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { getRecipes, deleteRecipe, addRecipe } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { ChefHat, Trash2, Search, PlusCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const recipeSchema = z.object({
  name: z.string().min(2, 'Recipe name is required.'),
  description: z.string().optional(),
  emoji: z.string().min(1, 'Emoji is required.'),
  ingredients: z.string().min(10, 'Ingredients are required.'),
  instructions: z.string().min(10, 'Instructions are required.'),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  calories: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  carbs: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
});
type RecipeFormValues = z.infer<typeof recipeSchema>;

function AddRecipeDialog({
  userId,
  onRecipeAdded,
}: {
  userId: string;
  onRecipeAdded: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      description: '',
      emoji: '🍳',
      ingredients: '',
      instructions: '',
      prepTime: '',
      cookTime: '',
      totalTime: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  async function onSubmit(values: RecipeFormValues) {
    setLoading(true);
    try {
      await addRecipe(userId, values);
      toast({ title: 'Recipe Added!', description: `${values.name} has been added.` });
      onRecipeAdded();
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the new recipe.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Manual Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add a New Recipe</DialogTitle>
          <DialogDescription>
            Manually enter the details of your recipe below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Spicy Chicken Stir-fry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 🍜" className="w-20 text-center text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="A short, appetizing description." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time</FormLabel>
                    <FormControl><Input {...field} placeholder="15 min" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time</FormLabel>
                    <FormControl><Input {...field} placeholder="20 min" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Time</FormLabel>
                    <FormControl><Input {...field} placeholder="35 min" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} placeholder="- 1 lb chicken&#x0a;- 2 tbsp soy sauce" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} placeholder="1. Cut chicken...&#x0a;2. Mix sauce..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <h3 className="font-medium text-lg pt-2">Nutrition (Optional)</h3>
             <div className="grid grid-cols-4 gap-4">
               <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl><Input type="number" {...field} placeholder="350" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl><Input type="number" {...field} placeholder="30" /></FormControl>
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
                    <FormControl><Input type="number" {...field} placeholder="25" /></FormControl>
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
                    <FormControl><Input type="number" {...field} placeholder="15" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Recipe
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function RecipesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecipes = () => {
    if (user) {
        setLoading(true);
        getRecipes(user.id).then((data) => {
          setRecipes(data);
          setLoading(false);
        });
      }
  }

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  const handleDelete = async (recipeId: string, recipeName: string) => {
    if (!user) return;
    try {
      await deleteRecipe(user.id, recipeId);
      toast({
        title: 'Recipe Deleted',
        description: `"${recipeName}" has been removed.`,
      });
      fetchRecipes();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the recipe.',
      });
    }
  };

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) return recipes;
    return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recipes, searchTerm]);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold">
          My Recipes
        </h2>
        <div className="flex gap-2">
            {user && <AddRecipeDialog userId={user.id} onRecipeAdded={fetchRecipes} />}
            <Button asChild>
                <Link href="/ai-recipes">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Get AI Recipes
                </Link>
            </Button>
        </div>
      </div>

    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search recipes..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
    </div>


      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="flex justify-center items-center h-48">
                        <Skeleton className="h-20 w-20" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Dialog key={recipe.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex-1">
                    <div className="flex justify-center items-center text-6xl h-48">
                        {recipe.emoji}
                    </div>
                    <CardTitle className="font-headline">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {recipe.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl flex items-center gap-4">
                    <span>{recipe.emoji}</span>
                    <span>{recipe.name}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
                    {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
                    {recipe.totalTime && <span>Total: {recipe.totalTime}</span>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-headline font-bold mb-2 text-lg">Ingredients</h3>
                      <div className="text-sm whitespace-pre-wrap">{recipe.ingredients}</div>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold mb-2 text-lg">Instructions</h3>
                      <div className="text-sm whitespace-pre-wrap">{recipe.instructions}</div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={() => handleDelete(recipe.id, recipe.name)} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Recipe
                        </Button>
                    </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-10">
          <div className="flex flex-col items-center gap-1 text-center py-20">
            <ChefHat className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">
              No Recipes Found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? `No recipes match "${searchTerm}".` : "Add a recipe manually or use the AI Recipe page to generate and save new recipes."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
