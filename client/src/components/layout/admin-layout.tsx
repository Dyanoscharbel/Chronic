
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useMobile } from '@/hooks/use-mobile';
import { PageLoader } from '@/components/ui/loader';
import { Home, Users, Settings, Menu, X, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { 
      label: 'Tableau de bord', 
      icon: <Home className="mr-3 h-6 w-6 text-white" />,
      href: '/admin'
    },
    { 
      label: 'Médecins', 
      icon: <Stethoscope className="mr-3 h-6 w-6 text-white" />,
      href: '/admin/doctors'
    },
    { 
      label: 'Patients', 
      icon: <Users className="mr-3 h-6 w-6 text-white" />,
      href: '/admin/patients'
    },
    { 
      label: 'Paramètres', 
      icon: <Settings className="mr-3 h-6 w-6 text-white" />,
      href: '/admin/settings'
    }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[var(--primary-dark)]">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-white text-xl font-bold">Admin CKD Care</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleSidebar}
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md text-white",
                      location === item.href 
                        ? "bg-[var(--primary-light)]" 
                        : "hover:bg-[var(--primary-light)]"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      {!isMobile && (
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-[var(--primary-dark)]">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary">
                <span className="text-white text-xl font-bold">Admin CKD Care</span>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white",
                        location === item.href 
                          ? "bg-[var(--primary-light)]" 
                          : "hover:bg-[var(--primary-light)]"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
