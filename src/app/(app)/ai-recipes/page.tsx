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

type RecipeIdea = {
    name: string;
    description: string;
    emoji: string;
}

export default function AiRecipesPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
    const [healthGoal, setHealthGoal] = useState('');
    const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingRecipe, setSavingRecipe] = useState<string | null>(null);

    useEffect(() => {
        if(user) {
            setHealthGoal(user.profile?.healthGoal || '');
            getPantryItems(user.id).then(items => {
                const expiring = items
                    .map(item => ({...item, daysUntilExpiry: differenceInDays(new Date(item.expirationDate), new Date())}))
                    .filter(item => item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 7)
                    .sort((a,b) => a.daysUntilExpiry - b.daysUntilExpiry);
                setExpiringItems(expiring);
            });
        }
    }, [user]);

    const handleGenerateRecipes = async () => {
        if (!user) return;
        setLoading(true);
        setRecipeIdeas([]);
        try {
            const result = await generatePantryRecipes({
                pantryItems: expiringItems.map(({name, quantity, unit}) => ({name, quantity, unit})),
                healthGoal
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
            const fullRecipe = await generateRecipe({ prompt: `a detailed recipe for "${idea.name}"` });
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

    return (
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight">AI Recipes</h2>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Flame /> Expiring Soon</CardTitle>
                            <CardDescription>Use these items before they go bad.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expiringItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {expiringItems.map(item => (
                                        <li key={item.id} className="flex justify-between items-center">
                                            <span>{item.name}</span>
                                            <Badge variant={item.daysUntilExpiry < 1 ? 'destructive' : 'secondary'}>
                                                {item.daysUntilExpiry === 0 ? 'Today' : `in ${item.daysUntilExpiry}d`}
                                            </Badge>
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
                            <CardDescription>Generate recipe ideas based on your expiring items and health goal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Button onClick={handleGenerateRecipes} disabled={loading || expiringItems.length === 0}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                {expiringItems.length === 0 ? 'Add expiring items to pantry' : 'Generate Ideas'}
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
                                        <p className="text-sm text-muted-foreground mt-1">Click the button to generate some creative recipe ideas!</p>
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
