import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      const json = await response.json();
      return json;
    },
    enabled: user?.role === 'admin',
    staleTime: 30000
  });

  if (!user || user.role !== 'admin') {
    return <div>Accès non autorisé</div>;
  }

  if (isLoadingStats) {
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPatients || '0'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution des patients par stade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des patients par stade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats?.patientsByStage?.map((stage: any) => (
                <div key={stage._id} className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Stade {stage._id}</div>
                  <div className="text-2xl font-bold">{stage.count}</div>
                </div>
              )) || []}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}