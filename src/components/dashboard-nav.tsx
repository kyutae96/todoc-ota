'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, Smartphone, History, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/dashboard/storage', label: 'Storage', icon: FolderKanban, roles: ['admin', 'manager'] },
  { href: '/dashboard/devices', label: 'Devices', icon: Smartphone, roles: ['admin', 'manager'] },
  { href: '/dashboard/sessions', label: 'Sessions', icon: History, roles: ['admin', 'manager'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { userRole } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
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
