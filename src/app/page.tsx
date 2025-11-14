
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/components/logo';
import { useAuth } from '@/lib/auth-provider';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Explicitly redirect after successful login
      router.push('/dashboard');
    } catch (error) {
      // Don't show an error if the user closes the popup manually
      if ((error as any).code !== 'auth/popup-closed-by-user') {
          console.error("Error during sign-in:", error);
      }
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  // If user is already logged in, redirect them
  if (user) {
    router.push('/dashboard');
    return (
         <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Logo />
          <nav className="flex items-center gap-4">
              <Button onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container relative flex-col items-center justify-center pt-16 md:pt-24 lg:pt-32">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 text-center sm:w-[600px]">
            <h1 className="font-headline text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Your AI Health & Nutrition Partner
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              Welcome to Fitropolis. Manage your food, track your fitness, and
              achieve your goals with a personalized AI assistant.
            </p>
          </div>
          <div className="flex w-full items-center justify-center space-x-4 py-8 md:py-12">
            <Button size="lg" onClick={handleLogin}>Get Started</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
