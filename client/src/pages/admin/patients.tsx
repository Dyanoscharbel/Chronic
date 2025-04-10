
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { apiRequest } from '@/lib/queryClient';

export default function AdminPatientsPage() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['admin-patients'],
    queryFn: () => apiRequest.get('/api/admin/patients').then(res => res.data)
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center">
      <Loader size="lg" />
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Patients</h1>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Médecin Traitant</TableHead>
                <TableHead>Stade CKD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient: any) => (
                <TableRow key={patient._id}>
                  <TableCell>{`${patient.user.firstName} ${patient.user.lastName}`}</TableCell>
                  <TableCell>{patient.user.email}</TableCell>
                  <TableCell>{`Dr. ${patient.doctor?.user?.firstName} ${patient.doctor?.user?.lastName}`}</TableCell>
                  <TableCell>{patient.ckdStage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
