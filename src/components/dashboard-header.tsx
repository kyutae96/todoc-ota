'use client';

import { Check, ChevronsUpDown, UserCog, User } from 'lucide-react';
import { useAuth, Role } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from './ui/sidebar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getTitleFromPath(path: string): string {
  if (path.includes('/firestore')) return 'Firestore Explorer';
  if (path.includes('/storage')) return 'Storage Browser';
  if (path.startsWith('/dashboard/sessions/')) return 'Session Details';
  if (path.includes('/sessions')) return 'OTA Sessions';
  return 'Dashboard';
}

function Breadcrumbs() {
    const pathname = usePathname();
    const title = getTitleFromPath(pathname);
    
    if (pathname.startsWith('/dashboard/sessions/')) {
        const sessionId = pathname.split('/').pop();
        return (
            <div className="flex items-center gap-2">
                <Link href="/dashboard/sessions" className="text-muted-foreground hover:text-foreground">
                    OTA Sessions
                </Link>
                 <span>/</span>
                <span className="font-semibold text-foreground">{sessionId}</span>
            </div>
        )
    }

    return <h1 className="font-headline text-xl font-semibold tracking-tight">{title}</h1>;
}

export function DashboardHeader() {
  const { user, userRole, setUserRole, UserAvatar } = useAuth();
  
  const roles: { role: Role; label: string; icon: React.ElementType }[] = [
    { role: 'manager', label: 'Manager', icon: User },
    { role: 'admin', label: 'Administrator', icon: UserCog },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3">
            <UserAvatar className="size-8" />
            <div className="hidden flex-col items-start md:flex">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto hidden size-4 shrink-0 text-muted-foreground md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <p>{user.name}</p>
            <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-medium">Switch Role</DropdownMenuLabel>
          {roles.map(({ role, label, icon: Icon }) => (
            <DropdownMenuItem key={role} onSelect={() => setUserRole(role)}>
              <Icon className="mr-2 size-4" />
              <span>{label}</span>
              <Check className={cn('ml-auto size-4', userRole === role ? 'opacity-100' : 'opacity-0')} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
