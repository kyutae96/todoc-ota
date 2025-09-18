
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export type Role = 'manager' | 'admin' | 'unauthorized';

interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  organization?: string;
  role: Role;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: Role;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, organization: string) => Promise<void>;
  logout: () => void;
  UserAvatar: React.FC<{className?: string}>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = 'kyutae0523@to-doc.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role>('unauthorized');
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || 'unauthorized';
          
          setUser({
            uid: firebaseUser.uid,
            name: userData.name || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            organization: userData.organization,
            role: role,
          });
          setUserRole(role);

      } else {
          // This case handles users created in Auth but not yet in Firestore.
          const isOwner = firebaseUser.email === OWNER_EMAIL;
          const newUserRole = isOwner ? 'admin' : 'unauthorized';
          const newUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              role: newUserRole,
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), { 
              email: newUser.email,
              name: newUser.name,
              avatar: newUser.avatar,
              role: newUserRole
          });

          setUser(newUser);
          setUserRole(newUserRole);
      }
    } else {
      setUser(null);
      setUserRole('unauthorized');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fetchUserData);
    return () => unsubscribe();
  }, [fetchUserData]);

  const refreshUser = useCallback(async () => {
    await fetchUserData(auth.currentUser);
  }, [fetchUserData]);

  const login = async (email: string, pass: string): Promise<void> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        // Special check for owner email on login
        if (userData.email === OWNER_EMAIL && userData.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
        }
    } else {
        // This handles a case where a user exists in Auth but not in Firestore.
        const isOwner = firebaseUser.email === OWNER_EMAIL;
        const newUserRole = isOwner ? 'admin' : 'unauthorized';
        await setDoc(userDocRef, {
            email: firebaseUser.email,
            name: isOwner ? '김규태' : (firebaseUser.email?.split('@')[0] || 'New User'),
            organization: isOwner ? '토닥' : undefined,
            avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            role: newUserRole
        });
    }
  };
  
  const signup = async (email: string, pass: string, name: string, organization: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    const isOwner = firebaseUser.email === OWNER_EMAIL;
    const newUserRole = isOwner ? 'admin' : 'unauthorized';

    const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: isOwner ? '김규태' : name,
        organization: isOwner ? '토닥' : organization,
        avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        role: newUserRole
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const UserAvatar: React.FC<{className?: string}> = ({className}) => {
    if (!user) return <Skeleton className={className} />;
    return (
      <Avatar className={className}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
    );
  }
  
  const value: AuthContextType = useMemo(() => ({
    isAuthenticated, 
    user, 
    userRole, 
    login, 
    signup,
    logout, 
    UserAvatar, 
    isLoading,
    refreshUser
  }), [isAuthenticated, user, userRole, isLoading, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
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

const adminRoutes = ['/dashboard/users'];

// A HOC to protect routes
export function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading, userRole, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
          router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (!isAuthenticated) {
        return null; // or a loading spinner, as the useEffect will redirect
    }

    if (userRole === 'unauthorized') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Awaiting Approval</h1>
                <p className="text-muted-foreground mb-8">Your account has been created and is waiting for administrator approval.</p>
                <Button onClick={logout}>
                    Log Out
                </Button>
            </div>
        )
    }

    // Final check for admin routes
    if (userRole !== 'admin' && adminRoutes.some(route => pathname.startsWith(route))) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem-1px)]">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return <Component {...props} />;
  };
}
