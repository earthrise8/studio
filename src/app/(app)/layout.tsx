
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
  Trophy,
  Settings,
  LifeBuoy,
  Loader2,
  Library,
  ShoppingCart,
  Target,
  Users,
  LogOut,
  LogIn,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/ui/progress-ring';

function DemoModeWarning() {
    const { user, signIn } = useAuth();
    if (!user || user.id !== 'demo-user') return null;

    return (
        <div className="bg-yellow-500/20 border-b border-yellow-600/30 text-yellow-900 dark:text-yellow-200 text-center p-2 text-sm">
            <div className="container mx-auto flex items-center justify-center gap-4">
                <AlertTriangle className="h-5 w-5" />
                <span>You are in Demo Mode. Your data will not be saved.</span>
                <Button size="sm" variant="ghost" className="underline" onClick={signIn}>
                    Sign In to save your progress
                </Button>
            </div>
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pantry', label: 'Pantry', icon: Warehouse },
    { href: '/shopping-cart', label: 'Shopping Cart', icon: ShoppingCart },
    { href: '/logs', label: 'Daily Logs', icon: BookOpenCheck },
    { href: '/recipes', label: 'Recipes', icon: ChefHat },
    { href: '/advisor', label: 'Goals', icon: Target },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/awards', label: 'Awards', icon: Trophy },
    { href: '/wiki', label: 'Wiki', icon: Library },
  ];

  const pageContent = (
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
                    <SidebarMenuButton asChild tooltip="Logout" onClick={signOut}>
                         <a>
                            <LogOut />
                            <span>Logout</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
            <div className="space-y-2 p-2 text-left group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-3">
                  <Avatar>
                  <AvatarImage
                      src={user.profile.avatarUrl ?? undefined}
                      alt={user.name ?? 'User'}
                  />
                  <AvatarFallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                  </Avatar>
                  <div className="w-full truncate">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
              </div>
              <div className='space-y-1'>
                  <div className='flex justify-between items-center text-xs text-muted-foreground'>
                      <span>Level {Math.floor((user.profile?.totalPoints || 0) / 100)}</span>
                      <span>{((user.profile?.totalPoints || 0) % 100)}/100</span>
                  </div>
                  <Progress value={((user.profile?.totalPoints || 0) % 100)} className="h-2" />
              </div>
            </div>
             <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
                <ProgressRing
                  value={((user.profile?.totalPoints || 0) % 100)}
                  size={40}
                  strokeWidth={4}
                  className='bg-transparent border-none shadow-none p-0'
                >
                 <span className='text-xs font-bold font-body'>
                   {Math.floor((user.profile?.totalPoints || 0) / 100)}
                 </span>
                </ProgressRing>
             </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DemoModeWarning />
        {children}
        </SidebarInset>
    </>
  );


  return (
    <SidebarProvider>
      {pageContent}
    </SidebarProvider>
  );
}
