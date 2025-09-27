
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { logout } from '@/lib/actions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

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
            <Skeleton className="h-12 w-12 rounded-full" />
        </div>
    ) : (
      <>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <Logo />
              <SidebarTrigger className="hidden md:flex" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    href={item.href}
                    isActive={pathname.startsWith(item.href)}
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton href="/settings" isActive={pathname === '/settings'} asChild>
                           <Link href="/settings">
                              <Settings />
                              <span>Settings</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                           <a href="mailto:support@fitropolis.com">
                              <LifeBuoy />
                              <span>Contact Support</span>
                          </a>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout}>
                            <LogOut />
                            <span>Log Out</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
              <SidebarSeparator />
              <div className="flex items-center gap-3 p-2 text-left">
                  <Avatar>
                  <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${user.id}`}
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
