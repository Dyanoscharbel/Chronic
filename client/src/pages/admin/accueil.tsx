
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Users, Calendar, FileText, AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { LabResultsList } from '@/components/dashboard/appointments-list';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Loader } from '@/components/ui/loader';
import { DashboardStats } from '@/lib/types';

export default function AdminAccueil() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 5000,
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery<{ notifications: any[], criticalCount: number }>({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000,
  });

  if (statsLoading || notificationsLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Accueil Administration</h1>
          <div className="h-96 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Accueil Administration</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<User className="text-black h-6 w-6" />}
            iconBgColor="bg-white"
            title="Total Médecins"
            value={dashboardStats?.totalDoctors || 0}
            footerText="Voir tous les médecins"
            footerLinkColor="text-primary hover:text-primary-dark"
          />
          
          <StatsCard
            icon={<Users className="h-6 w-6 text-white" />}
            iconBgColor="bg-indigo-500"
            title="Total Patients"
            value={dashboardStats?.totalPatients || 0}
            footerText="Voir tous les patients"
            footerLinkColor="text-indigo-600 hover:text-indigo-500"
          />
          
          <StatsCard
            icon={<Calendar className="h-6 w-6 text-white" />}
            iconBgColor="bg-green-500"
            title="Total Rendez-vous"
            value={dashboardStats?.totalAppointments || 0}
            footerText="Voir tous les rendez-vous"
            footerLinkColor="text-green-600 hover:text-green-500"
          />
          
          <StatsCard
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            iconBgColor="bg-yellow-500"
            title="Alertes"
            value={notificationsData?.criticalCount || 0}
            footerText="Voir les alertes"
            footerLinkColor="text-yellow-600 hover:text-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Distribution des patients"
            type="pie"
            data={dashboardStats?.patientDistribution || {}}
          />
          <ChartCard
            title="Évolution mensuelle"
            type="line"
            data={dashboardStats?.monthlyStats || []}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LabResultsList />
          <AlertsList notifications={notificationsData?.notifications || []} />
        </div>
      </div>
    </AdminLayout>
  );
}
