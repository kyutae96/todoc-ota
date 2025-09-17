'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Database, FolderKanban } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/firestore', label: 'Firestore', icon: Database },
  { href: '/dashboard/storage', label: 'Storage', icon: FolderKanban },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              as="a"
              className={cn(
                'group-data-[collapsible=icon]:justify-center',
                'group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10'
              )}
              isActive={pathname.startsWith(item.href)}
              tooltip={{
                children: item.label,
                className: 'group-data-[collapsible=icon]:hidden',
              }}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="min-w-max">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
