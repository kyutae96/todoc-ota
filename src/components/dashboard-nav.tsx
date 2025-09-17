'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, FolderKanban, History } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/firestore', label: 'Firestore', icon: Database },
  { href: '/dashboard/storage', label: 'Storage', icon: FolderKanban },
  { href: '/dashboard/sessions', label: 'OTA Sessions', icon: History },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            className={cn(
              'group-data-[collapsible=icon]:justify-center',
              'group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10'
            )}
            isActive={isClient ? pathname.startsWith(item.href) : false}
            tooltip={{
              children: item.label,
              className: 'group-data-[collapsible=icon]:hidden',
            }}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-5 shrink-0" />
              <span className="min-w-max">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}