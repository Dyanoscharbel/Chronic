
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Désactiver les requêtes inutiles pour l'admin
  const { isLoading: isLoadingUpcomingAppointments } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: () => Promise.resolve(null),
    enabled: false // Désactivé pour l'admin
  });

  const { isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => Promise.resolve(null),
    enabled: false // Désactivé pour l'admin
  });

  // Stats query pour admin uniquement
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiRequest.get('/api/admin/stats');
      return response.data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const response = await apiRequest.get('/api/admin/doctors');
      return response.data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const response = await apiRequest.get('/api/admin/appointments');
      return response.data;
    },
    enabled: user?.role === 'admin'
  });

  const { isLoading: isLoadingDashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => Promise.resolve(null),
    enabled: false
  });

  if (!user || user.role !== 'admin') {
    return <div>Accès non autorisé</div>;
  }

  if (isLoadingStats || isLoadingDoctors) {
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Médecins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDoctors || '0'}</div>
              <div className="text-xs text-muted-foreground">Médecins enregistrés</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPatients || '0'}</div>
              <div className="text-xs text-muted-foreground">Patients enregistrés</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || '0'}</div>
              <div className="text-xs text-muted-foreground">Utilisateurs enregistrés</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Liste des médecins</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
