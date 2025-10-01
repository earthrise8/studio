
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { getUser } from '@/lib/data';

// Mock user for public access
const mockUser: User = {
    id: 'user123',
    email: 'dylan.kwok@example.com',
    name: 'Dylan Kwok',
    profile: {
      dailyCalorieGoal: 2200,
      healthGoal: 'Stay healthy and active',
      age: 30,
      height: 178,
      weight: 75,
      activityLevel: 'moderate',
      avatarUrl: 'https://i.pravatar.cc/150?u=dylan'
    },
};

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

  const loadUser = useCallback(async () => {
    setLoading(true);
    const storedUser = await getUser(mockUser.id);
    setUser(storedUser || mockUser);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refreshUser = async () => {
    await loadUser();
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
