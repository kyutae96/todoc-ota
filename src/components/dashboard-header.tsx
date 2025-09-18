'use client';

import { SidebarTrigger } from './ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { Flame } from 'lucide-react';

function getTitleFromPath(path: string): string {
  if (path.includes('/storage')) return 'Storage Browser';
  if (path.startsWith('/dashboard/devices')) return 'Devices';
  if (path.startsWith('/dashboard/sessions/')) return 'Session Details';
  if (path.includes('/sessions')) return 'Sessions';
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
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumbs />
      </div>

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
    </header>
  );
}
