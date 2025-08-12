'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  BarChart3,
  UserPlus,
  Menu,
  X,
  ChevronRight,
  UserCircle,
  Shield,
  Settings,
  FolderOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { getNavigationItemsForRole } from '@/lib/role-utils';
import { canAccessNavigationItem } from '@/lib/dynamic-permission-utils';

interface NavigationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
  isActive: boolean;
  isComingSoon: boolean;
}

interface DashboardNavigationProps {
  className?: string;
}

export default function DashboardNavigation({ className }: DashboardNavigationProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      labelKey: 'dashboard.navigation.dashboard',
      href: '/dashboard',
      isActive: pathname === '/dashboard',
      isComingSoon: false,
    },
    {
      id: 'users',
      icon: UserPlus,
      labelKey: 'dashboard.navigation.users',
      href: '/dashboard/users',
      isActive: pathname.startsWith('/dashboard/users'),
      isComingSoon: false,
    },
    {
      id: 'profile',
      icon: UserCircle,
      labelKey: 'profile.navigation.title',
      href: '/dashboard/profile',
      isActive: pathname.startsWith('/dashboard/profile'),
      isComingSoon: false,
    },
    {
      id: 'audit',
      icon: Shield,
      labelKey: 'dashboard.navigation.audit',
      href: '/dashboard/audit',
      isActive: pathname.startsWith('/dashboard/audit'),
      isComingSoon: false,
    },
    {
      id: 'permissions',
      icon: Settings,
      labelKey: 'dashboard.navigation.permissions',
      href: '/dashboard/permissions',
      isActive: pathname.startsWith('/dashboard/permissions'),
      isComingSoon: false,
    },
    {
      id: 'categories',
      icon: FolderOpen,
      labelKey: 'dashboard.navigation.categories',
      href: '/dashboard/categories',
      isActive: pathname.startsWith('/dashboard/categories'),
      isComingSoon: false,
    },
    {
      id: 'inventory',
      icon: Package,
      labelKey: 'dashboard.navigation.inventory',
      href: '/dashboard/inventory',
      isActive: pathname.startsWith('/dashboard/inventory'),
      isComingSoon: false,
    },
    {
      id: 'customers',
      icon: Users,
      labelKey: 'dashboard.navigation.customers',
      href: '/customers',
      isActive: pathname.startsWith('/customers'),
      isComingSoon: true,
    },
    {
      id: 'rentals',
      icon: FileText,
      labelKey: 'dashboard.navigation.rentals',
      href: '/rentals',
      isActive: pathname.startsWith('/rentals'),
      isComingSoon: true,
    },
    {
      id: 'reports',
      icon: BarChart3,
      labelKey: 'dashboard.navigation.reports',
      href: '/reports',
      isActive: pathname.startsWith('/reports'),
      isComingSoon: true,
    },
  ];

  // Filter navigation items based on dynamic user permissions
  const visibleNavigationItems = user 
    ? navigationItems.filter(item => canAccessNavigationItem(user.permissions || [], item.id))
    : navigationItems;

  // Don't render during SSR to avoid hydration mismatch
  if (!isClient) {
    return (
      <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-64 bg-white/95 backdrop-blur-sm border-l border-white/30 shadow-2xl z-30 lg:block hidden">
        <Card className="h-full rounded-none bg-transparent border-none shadow-none">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  داشبورد
                </h2>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-50 text-blue-700">
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">داشبورد</span>
              </div>
            </nav>
          </div>
        </Card>
      </aside>
    );
  }

  const NavigationContent = () => (
    <div className="h-full flex flex-col">
      {/* Navigation Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('dashboard.title')}
          </h2>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden hover:bg-white/50"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative">
              <Button
                variant={item.isActive ? 'default' : 'ghost'}
                className={`w-full justify-start text-right rtl:text-left ${
                  item.isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'hover:bg-white/50'
                } ${
                  item.isComingSoon 
                    ? 'opacity-60 cursor-not-allowed' 
                    : ''
                } transition-all duration-300 rounded-xl`}
                disabled={item.isComingSoon}
                onClick={() => {
                  if (!item.isComingSoon) {
                    router.push(item.href);
                    // Close mobile menu after navigation
                    setIsMobileOpen(false);
                  }
                }}
              >
                <Icon className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.isComingSoon && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-2 rtl:ml-0 rtl:mr-2">
                    {t('dashboard.navigation.comingSoon')}
                  </span>
                )}
                {!item.isComingSoon && (
                  <ChevronRight className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
                )}
              </Button>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
              setIsMobileOpen(false);
            }
          }}
          aria-label="Close navigation menu"
        />
      )}

      {/* Mobile Navigation Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-20 right-4 z-50 lg:hidden bg-white/95 backdrop-blur-sm border-white/30 shadow-lg rounded-xl hover:bg-white"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Navigation Sidebar */}
      <aside 
        className={`
          fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-sm border-l border-white/30 shadow-lg z-50 transform transition-transform duration-300 lg:hidden
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
          ${className}
        `}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <Card className="h-full rounded-none border-0 shadow-none bg-transparent">
          <NavigationContent />
        </Card>
      </aside>

      {/* Desktop Navigation */}
      <aside className={`
        hidden lg:block fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-sm border-l border-white/30 shadow-lg z-30
        ${className}
      `}>
        <Card className="h-full rounded-none border-0 shadow-none bg-transparent">
          <NavigationContent />
        </Card>
      </aside>
    </>
  );
}
