
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

  useEffect(() => {
    const isDemoMode = searchParams.get('demo') === 'true';

    // If we're entering demo mode, set the user immediately and finish.
    if (isDemoMode && user?.id !== 'demo-user') {
      setUser(demoUser);
      setLoading(false);
      // We explicitly return here to avoid the auth state listener logic below.
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If we're in a demo session, don't process Google auth state changes.
      if (user?.id === 'demo-user') {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // We only want this to run on mount or when the demo param changes, not when user state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (loading) return;

    const isAppRoute = /^\/(dashboard|pantry|shopping-cart|logs|recipes|advisor|friends|awards|wiki|settings)/.test(pathname);
    
    // If there's no user on a protected route, redirect to home.
    if (!user && isAppRoute) {
      router.push('/');
    }
    
    // If a real user is logged in, redirect from home to dashboard.
    if (user && user.id !== 'demo-user' && pathname === '/') {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

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
    // If in demo mode, clear the demo user before signing in.
    if (user?.id === 'demo-user') {
      setUser(null);
    }
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
      router.push('/');
    }
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
