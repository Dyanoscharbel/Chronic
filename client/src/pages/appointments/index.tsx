import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AvatarName } from '@/components/ui/avatar-name';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { formatDate, formatTime, apiRequest } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Appointment, Patient, Doctor } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CalendarIcon } from 'lucide-react';


export default function AppointmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments'],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
  });

  const getPatient = (patientId: string) => {
    return patients?.find(p => p._id === patientId);
  };

  const getDoctor = (doctorId: string) => {
    return doctors?.find(d => d._id === doctorId);
  };

  const filteredAppointments = appointments.filter((appointment: any) => {
    const patient = getPatient(appointment.patient);
    const doctor = getDoctor(appointment.doctor);
    const matchesSearch = searchQuery.trim() === "" || (patient?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doctor && (doctor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     doctor.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))));
    const matchesStatus = filterStatus === 'all' || appointment.doctorStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + appointmentsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
              <CardTitle>Calendrier des rendez-vous</CardTitle>
              <CardDescription>
                Afficher et gérer tous les rendez-vous planifiés
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Rechercher des patients ou des médecins..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
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
              <h3 className="text-lg font-medium">Aucun rendez-vous trouvé</h3>
              <p className="text-sm">Essayez d'ajuster vos critères de recherche ou de filtrage</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Objet</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAppointments.map((appointment: any) => {
                      const patient = getPatient(appointment.patient);
                      const doctor = getDoctor(appointment.doctor);

                      return (
                        <TableRow key={appointment._id}>
                          <TableCell>
                            <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                            <div className="text-gray-500 text-sm">{formatTime(appointment.appointmentDate)}</div>
                          </TableCell>
                          <TableCell>
                            {patient?.user ? (
                              <Link href={`/patients/${patient._id}`}>
                                <AvatarName
                                  firstName={patient.user.firstName}
                                  lastName={patient.user.lastName}
                                  className="cursor-pointer hover:opacity-80"
                                />
                              </Link>
                            ) : (
                              <span className="text-gray-500">Patient inconnu</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {doctor?.user ? (
                              <div>
                                <div className="font-medium">Dr. {doctor.user.firstName} {doctor.user.lastName}</div>
                                <div className="text-gray-500 text-sm">{doctor.specialty}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Médecin inconnu</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {appointment.purpose || 'Consultation générale'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              appointment.doctorStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.doctorStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.doctorStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                              appointment.doctorStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                              ''
                            }>
                              {appointment.doctorStatus === 'pending' ? 'En attente' :
                               appointment.doctorStatus === 'confirmed' ? 'Confirmé' :
                               appointment.doctorStatus === 'cancelled' ? 'Annulé' :
                               appointment.doctorStatus === 'completed' ? 'Terminé' :
                               appointment.doctorStatus}
                            </Badge>
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
                    Affichage de {startIndex + 1} à {Math.min(startIndex + appointmentsPerPage, filteredAppointments.length)} sur {filteredAppointments.length} rendez-vous
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