

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithRedirect, getRedirectResult, User as AuthUser } from 'firebase/auth';
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
    let anonId: string | null = null;
    if(typeof window !== 'undefined') {
        anonId = localStorage.getItem('anonymousUserId');
    }
    
    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        if (typeof window !== 'undefined') {
            localStorage.setItem('anonymousUserId', anonId);
        }
    }
    const defaultUser = getOrCreateUser(anonId, 'Guest', 'anonymous@example.com');
    // For anonymous users, we can directly manipulate the default object as it's not from a real backend
    return defaultUser as User;
};

const fetchUser = async (firebaseUser: AuthUser): Promise<User> => {
    const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);

    // Merge data from anonymous session if it exists
    if(typeof window !== 'undefined') {
        const anonId = localStorage.getItem('anonymousUserId');
        if (anonId) {
            // In a real app, you'd have a backend flow for this.
            // Here, we simulate it by checking local storage for anon data.
            const anonUser = await getOrCreateUser(anonId, 'Guest', 'anonymous@example.com');
            
            // A simple merge: if the real user's data is default, use the anon data.
            // This is a basic example. A real app might have a more complex merge strategy.
            let needsUpdate = false;
            if(appUser.profile.totalPoints === 0 && anonUser.profile.totalPoints > 0) {
                appUser.profile.totalPoints = anonUser.profile.totalPoints;
                needsUpdate = true;
            }
             if(appUser.profile.money === 1000 && anonUser.profile.money > 1000) {
                appUser.profile.money = anonUser.profile.money;
                needsUpdate = true;
            }
            if(!appUser.profile.cityGrid && anonUser.profile.cityGrid) {
                appUser.profile.cityGrid = anonUser.profile.cityGrid;
                needsUpdate = true;
            }
            
            // If we merged data, update the user in storage
            if (needsUpdate) {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                users[appUser.id] = appUser;
                localStorage.setItem('users', JSON.stringify(users));
            }

            // Clean up anonymous data after migration
            localStorage.removeItem('anonymousUserId');
            // In a real app, you would also delete the anon user's data from storage.
        }
    }
    
    return appUser;
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
        const appUser = await fetchUser(firebaseUser);
        setUser(appUser);
      } else {
        const anonUser = createAnonymousUser();
        setUser(anonUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Handle redirect result from Google Sign-In
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const appUser = await fetchUser(result.user);
          setUser(appUser);
          setLoading(false);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
        setLoading(false);
      }
    };
    handleRedirect();
  }, [router]);

  const refreshUser = async () => {
    if (user && !user.id.startsWith('anon_')) {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            setLoading(true);
            const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
            setUser(appUser);
            setLoading(false);
        }
    } else if (user) {
        // For anonymous users, "refresh" means getting the latest from localStorage
        const anonUser = await getOrCreateUser(user.id, 'Guest', 'anonymous@example.com');
        setUser(anonUser);
    }
  };

  const signIn = async () => {
    setLoading(true);
    await signInWithRedirect(auth, googleProvider);
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(createAnonymousUser());
    router.push('/');
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
