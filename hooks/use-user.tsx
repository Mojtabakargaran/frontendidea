'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/role-utils';

interface UserInfo {
  userId: string;
  tenantId: string;
  email: string;
  fullName: string;
  roleName: UserRole;
  permissions: string[];
  sessionExpiresAt: string;
}

interface UserContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = user !== null;

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Try to get user info from session storage or API
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Check if session is still valid
        const expiresAt = new Date(userData.sessionExpiresAt);
        if (expiresAt > new Date()) {
          setUser(userData);
        } else {
          // Session expired, clear data
          sessionStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetUser = (userData: UserInfo | null) => {
    setUser(userData);
    
    if (userData) {
      // Store user data in session storage
      sessionStorage.setItem('user', JSON.stringify(userData));
    } else {
      // Clear user data
      sessionStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    setUser: handleSetUser,
    logout,
    isLoading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
