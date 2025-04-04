import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Users, Calendar, FileText, AlertTriangle, Settings, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ChartCard } from '@/components/dashboard/chart-card';

import { AppointmentsList } from '@/components/dashboard/appointments-list';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { Button } from '@/components/ui/button';
import { WorkflowModal } from '@/components/dashboard/workflow-modal';
import { Loader } from '@/components/ui/loader';
import { DashboardStats, Patient, Appointment, Alert } from '@/lib/types';

export default function Dashboard() {
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 5000, // Rafraîchit toutes les 5 secondes
  });
  
  
  
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/dashboard/upcoming-appointments'],
    refetchInterval: 5000,
  });
  
  const { data: recentAlerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ['/api/dashboard/recent-alerts'],
    refetchInterval: 5000,
  });
  
  if (statsLoading || appointmentsLoading || alertsLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="h-96 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Button 
          onClick={() => setWorkflowModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<User className="text-black h-6 w-6" />}
          iconBgColor="bg-white"
          title="Total Patients"
          value={dashboardStats?.totalPatients || 0}
          footerLink="/patients"
          footerText="Voir tous les patients"
          footerLinkColor="text-primary hover:text-primary-dark"
        />
        
        <StatsCard
          icon={<Calendar className="h-6 w-6 text-white" />}
          iconBgColor="bg-indigo-500"
          title="Rendez-vous à venir"
          value={dashboardStats?.upcomingAppointments || 0}
          footerLink="/appointments"
          footerText="Voir tous les rendez-vous"
          footerLinkColor="text-indigo-600 hover:text-indigo-500"
        />
        
        <StatsCard
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          iconBgColor="bg-yellow-500"
          title="Alertes critiques"
          value={dashboardStats?.criticalAlerts || 0}
          footerLink="/notifications"
          footerText="Voir toutes les alertes"
          footerLinkColor="text-yellow-600 hover:text-yellow-500"
        />
        
        <StatsCard
          icon={<FileText className="h-6 w-6 text-white" />}
          iconBgColor="bg-green-500"
          title="Résultats en attente"
          value={dashboardStats?.pendingLabResults || 0}
          footerLink="/lab-results"
          footerText="Voir tous les résultats"
          footerLinkColor="text-green-600 hover:text-green-500"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Patient CKD Stages Distribution"
          type="pie"
          data={dashboardStats?.stageDistribution || {}}
        />
        
        <ChartCard
          title="Average eGFR Trend (Last 6 Months)"
          type="line"
          data={dashboardStats?.egfrTrend || []}
        />
      </div>
      
      
      
      {/* Appointments and Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AppointmentsList appointments={upcomingAppointments || []} />
        <AlertsList alerts={recentAlerts || []} />
      </div>
      
      {/* Workflow Modal */}
      <WorkflowModal 
        isOpen={workflowModalOpen} 
        onClose={() => setWorkflowModalOpen(false)} 
      />
    </div>
  );
}
