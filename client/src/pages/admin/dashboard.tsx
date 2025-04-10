
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
          iconBgColor="bg-white"
          title="Total Médecins"
          value={dashboardStats?.totalDoctors || 0}
          footerLink="/admin/doctors"
          footerText="Voir tous les médecins"
          footerLinkColor="text-primary hover:text-primary-dark"
        />
        
        <StatsCard
          icon={<Users className="h-6 w-6 text-white" />}
          iconBgColor="bg-indigo-500"
          title="Total Patients"
          value={dashboardStats?.totalPatients || 0}
          footerLink="/admin/patients"
          footerText="Voir tous les patients"
          footerLinkColor="text-indigo-600 hover:text-indigo-500"
        />
        
        <StatsCard
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          iconBgColor="bg-yellow-500"
          title="Alertes Système"
          value={notificationsData?.notifications?.filter(n => !n.isRead)?.length || 0}
          footerLink="/admin/alerts"
          footerText="Voir toutes les alertes"
          footerLinkColor="text-yellow-600 hover:text-yellow-500"
        />
        
        <StatsCard
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBgColor="bg-green-500"
          title="Total Tests"
          value={labResults?.length || 0}
          footerLink="/admin/lab-tests"
          footerText="Voir tous les tests"
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
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiRequest.get('/api/doctors').then(res => res.data)
  });

  if (user?.role !== 'admin') {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Liste des médecins</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDoctors ? (
              <div className="flex justify-center p-4">
                <Loader />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Hôpital</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors?.map((doctor: any) => (
                    <TableRow key={doctor._id}>
                      <TableCell>{`${doctor.user.firstName} ${doctor.user.lastName}`}</TableCell>
                      <TableCell>{doctor.user.email}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.hospital}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
