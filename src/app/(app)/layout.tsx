
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import {
  LayoutDashboard,
  Warehouse,
  BookOpenCheck,
  ChefHat,
  Sparkles,
  Trophy,
  LogOut,
  Settings,
  LifeBuoy,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pantry', label: 'Pantry', icon: Warehouse },
    { href: '/logs', label: 'Daily Logs', icon: BookOpenCheck },
    { href: '/recipes', label: 'My Recipes', icon: ChefHat },
    { href: '/ai-recipes', label: 'AI Recipes', icon: Sparkles },
    { href: '/advisor', label: 'AI Advisor', icon: Lightbulb },
    { href: '/awards', label: 'Awards', icon: Trophy },
  ];

  const pageContent = (
    <>
    {loading || !user ? (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    ) : (
      <>
        <Sidebar collapsible="icon">
          <SidebarHeader>
             <SidebarTrigger asChild>
                <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center p-2 hover:bg-sidebar-accent">
                    <Logo hideTextOnCollapse />
                </Button>
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <div className='p-2'>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      href={item.href}
                      isActive={pathname.startsWith(item.href)}
                      asChild
                      tooltip={item.label}
                    >
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
          <SidebarFooter>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton href="/settings" isActive={pathname === '/settings'} asChild tooltip="Settings">
                           <Link href="/settings">
                              <Settings />
                              <span>Settings</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Contact Support">
                           <a href="mailto:support@fitropolis.com">
                              <LifeBuoy />
                              <span>Contact Support</span>
                          </a>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
              <SidebarSeparator />
              <div className="flex items-center gap-3 p-2 text-left group-data-[collapsible=icon]:hidden">
                  <Avatar>
                  <AvatarImage
                      src={user.profile.avatarUrl}
                      alt={user.name}
                  />
                  <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                  </Avatar>
                  <div className="w-full truncate">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
              </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </>
    )}
    </>
  );


  return (
    <SidebarProvider>
      {pageContent}
    </SidebarProvider>
  );
}
