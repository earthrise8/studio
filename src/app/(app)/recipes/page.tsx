
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
import { getRecipes, deleteRecipe, addRecipe, getPantryItems, updateRecipe } from '@/lib/data';
import type { Recipe, PantryItem } from '@/lib/types';
import { ChefHat, Trash2, Search, PlusCircle, Loader2, Sparkles, CookingPot, Flame, Bookmark, Info, Star } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { generatePantryRecipes } from '@/ai/flows/generate-pantry-recipes';
import { generateRecipe } from '@/ai/flows/generate-recipe';
import { cn } from '@/lib/utils';

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

type RecipeIdea = {
    name: string;
    description: string;
    emoji: string;
}

type FullRecipe = Recipe & { id?: string };


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

function MyCookbookTab({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
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
  
  const handleToggleFavorite = async (recipe: Recipe) => {
    if(!user) return;
    try {
        await updateRecipe(user.id, recipe.id, { isFavorite: !recipe.isFavorite });
        fetchRecipes();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update favorite status.',
        });
    }
  }

  const filteredRecipes = useMemo(() => {
    const filtered = searchTerm
      ? recipes.filter(
          (recipe) =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (recipe.description &&
              recipe.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : recipes;

      return filtered.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [recipes, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search your cookbook..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
            {user && <AddRecipeDialog userId={user.id} onRecipeAdded={fetchRecipes} />}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="border rounded-md">
           <ul className='divide-y'>
                {filteredRecipes.map((recipe) => (
                    <Dialog key={recipe.id}>
                        <li className="flex items-center justify-between p-4 group">
                             <DialogTrigger asChild>
                                <div className='flex-1 cursor-pointer'>
                                    <div className='flex items-start gap-4'>
                                        <span className="text-3xl mt-1">{recipe.emoji}</span>
                                        <div>
                                            <p className="font-semibold font-headline">{recipe.name}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{recipe.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <div className='flex items-center gap-2'>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(recipe)}>
                                    <Star className={cn("h-5 w-5", recipe.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground group-hover:text-yellow-400')} />
                                </Button>
                                <DialogClose asChild>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(recipe.id, recipe.name)} className="text-destructive">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </DialogClose>
                             </div>
                        </li>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                            <DialogTitle className="font-headline text-2xl flex items-center gap-4">
                                <span>{recipe.emoji}</span>
                                <span>{recipe.name}</span>
                            </DialogTitle>
                             <DialogDescription>{recipe.description}</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
                                    {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
                                    {recipe.totalTime && <span>Total: {recipe.totalTime}</span>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div>
                                        <h3 className="font-headline font-bold mb-2 text-lg">Ingredients</h3>
                                        <div className="text-sm whitespace-pre-line">{recipe.ingredients}</div>
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-bold mb-2 text-lg">Instructions</h3>
                                        <div className="text-sm whitespace-pre-line">{recipe.instructions}</div>
                                    </div>
                                </div>
                                
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </ul>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-10">
          <div className="flex flex-col items-center gap-1 text-center py-20">
            <ChefHat className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">
              Your Cookbook is Empty
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? `No recipes match "${searchTerm}".` : "Add a recipe manually or use the AI Recipe Generator."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function AiGeneratorTab({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
    const { toast } = useToast();

    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [healthGoal, setHealthGoal] = useState('');
    const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingRecipe, setSavingRecipe] = useState<string | null>(null);
    const [userPrompt, setUserPrompt] = useState('');

    const [selectedIdea, setSelectedIdea] = useState<RecipeIdea | null>(null);
    const [previewRecipe, setPreviewRecipe] = useState<FullRecipe | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        if(user) {
            setHealthGoal(user.profile?.healthGoal || '');
            getPantryItems(user.id).then(items => {
                const sortedItems = items
                    .map(item => ({...item, daysUntilExpiry: differenceInDays(new Date(item.expirationDate), new Date())}))
                    .sort((a,b) => a.daysUntilExpiry - b.daysUntilExpiry);
                setPantryItems(sortedItems);
            });
        }
    }, [user]);

    const handleGenerateRecipes = async () => {
        if (!user) return;
        setLoading(true);
        setRecipeIdeas([]);
        try {
            const result = await generatePantryRecipes({
                pantryItems: pantryItems.map(({name, quantity, unit}) => ({name, quantity, unit})),
                healthGoal,
                userPrompt
            });
            setRecipeIdeas(result.recipes);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate recipe ideas. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }
    
    const handlePreviewRecipe = async (idea: RecipeIdea) => {
        setSelectedIdea(idea);
        setPreviewLoading(true);
        try {
            const fullRecipe = await generateRecipe({ prompt: `a detailed recipe for "${idea.name}" that is easy to follow` });
            setPreviewRecipe(fullRecipe);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Preview Failed',
                description: 'Could not generate the full recipe preview.',
            });
            setSelectedIdea(null);
        } finally {
            setPreviewLoading(false);
        }
    }

    const handleSaveRecipe = async () => {
        if(!user || !previewRecipe) return;
        setSavingRecipe(previewRecipe.name);
        try {
            await addRecipe(user.id, previewRecipe);
            toast({
                title: 'Recipe Saved!',
                description: `"${previewRecipe.name}" has been added to your recipes.`,
            });
            setSelectedIdea(null); 
            setPreviewRecipe(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save the full recipe details.',
            });
        } finally {
            setSavingRecipe(null);
        }
    }
    
    const expiringItems = pantryItems.filter(item => item.daysUntilExpiry <= 7);
    
    const ingredientsNeeded = useMemo(() => {
        if (!previewRecipe) return { needed: 0, newIngredients: [] };
        
        const pantryItemNames = new Set(pantryItems.map(i => i.name.toLowerCase()));
        
        const requiredIngredients = previewRecipe.ingredients
            .split('\n')
            .map(line => line.replace(/^-/,'').trim().toLowerCase())
            .filter(Boolean);

        const newIngredients = requiredIngredients.filter(req => {
            return !Array.from(pantryItemNames).some(pantryItem => req.includes(pantryItem));
        });

        return {
            needed: newIngredients.length,
            newIngredients,
        };
    }, [previewRecipe, pantryItems]);


    return (
        <div className="space-y-4">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Flame /> Your Pantry</CardTitle>
                            <CardDescription>Generate recipes based on your pantry items.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pantryItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {pantryItems.map(item => (
                                        <li key={item.id} className="flex justify-between items-center">
                                            <span>{item.name}</span>
                                            {item.daysUntilExpiry <= 7 && (
                                                <Badge variant={item.daysUntilExpiry < 1 ? 'destructive' : 'secondary'}>
                                                    {item.daysUntilExpiry < 0 ? 'Expired' : item.daysUntilExpiry === 0 ? 'Today' : `in ${item.daysUntilExpiry}d`}
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">Your pantry is fresh!</p>
                            )}
                        </CardContent>
                    </Card>
                    <Alert>
                        <ChefHat className="h-4 w-4" />
                        <AlertTitle>Your Health Goal</AlertTitle>
                        <AlertDescription>
                            {healthGoal ? `The AI will generate recipes to help you "${healthGoal}".` : 'Set a health goal in your settings for better recommendations.'}
                        </AlertDescription>
                    </Alert>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Recipe Idea Generator</CardTitle>
                            <CardDescription>Generate recipe ideas based on your pantry items, health goal, and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className='space-y-2'>
                                <Label htmlFor='user-prompt'>What are you in the mood for?</Label>
                                <Textarea 
                                    id='user-prompt'
                                    placeholder='e.g., "a quick and easy lunch", "something spicy", "a vegetarian pasta dish"'
                                    value={userPrompt}
                                    onChange={e => setUserPrompt(e.target.value)}
                                />
                             </div>
                             <Button onClick={handleGenerateRecipes} disabled={loading || pantryItems.length === 0}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                {pantryItems.length === 0 ? 'Add items to your pantry first' : 'Generate Ideas'}
                            </Button>
                            
                            <div className="space-y-4">
                                {loading && (
                                    [...Array(3)].map((_, i) => (
                                        <Card key={i}>
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="h-10 w-10" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-48" />
                                                        <Skeleton className="h-4 w-64" />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))
                                )}
                                {recipeIdeas.length > 0 && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {recipeIdeas.map((idea) => (
                                            <Card key={idea.name} onClick={() => handlePreviewRecipe(idea)} className="cursor-pointer hover:shadow-lg transition-shadow">
                                                <CardHeader>
                                                    <CardTitle className="flex items-start gap-3">
                                                        <span className="text-2xl pt-1">{idea.emoji}</span>
                                                        <span>{idea.name}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                 {!loading && recipeIdeas.length === 0 && (
                                    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
                                        <CookingPot className="h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 font-semibold">Ready to cook?</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Add a description above and click the button to generate some creative recipe ideas!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

             <Dialog open={!!selectedIdea} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedIdea(null); setPreviewRecipe(null); } }}>
                <DialogContent className="max-w-4xl">
                    {previewLoading ? (
                         <div className="flex flex-col items-center justify-center h-96">
                            <DialogHeader>
                                <DialogTitle>Generating Full Recipe...</DialogTitle>
                            </DialogHeader>
                            <Loader2 className="h-12 w-12 animate-spin text-primary mt-8" />
                            <p className="mt-4 text-muted-foreground">Please wait a moment.</p>
                        </div>
                    ) : previewRecipe ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl flex items-center gap-4">
                                <span>{previewRecipe.emoji}</span>
                                <span>{previewRecipe.name}</span>
                                </DialogTitle>
                                <DialogDescription>{previewRecipe.description}</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>New Ingredients Needed: {ingredientsNeeded.needed}</AlertTitle>
                                    <AlertDescription>
                                        {ingredientsNeeded.needed > 0
                                        ? `You may need to buy these: ${ingredientsNeeded.newIngredients.join(', ')}`
                                        : "You have all the core ingredients in your pantry!"}
                                    </AlertDescription>
                                </Alert>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    {previewRecipe.prepTime && <span>Prep: {previewRecipe.prepTime}</span>}
                                    {previewRecipe.cookTime && <span>Cook: {previewRecipe.cookTime}</span>}
                                    {previewRecipe.totalTime && <span>Total: {previewRecipe.totalTime}</span>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div>
                                    <h3 className="font-headline font-bold mb-2 text-lg">Ingredients</h3>
                                    <div className="text-sm whitespace-pre-line">{previewRecipe.ingredients}</div>
                                    </div>
                                    <div>
                                    <h3 className="font-headline font-bold mb-2 text-lg">Instructions</h3>
                                    <div className="text-sm whitespace-pre-line">{previewRecipe.instructions}</div>
                                    </div>
                                </div>
                                </div>
                                <DialogFooter>
                                    <Button 
                                        onClick={handleSaveRecipe}
                                        disabled={savingRecipe === previewRecipe.name}
                                    >
                                        {savingRecipe === previewRecipe.name ? (
                                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Bookmark className="mr-2 h-4 w-4" />
                                        )}
                                        Save Full Recipe
                                    </Button>
                                </DialogFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96">
                            <DialogHeader>
                                <DialogTitle>Error</DialogTitle>
                                <DialogDescription>Could not load recipe preview.</DialogDescription>
                            </DialogHeader>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}


export default function RecipesPage() {
  const { user } = useAuth();
  
  if (!user) {
      return (
          <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
              <Loader2 className="mx-auto h-12 w-12 animate-spin" />
          </main>
      )
  }

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold">
          Recipes
        </h2>
      </div>

      <Tabs defaultValue="cookbook" className="space-y-4">
        <TabsList>
            <TabsTrigger value="cookbook">My Cookbook</TabsTrigger>
            <TabsTrigger value="ai-generator">AI Recipe Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="cookbook">
            <MyCookbookTab user={user} />
        </TabsContent>
        <TabsContent value="ai-generator">
            <AiGeneratorTab user={user} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
