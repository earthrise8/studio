
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from '@/lib/types';
import { getOrCreateUser } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
      setUser(appUser);
    } else {
      setUser(null);
      // If user logs out, redirect to landing page if they are not already there.
      if (pathname !== '/') {
        router.push('/');
      }
    }
    setLoading(false);
  }, [router, pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoading(true);
      const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
      setUser(appUser);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/');
  }

  // This prevents showing a protected page for a split second before redirecting.
  if (loading && pathname !== '/') {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  // If not loading and no user, but trying to access a protected route, redirect.
  if (!loading && !user && pathname !== '/') {
      router.push('/');
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser, signOut }}>
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
