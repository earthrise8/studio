
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/actions';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();


  const checkUser = useCallback(async () => {
    // Public pages that don't require loading the user
    const publicPaths = ['/login', '/signup', '/'];
    if (publicPaths.includes(pathname)) {
        setLoading(false);
        setUser(null); // Ensure user is null on public pages
        return;
    }

    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        // If not on a public path and no user, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch current user', error);
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);
  
  const refreshUser = async () => {
    await checkUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
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
