
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export type Role = 'manager' | 'admin';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: Role;
  setUserRole: (role: Role) => void;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  UserAvatar: React.FC<{className?: string}>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role>('manager');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd check a token in localStorage here
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          name: userRole === 'admin' ? 'Alex Doe (Admin)' : 'Alex Doe',
          email: email,
          avatar: 'https://i.pravatar.cc/150?u=alexdoe',
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const dynamicUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      name: userRole === 'admin' ? 'Alex Doe (Admin)' : 'Alex Doe',
    }
  }, [user, userRole])


  const UserAvatar: React.FC<{className?: string}> = ({className}) => {
    if (!dynamicUser) return <Skeleton className={className} />;
    return (
      <Avatar className={className}>
        <AvatarImage src={dynamicUser.avatar} alt={dynamicUser.name} />
        <AvatarFallback>{dynamicUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: dynamicUser, userRole, setUserRole, login, logout, UserAvatar, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// A HOC to protect routes
export function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    return <Component {...props} />;
  };
}
