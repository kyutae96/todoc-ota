'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type Role = 'manager' | 'admin';

interface AuthContextType {
  userRole: Role;
  setUserRole: (role: Role) => void;
  user: { name: string; email: string; avatar: string };
  UserAvatar: React.FC<{className?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<Role>('manager');

  const user = useMemo(() => ({
    name: userRole === 'admin' ? 'Alex Doe (Admin)' : 'Alex Doe',
    email: userRole === 'admin' ? 'alex.doe@admin.com' : 'alex.doe@manager.com',
    avatar: 'https://i.pravatar.cc/150?u=alexdoe',
  }), [userRole]);

  const UserAvatar: React.FC<{className?: string}> = ({className}) => (
    <Avatar className={className}>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, user, UserAvatar }}>
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
