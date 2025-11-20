
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithRedirect, getRedirectResult, User as AuthUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import { getOrCreateUser, updateUserProfile } from '@/lib/data';
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

const fetchUserAndMigrateData = async (firebaseUser: AuthUser): Promise<User> => {
    const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);

    // Merge data from anonymous session if it exists
    if(typeof window !== 'undefined') {
        const anonId = localStorage.getItem('anonymousUserId');
        if (anonId) {
            // In a real app, you'd have a backend flow for this.
            // Here, we simulate it by checking local storage for anon data.
            const anonUser = await getOrCreateUser(anonId, 'Guest', 'anonymous@example.com');
            
            let needsUpdate = false;
            const profileUpdates: Partial<User['profile']> = {};

            if ((appUser.profile.totalPoints || 0) <= (anonUser.profile.totalPoints || 0) && (anonUser.profile.totalPoints || 0) > 0) {
                profileUpdates.totalPoints = anonUser.profile.totalPoints;
                needsUpdate = true;
            }
            if ((appUser.profile.money || 0) <= (anonUser.profile.money || 0) && (anonUser.profile.money || 0) > 1000) {
                profileUpdates.money = anonUser.profile.money;
                needsUpdate = true;
            }
            if (!appUser.profile.cityGrid && anonUser.profile.cityGrid) {
                profileUpdates.cityGrid = anonUser.profile.cityGrid;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await updateUserProfile(appUser.id, { profile: profileUpdates });
                
                // Clean up anonymous data after migration
                localStorage.removeItem(`city-grid-${anonId}`);
                localStorage.removeItem(`game-start-date-${anonId}`);
                localStorage.removeItem(`last-revenue-update-${anonId}`);
                localStorage.removeItem('anonymousUserId');
                 // In a real app, you would also delete the anon user's data from storage.
            }
             // Get the fresh user object after potential update
            const finalUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
            return finalUser;
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
  
  // Handle redirect result from Google Sign-In on initial load
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          // A user has just signed in via redirect. Fetch/create their data.
          const appUser = await fetchUserAndMigrateData(result.user);
          setUser(appUser);
          router.push('/dashboard');
        } else {
           // No redirect result, proceed with normal auth state check
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
              if (firebaseUser) {
                const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);
                setUser(appUser);
              } else {
                const anonUser = createAnonymousUser();
                setUser(anonUser);
              }
            });
            return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error handling auth state:", error);
         // Fallback to anonymous user on error
        setUser(createAnonymousUser());
      } finally {
        setLoading(false);
      }
    };
    handleRedirect();
  }, [router]);


  const refreshUser = useCallback(async () => {
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
  }, [user]);

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
