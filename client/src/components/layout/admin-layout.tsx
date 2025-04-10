
import React from 'react';
import { Header } from './header';
import { useAuth } from '@/hooks/use-auth';
import { useMobile } from '@/hooks/use-mobile';
import { PageLoader } from '@/components/ui/loader';

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
