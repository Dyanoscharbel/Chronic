
import { useQuery } from '@tanstack/react-query';
import { User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Administration</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={<User className="text-black h-6 w-6" />}
          iconBgColor="bg-white"
          title="Total Médecins"
          value={stats?.totalDoctors || 0}
          footerText="Gestion des médecins"
        />
        
        <StatsCard
          icon={<Calendar className="h-6 w-6 text-white" />}
          iconBgColor="bg-indigo-500"
          title="Total Patients"
          value={stats?.totalPatients || 0}
          footerText="Gestion des patients"
        />
        
        <StatsCard
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBgColor="bg-green-500"
          title="Total Résultats"
          value={stats?.totalResults || 0}
          footerText="Gestion des résultats"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste d'activités à implémenter */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
