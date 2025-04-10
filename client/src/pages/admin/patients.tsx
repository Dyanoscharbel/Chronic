
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { apiRequest } from '@/lib/queryClient';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['admin-patients'],
    queryFn: () => apiRequest.get('/api/admin/patients').then(res => res.data)
  });

  const handleDelete = async (patientId: string) => {
    try {
      await apiRequest.delete(`/api/admin/patients/${patientId}`);
      await refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center">
      <Loader size="lg" />
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Patients</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un patient
        </Button>
      </div>

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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient: any) => (
                <TableRow key={patient._id}>
                  <TableCell>{`${patient.user.firstName} ${patient.user.lastName}`}</TableCell>
                  <TableCell>{patient.user.email}</TableCell>
                  <TableCell>{`Dr. ${patient.doctor?.user?.firstName} ${patient.doctor?.user?.lastName}`}</TableCell>
                  <TableCell>{patient.ckdStage}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <Alert>
            <AlertDescription>
              Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPatient && handleDelete(selectedPatient._id)}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
