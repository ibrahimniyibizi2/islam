import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/types/roles';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, LucideIcon, X, ChevronLeft } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

export default function DashboardLayout({ children, title, navItems }: DashboardLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const currentPath = location.pathname;
  const activeItem = navItems.find(item => currentPath === item.href) || navItems[0];

  return (
    <SidebarProvider>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">IslamRwanda</p>
              <p className="text-xs text-sidebar-foreground/60">{role ? ROLE_LABELS[role] : ''}</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={currentPath === item.href}
                        onClick={() => navigate(item.href)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-3">
            <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/50 p-2">
              <User className="h-4 w-4 text-sidebar-foreground/70" />
              <span className="flex-1 truncate text-xs text-sidebar-foreground/70">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
      </div>

      <SidebarInset className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-emerald-600 text-white shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {currentPath !== '/dashboard/user' && (
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold">{activeItem?.label || title}</h1>
                <p className="text-xs text-emerald-100">IslamRwanda</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-14 items-center gap-3 border-b border-border px-4 bg-white">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="absolute right-0 top-[56px] bottom-0 w-64 bg-white shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500">{role ? ROLE_LABELS[role] : 'User'}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {navItems.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex flex-col items-center justify-center py-2 px-3 flex-1 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                  <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">{item.label}</span>
                </button>
              );
            })}
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]"></div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
