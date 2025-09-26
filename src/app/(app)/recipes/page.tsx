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
  DialogFooter
} from '@/components/ui/dialog';
import { getRecipes } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { ChefHat, PlusCircle, Trash2, Link as LinkIcon, Loader2, Sparkles, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { importRecipeFromUrl } from '@/ai/flows/import-recipe-from-url';
import { generateRecipe } from '@/ai/flows/generate-recipe';
import { useToast } from '@/hooks/use-toast';
import { addRecipe } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const importSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

const generateSchema = z.object({
    prompt: z.string().min(10, { message: 'Please describe the recipe you want to create (min. 10 characters).' }),
});

function ImportRecipeDialog({ onRecipeAdd }: { onRecipeAdd: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: { url: '' },
  });

  async function onSubmit(values: z.infer<typeof importSchema>) {
    if(!user) return;

    setLoading(true);
    try {
      const recipeDetails = await importRecipeFromUrl({ url: values.url });
      await addRecipe(user.id, {
        name: recipeDetails.name,
        description: recipeDetails.description || 'Imported recipe',
        ingredients: recipeDetails.ingredients,
        instructions: recipeDetails.instructions,
        prepTime: recipeDetails.prepTime,
        cookTime: recipeDetails.cookTime,
        totalTime: recipeDetails.totalTime
      });
      toast({
        title: 'Recipe Imported!',
        description: `Successfully imported "${recipeDetails.name}".`,
      });
      onRecipeAdd();
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not import recipe from the provided URL.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline">
                <LinkIcon className="mr-2 h-4 w-4" />
                Import from URL
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Import Recipe from URL</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="url" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipe URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/recipe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Recipe
                    </Button>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}

function GenerateRecipeDialog({ onRecipeAdd }: { onRecipeAdd: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof generateSchema>>({
      resolver: zodResolver(generateSchema),
      defaultValues: { prompt: '' },
    });
  
    async function onSubmit(values: z.infer<typeof generateSchema>) {
      if(!user) return;
  
      setLoading(true);
      try {
        const recipeDetails = await generateRecipe({ prompt: values.prompt });
        await addRecipe(user.id, {
          name: recipeDetails.name,
          description: recipeDetails.description || 'Generated recipe',
          ingredients: recipeDetails.ingredients,
          instructions: recipeDetails.instructions,
          prepTime: recipeDetails.prepTime,
          cookTime: recipeDetails.cookTime,
          totalTime: recipeDetails.totalTime
        });
        toast({
          title: 'Recipe Generated!',
          description: `Successfully created "${recipeDetails.name}".`,
        });
        onRecipeAdd();
        form.reset();
        setOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate a recipe. Please try a different prompt.',
        });
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
              <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
              </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Generate Recipe with AI</DialogTitle>
                  <DialogDescription>Describe the kind of recipe you'd like to create.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="prompt" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Recipe Idea</FormLabel>
                              <FormControl>
                                  <Textarea placeholder="e.g., A quick and healthy vegan pasta salad for lunch" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate
                        </Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
    )
  }


export default function RecipesPage() {
  const { user } = useAuth();
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

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) return recipes;
    return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          My Recipes
        </h2>
        <div className="flex gap-2">
            <ImportRecipeDialog onRecipeAdd={fetchRecipes} />
            <GenerateRecipeDialog onRecipeAdd={fetchRecipes} />
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
              <Skeleton className="h-48 w-full" />
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Dialog key={recipe.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/600/400`}
                      alt={recipe.name}
                      fill
                      className="object-cover rounded-t-lg"
                      data-ai-hint="food recipe"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {recipe.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{recipe.name}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                  <div className="relative h-64 w-full my-4">
                     <Image
                      src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/600/400`}
                      alt={recipe.name}
                      fill
                      className="object-cover rounded-lg"
                      data-ai-hint="food recipe"
                    />
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground my-4">
                    {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
                    {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
                    {recipe.totalTime && <span>Total: {recipe.totalTime}</span>}
                  </div>
                  <h3 className="font-headline font-bold mt-4 mb-2 text-lg">Ingredients</h3>
                  <p className="whitespace-pre-wrap">{recipe.ingredients}</p>
                  <h3 className="font-headline font-bold mt-4 mb-2 text-lg">Instructions</h3>
                  <p className="whitespace-pre-wrap">{recipe.instructions}</p>
                </div>
                <Button variant="destructive" className="mt-4">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Recipe
                </Button>
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
              {searchTerm ? `No recipes match "${searchTerm}".` : "Generate or import recipes to get started."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
