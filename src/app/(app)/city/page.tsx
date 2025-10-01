
'use client';

import { generateCityScape } from '@/ai/flows/generate-city-scape';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { Building, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const getCityLevel = (points: number) => {
    if (points < 100) return 0;
    if (points < 500) return 100;
    if (points < 1000) return 500;
    if (points < 2000) return 1000;
    return 2000;
}

export default function CityPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [cityGrid, setCityGrid] = useState<string[][] | null>(null);
    const [loading, setLoading] = useState(true);
    const [cityLevel, setCityLevel] = useState(0);

    const getCachedGrid = useCallback((level: number) => {
        if (!user) return null;
        const cached = localStorage.getItem(`city-grid-${user.id}-${level}`);
        return cached ? JSON.parse(cached) : null;
    }, [user]);

    const handleGenerateCity = useCallback(async (forceRefresh = false) => {
        if (!user) return;
        
        const currentLevel = getCityLevel(user.profile.totalPoints || 0);
        setCityLevel(currentLevel);

        if (!forceRefresh) {
            const cachedGrid = getCachedGrid(currentLevel);
            if (cachedGrid) {
                setCityGrid(cachedGrid);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        try {
            const result = await generateCityScape({ points: currentLevel });
            setCityGrid(result.grid);
            localStorage.setItem(`city-grid-${user.id}-${currentLevel}`, JSON.stringify(result.grid));
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'City Generation Failed',
                description: 'Could not generate your city. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast, getCachedGrid]);

    useEffect(() => {
        if (user) {
            handleGenerateCity();
        }
    }, [user, handleGenerateCity]);

    return (
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold">
                Your Fitropolis
            </h2>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Building />
                        City Level: {user?.profile.totalPoints || 0}
                    </CardTitle>
                    <CardDescription>
                        Your city grows as you earn points! A new stage is generated at key milestones.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="w-full rounded-lg border bg-muted flex items-center justify-center p-4 overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground h-64 justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p>Constructing your glorious city...</p>
                            </div>
                        ) : cityGrid ? (
                           <div className="font-mono text-center text-sm leading-relaxed whitespace-pre">
                             {cityGrid.map((row, y) => (
                                <div key={y} className="flex">
                                    {row.map((cell, x) => (
                                        <span key={x}>{cell}</span>
                                    ))}
                                </div>
                             ))}
                           </div>
                        ) : (
                             <div className="flex flex-col items-center gap-4 text-muted-foreground h-64 justify-center">
                                <Building className="h-12 w-12" />
                                <p>Start earning points to build your city!</p>
                            </div>
                        )}
                    </div>
                     <Button onClick={() => handleGenerateCity(true)} disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Regenerate City
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
