
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDoctorsPage() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => apiRequest.get('/api/admin/doctors').then(res => res.data)
  });

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center">
      <Loader size="lg" />
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Médecins</h1>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Médecins</CardTitle>
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
  );
}
