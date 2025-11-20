
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

const createAnonymousUser = (): User => {
    let anonId = localStorage.getItem('anonymousUserId');
    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('anonymousUserId', anonId);
    }
    return {
        id: anonId,
        email: 'anonymous@example.com',
        name: 'Guest',
        profile: {
            dailyCalorieGoal: 2000,
            healthGoal: 'Get started with Fitropolis',
            totalPoints: 0,
            money: 1000,
            level: 0,
            cityName: 'My Fitropolis',
            avatarUrl: `https://i.pravatar.cc/150?u=anonymous`,
        },
    };
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
        setUser(appUser);
      } else {
        // If not logged in, set up an anonymous user
        const anonUser = createAnonymousUser();
        setUser(anonUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (user && user.id.startsWith('anon_')) return; // No refreshing for anonymous user

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
    // When signing in, we want to clear any anonymous user ID
    // so a new one isn't picked up on reload.
    localStorage.removeItem('anonymousUserId');
    await signInWithRedirect(auth, googleProvider);
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    // After signing out, create a new anonymous session.
    const anonUser = createAnonymousUser();
    setUser(anonUser);
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser, signIn, signOut }}>
        {loading ? (
             <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : children}
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
