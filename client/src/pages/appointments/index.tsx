import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Filter, Calendar, Check, X, 
  Calendar as CalendarIcon, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarName } from '@/components/ui/avatar-name';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loader';
import { Appointment, Patient, Doctor } from '@/lib/types';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export default function AppointmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const getPatient = (patientId: number) => {
    return patients?.find(p => p.id === patientId);
  };

  const getDoctor = (doctorId: number) => {
    return doctors?.find(d => d.id === doctorId);
  };

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiRequest('PUT', `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: 'Status updated',
        description: 'The appointment status has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Filter appointments based on search and filter
  const filteredAppointments = appointments?.filter(appointment => {
    const patient = getPatient(appointment.patientId);
    const doctor = getDoctor(appointment.doctorId);

    const matchesSearch = searchQuery ? (
      patient && (
        patient.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      doctor && (
        doctor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      appointment.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    const matchesFilter = filterStatus === 'all' ? true : appointment.status === filterStatus;

    return matchesSearch && matchesFilter;
  }) || [];

  // Sort by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, startIndex + appointmentsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Rendez-vous</h1>
        <Link href="/appointments/add">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Planifier un rendez-vous</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Appointments Calendar</CardTitle>
              <CardDescription>
                View and manage all scheduled appointments
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search patients or doctors..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-gray-500">
              <CalendarIcon className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No appointments found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAppointments.map((appointment) => {
                      const patient = getPatient(appointment.patientId);
                      const doctor = getDoctor(appointment.doctorId);
                      const statusColors = getStatusColor(appointment.status);
                      const isUpcoming = new Date(appointment.appointmentDate) >= new Date();
                      const isPending = appointment.status === 'pending';
                      const isConfirmed = appointment.status === 'confirmed';

                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                            <div className="text-gray-500 text-sm">{formatTime(appointment.appointmentDate)}</div>
                          </TableCell>
                          <TableCell>
                            {patient ? (
                              <Link href={`/patients/${patient.id}`}>
                                <AvatarName
                                  firstName={patient.user.firstName}
                                  lastName={patient.user.lastName}
                                  className="cursor-pointer hover:opacity-80"
                                />
                              </Link>
                            ) : (
                              <span className="text-gray-500">Unknown Patient</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {doctor ? (
                              <div>
                                <div className="font-medium">Dr. {doctor.user.firstName} {doctor.user.lastName}</div>
                                <div className="text-gray-500 text-sm">{doctor.specialty}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Unknown Doctor</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {appointment.purpose || 'General consultation'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text}`}>
                                Doctor: {appointment.doctorStatus?.charAt(0).toUpperCase() + appointment.doctorStatus?.slice(1)}
                              </Badge>
                              <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text}`}>
                                Patient: {appointment.patientStatus?.charAt(0).toUpperCase() + appointment.patientStatus?.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isUpcoming && (
                              <div className="flex justify-end gap-2">
                                {isPending && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                )}

                                {(isPending || isConfirmed) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}

                                {isConfirmed && !isUpcoming && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(appointment.id, 'completed')}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + appointmentsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <span className="flex h-9 w-9 items-center justify-center">...</span>
                        </PaginationItem>
                      )}

                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}