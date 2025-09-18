'use client';

import { SidebarTrigger } from './ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { Flame } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getTitleFromPath(path: string): string {
  if (path.includes('/storage')) return 'Storage Browser';
  if (path.startsWith('/dashboard/devices')) return 'Devices';
  if (path.startsWith('/dashboard/sessions/')) return 'Session Details';
  if (path.includes('/sessions')) return 'Sessions';
  if (path.includes('/users')) return 'User Management';
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
                    Sessions
                </Link>
                 <span>/</span>
                <span className="font-semibold text-foreground">{sessionId}</span>
            </div>
        )
    }

    return <h1 className="font-headline text-xl font-semibold tracking-tight">{title}</h1>;
}

export function DashboardHeader() {
  const { user, logout, UserAvatar } = useAuth();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
            <a
            href="https://firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            >
            <Flame className="mr-2" />
            Visit Firebase
            </a>
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserAvatar />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
       </div>
    </header>
  );
}
