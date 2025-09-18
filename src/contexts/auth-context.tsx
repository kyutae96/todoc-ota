
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type Role = 'manager' | 'admin' | 'unauthorized';

interface User {
  uid: string;
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
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  UserAvatar: React.FC<{className?: string}>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = 'kyutae0523@to-doc.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role>('unauthorized');
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || 'unauthorized';

            if (role === 'unauthorized') {
                setUser(null);
            } else {
                 setUser({
                    uid: firebaseUser.uid,
                    name: userData.name || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || '',
                    avatar: userData.avatar || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                });
                setUserRole(role);
            }
        } else {
            // This case should ideally be handled by signup, but as a fallback:
            const isOwner = firebaseUser.email === OWNER_EMAIL;
            const newUserRole = isOwner ? 'admin' : 'unauthorized';
            const newUser: User = {
                uid: firebaseUser.uid,
                name: firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), { 
                email: newUser.email,
                name: newUser.name,
                avatar: newUser.avatar,
                role: newUserRole
            });
            if (newUserRole === 'unauthorized') {
                setUser(null);
                setUserRole('unauthorized');
            } else {
                setUser(newUser);
                setUserRole(newUserRole);
            }
        }
      } else {
        setUser(null);
        setUserRole('unauthorized');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'unauthorized') {
            await signOut(auth);
            throw new Error('Your account has not been approved by an administrator.');
        }
        // Special check for owner email on login
        if (userData.email === OWNER_EMAIL && userData.role !== 'admin') {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        }
    } else {
        // This handles a case where a user exists in Auth but not in Firestore.
        const isOwner = firebaseUser.email === OWNER_EMAIL;
        const newUserRole = isOwner ? 'admin' : 'unauthorized';
        await setDoc(userDocRef, {
            email: firebaseUser.email,
            name: firebaseUser.email?.split('@')[0] || 'New User',
            avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            role: newUserRole
        });
        if (newUserRole === 'unauthorized') {
            await signOut(auth);
            throw new Error('Your account has been created and is pending approval.');
        }
    }
  };
  
  const signup = async (email: string, pass: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    const isOwner = firebaseUser.email === OWNER_EMAIL;
    const newUserRole = isOwner ? 'admin' : 'unauthorized';

    const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.email?.split('@')[0] || 'New User',
        avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        role: newUserRole
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    if (newUserRole === 'unauthorized') {
      await signOut(auth);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const dynamicUser = useMemo(() => {
    if (!user) return null;
    const displayName = user.name || user.email;
    return {
      ...user,
      name: userRole === 'admin' ? `${displayName} (Admin)` : displayName,
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
  
  const value: AuthContextType = { 
    isAuthenticated, 
    user: dynamicUser, 
    userRole, 
    setUserRole, 
    login, 
    signup,
    logout, 
    UserAvatar, 
    isLoading 
  };

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

// A HOC to protect routes
export function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated || userRole === 'unauthorized') {
          router.push('/login');
        }
      }
    }, [isAuthenticated, isLoading, router, userRole]);

    if (isLoading || !isAuthenticated || userRole === 'unauthorized') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    return <Component {...props} />;
  };
}
