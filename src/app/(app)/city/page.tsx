
'use client';

import { generateCityScape } from '@/ai/flows/generate-city-scape';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { Building, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

const getCityLevel = (points: number) => {
    return Math.floor(points / 100) * 100;
}

export default function CityPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [cityImageUrl, setCityImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [cityLevel, setCityLevel] = useState(0);

    const getCachedImage = useCallback((level: number) => {
        if (!user) return null;
        const cachedImage = localStorage.getItem(`city-image-${user.id}-${level}`);
        return cachedImage;
    }, [user]);

    const handleGenerateCity = useCallback(async (forceRefresh = false) => {
        if (!user) return;
        
        const currentLevel = getCityLevel(user.profile.totalPoints || 0);
        setCityLevel(currentLevel);

        if (!forceRefresh) {
            const cachedImage = getCachedImage(currentLevel);
            if (cachedImage) {
                setCityImageUrl(cachedImage);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        try {
            const result = await generateCityScape({ points: currentLevel });
            setCityImageUrl(result.imageUrl);
            localStorage.setItem(`city-image-${user.id}-${currentLevel}`, result.imageUrl);
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
    }, [user, toast, getCachedImage]);

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
                        City Level: {cityLevel}
                    </CardTitle>
                    <CardDescription>
                        Your city grows as you earn points! A new stage is generated every 100 points.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p>Generating your glorious city...</p>
                            </div>
                        ) : cityImageUrl ? (
                            <Image
                                src={cityImageUrl}
                                alt={`Fitropolis at ${cityLevel} points`}
                                width={1280}
                                height={720}
                                className="rounded-md object-contain"
                            />
                        ) : (
                             <div className="flex flex-col items-center gap-4 text-muted-foreground">
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
