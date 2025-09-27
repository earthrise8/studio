
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import Link from 'next/link';
import { KeyRound, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function SignupSuccessContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            toast({ title: "Copied to clipboard!" });
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (!code) {
        return (
             <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-2 font-headline">Something went wrong</h1>
                <p className="text-muted-foreground mb-6">
                    We couldn't create your account. Please try again.
                </p>
                <Button asChild className="w-full">
                    <Link href="/signup">
                        Back to Signup
                    </Link>
                </Button>
            </div>
        )
    }

  return (
    <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2 font-headline">Your Account is Ready!</h1>
        <p className="text-muted-foreground mb-6">
          Welcome to Fitropolis! Here is your unique Access Code. 
          <strong className="text-foreground"> Please save it in a safe place.</strong> You will need it to log in.
        </p>

        <Card className="text-left mb-6">
            <CardHeader>
                <CardTitle>Your Access Code</CardTitle>
                <CardDescription>This is the only way to access your account. Do not lose it.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted">
                    <pre className="font-mono text-lg text-primary font-bold">{code}</pre>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-4">
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    Go to Your Dashboard
                </Link>
            </Button>
        </div>
      </div>
  )
}

export default function SignupSuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <SignupSuccessContent />
            </Suspense>
        </div>
    )
}
