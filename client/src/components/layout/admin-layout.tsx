
import React from 'react';
import { Link } from 'wouter';
import { Header } from './header';
import { useAuth } from '@/hooks/use-auth';
import { useMobile } from '@/hooks/use-mobile';
import { PageLoader } from '@/components/ui/loader';
import { Settings, UserMd, Users } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const isMobile = useMobile();
  
  if (loading) {
    return <PageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} toggleSidebar={() => {}} />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex space-x-8">
              <Link 
                href="/admin/settings" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Settings className="w-5 h-5 mr-2" />
                Paramètres Admin
              </Link>
              
              <Link 
                href="/admin/doctors" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <UserMd className="w-5 h-5 mr-2" />
                Médecins
              </Link>
              
              <Link 
                href="/admin/patients" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Patients
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Panel Administrateur CKD Care
          </p>
        </div>
      </footer>
    </div>
  );
}
