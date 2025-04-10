
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Users, Calendar, FileText, AlertTriangle, Settings, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { LabResultsList } from '@/components/dashboard/appointments-list';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { DashboardStats } from '@/lib/types';

export default function AdminDashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 5000,
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery<{ notifications: any[], criticalCount: number }>({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000,
  });

  const { data: labResults } = useQuery<any[]>({
    queryKey: ['/api/patient-lab-results'],
    refetchInterval: 5000,
  });

  if (statsLoading || notificationsLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Administrateur</h1>
        <div className="h-96 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Administrateur</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<User className="text-black h-6 w-6" />}
          iconBgColor="bg-blue-500"
          title="Total Médecins"
          value={dashboardStats?.totalDoctors || 0}
          footerText="Médecins enregistrés"
          footerLinkColor="text-blue-600 hover:text-blue-500"
        />
        
        <StatsCard
          icon={<Users className="h-6 w-6 text-white" />}
          iconBgColor="bg-indigo-500"
          title="Total Patients"
          value={dashboardStats?.totalPatients || 0}
          footerText="Patients enregistrés"
          footerLinkColor="text-indigo-600 hover:text-indigo-500"
        />
        
        <StatsCard
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBgColor="bg-green-500"
          title="Total Résultats"
          value={dashboardStats?.totalTests || 0}
          footerText="Résultats de tests"
          footerLinkColor="text-green-600 hover:text-green-500"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribution des médecins par spécialité"
          type="pie"
          data={dashboardStats?.doctorDistribution || {}}
        />
        
        <ChartCard
          title="Évolution du nombre de patients"
          type="line"
          data={dashboardStats?.patientGrowth || []}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LabResultsList />
        <AlertsList notifications={notificationsData?.notifications?.slice(0, 5) || []} />
      </div>
    </div>
  );
}
