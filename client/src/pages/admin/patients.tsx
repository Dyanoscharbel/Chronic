
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function PatientsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: () => apiRequest('GET', '/api/patients')
  });

  const handleDelete = async (patientId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await apiRequest('DELETE', `/api/patients/${patientId}`);
        queryClient.invalidateQueries(['/api/patients']);
        toast({
          title: 'Succès',
          description: 'Le patient a été supprimé avec succès'
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le patient',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestion des Patients</h1>
        <Button onClick={() => {/* TODO: Add patient dialog */}}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher un patient..."
              className="max-w-sm"
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Stade MRC</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.user.firstName} {patient.user.lastName}</TableCell>
                  <TableCell>{patient.user.email}</TableCell>
                  <TableCell>{new Date(patient.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.ckdStage}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: Edit patient */}}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
