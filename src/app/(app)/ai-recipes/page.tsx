
'use client';

import { generatePantryRecipes } from '@/ai/flows/generate-pantry-recipes';
import { generateRecipe } from '@/ai/flows/generate-recipe';
import { addRecipe, getPantryItems } from '@/lib/data';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PantryItem, Recipe } from '@/lib/types';
import { Flame, CookingPot, ChefHat, Sparkles, Loader2, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type RecipeIdea = {
    name: string;
    description: string;
    emoji: string;
}

export default function AiRecipesPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [healthGoal, setHealthGoal] = useState('');
    const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingRecipe, setSavingRecipe] = useState<string | null>(null);
    const [userPrompt, setUserPrompt] = useState('');

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

    const handleSaveRecipe = async (idea: RecipeIdea) => {
        if(!user) return;
        setSavingRecipe(idea.name);
        try {
            const fullRecipe = await generateRecipe({ prompt: `a detailed recipe for "${idea.name}" that is easy to follow` });
            await addRecipe(user.id, fullRecipe);
            toast({
                title: 'Recipe Saved!',
                description: `"${fullRecipe.name}" has been added to your recipes.`,
                action: <Button asChild variant="secondary"><Link href="/recipes">View Recipes</Link></Button>
            });
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

    return (
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold">AI Recipes</h2>
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
                            <CardTitle className="font-headline">Recipe Ideas</CardTitle>
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
                                            <Card key={idea.name}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-start gap-3">
                                                        <span className="text-2xl pt-1">{idea.emoji}</span>
                                                        <span>{idea.name}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleSaveRecipe(idea)}
                                                        disabled={savingRecipe === idea.name}
                                                    >
                                                        {savingRecipe === idea.name ? (
                                                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Bookmark className="mr-2 h-4 w-4" />
                                                        )}
                                                        Save Full Recipe
                                                    </Button>
                                                </CardFooter>
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
        </main>
    )
}
