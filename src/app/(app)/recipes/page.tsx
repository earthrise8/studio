
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
import { getRecipes, deleteRecipe } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { ChefHat, Trash2, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
        <Button asChild>
            <Link href="/ai-recipes">
                <ChefHat className="mr-2 h-4 w-4" />
                Get Recipe Ideas
            </Link>
        </Button>
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
              <DialogContent className="max-w-2xl">
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
                  <div>
                    <h3 className="font-headline font-bold mb-2 text-lg">Ingredients</h3>
                    <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: recipe.ingredients }}></div>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold mb-2 text-lg">Instructions</h3>
                    <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: recipe.instructions }}></div>
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
              {searchTerm ? `No recipes match "${searchTerm}".` : "Use the AI Recipe page to generate and save new recipes."}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
