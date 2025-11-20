
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signOut as firebaseSignOut, 
    signInWithRedirect, 
    getRedirectResult, 
    User as AuthUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import type { User } from '@/lib/types';
import { getOrCreateUser, updateUserProfile } from '@/lib/data';
import type { EmailPassForm, SignUpForm } from '@/components/login-dialog';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (data: SignUpForm) => Promise<AuthUser>;
  signInWithEmail: (data: EmailPassForm) => Promise<AuthUser>;
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
    return defaultUser as User;
};

const fetchUserAndMigrateData = async (firebaseUser: AuthUser): Promise<User> => {
    const appUser = await getOrCreateUser(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email);

    if(typeof window !== 'undefined') {
        const anonId = localStorage.getItem('anonymousUserId');
        if (anonId) {
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
                
                localStorage.removeItem(`city-grid-${anonId}`);
                localStorage.removeItem(`game-start-date-${anonId}`);
                localStorage.removeItem(`last-revenue-update-${anonId}`);
                localStorage.removeItem('anonymousUserId');
            }
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
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          const appUser = await fetchUserAndMigrateData(result.user);
          setUser(appUser);
          router.push('/dashboard');
        } else {
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
        const anonUser = await getOrCreateUser(user.id, 'Guest', 'anonymous@example.com');
        setUser(anonUser);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    setLoading(true);
    await signInWithRedirect(auth, googleProvider);
  }

  const signUpWithEmail = async (data: SignUpForm) => {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(userCredential.user, { displayName: data.name });
    await fetchUserAndMigrateData(userCredential.user);
    // onAuthStateChanged will handle setting the user
    return userCredential.user;
  };

  const signInWithEmail = async (data: EmailPassForm) => {
    setLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    await fetchUserAndMigrateData(userCredential.user);
    // onAuthStateChanged will handle setting the user
    return userCredential.user;
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(createAnonymousUser());
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut }}>
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
