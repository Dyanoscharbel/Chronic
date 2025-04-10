
import { useState } from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Docteurs', href: '/admin/doctors' },
    { icon: UserPlus, label: 'Patients', href: '/admin/patients' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border",
          isSidebarOpen ? "w-64" : "w-16"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4">
              {isSidebarOpen && <span className="text-lg font-semibold">Admin Panel</span>}
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {isSidebarOpen && item.label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={() => logout()}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isSidebarOpen && 'Déconnexion'}
              </button>
            </div>
          </div>
        </aside>

        <main className={cn(
          "flex-1 transition-all",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
