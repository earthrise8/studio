
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithRedirect } from 'firebase/auth';
import type { User } from '@/lib/types';
import { getOrCreateUser } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUser: User = {
    id: 'demo-user',
    email: 'demo@example.com',
    name: 'Demo User',
    profile: {
        dailyCalorieGoal: 2000,
        healthGoal: 'Try out Fitropolis',
        totalPoints: 50,
        money: 1000,
        level: 1,
        cityName: 'Demo City',
        avatarUrl: `https://i.pravatar.cc/150?u=demo`,
    },
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
        setUser(appUser);
        setLoading(false);
      } else if (isDemoMode) {
        setUser(demoUser);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If a real user is logged in, redirect to dashboard if they land on the home page.
        if (pathname === '/' && user.id !== 'demo-user') {
          router.push('/dashboard');
        }
      } else {
        // If no user (and not entering demo mode), redirect to home if on a protected route.
        const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/pantry') || pathname.startsWith('/logs') || pathname.startsWith('/recipes') || pathname.startsWith('/advisor') || pathname.startsWith('/friends') || pathname.startsWith('/awards') || pathname.startsWith('/settings') || pathname.startsWith('/shopping-cart') || pathname.startsWith('/wiki');
        if (isAppRoute && !isDemoMode) {
          router.push('/');
        }
      }
    }
  }, [user, loading, pathname, router, isDemoMode]);

  const refreshUser = async () => {
    if (user?.id === 'demo-user') return; // No refreshing for demo user

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoading(true);
      const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
      setUser(appUser);
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    await signInWithRedirect(auth, googleProvider);
  }

  const signOut = async () => {
    if (user?.id === 'demo-user') {
      setUser(null);
      router.push('/');
    } else {
      await firebaseSignOut(auth);
      setUser(null);
      // The useEffect hook will handle redirecting to '/'
    }
  }

  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
