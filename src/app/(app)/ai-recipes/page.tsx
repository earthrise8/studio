
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AiRecipesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/recipes?tab=ai-generator');
    }, [router]);

    return (
        <main className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Redirecting to the new Recipes page...</p>
            </div>
       </main>
    );
}
