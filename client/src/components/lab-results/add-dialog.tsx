
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LabTest, Patient } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddLabResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

export function AddLabResultDialog({ isOpen, onClose, patientId }: AddLabResultDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    labTestId: '',
    resultValue: '',
    resultDate: new Date().toISOString().split('T')[0]
  });

  const { data: labTests } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
  });

  const { data: patient } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId
  });

  const addLabResultMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/patient-lab-results', data);
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Le résultat a été ajouté avec succès',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patient-lab-results`] });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: [`/api/patient-lab-results/patient/${patientId}`] });
      }
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setFormData({
      labTestId: '',
      resultValue: '',
      resultDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = () => {
    if (!formData.labTestId || !formData.resultValue) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    addLabResultMutation.mutate({
      patientId: patientId,
      labTestId: formData.labTestId,
      resultValue: parseFloat(formData.resultValue),
      resultDate: formData.resultDate
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un résultat</DialogTitle>
          <DialogDescription>
            {patient ? 
              `Enregistrer un nouveau résultat pour ${patient.user.firstName} ${patient.user.lastName}` :
              'Enregistrer un nouveau résultat de test'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="test-type" className="text-right">
              Type de test
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.labTestId}
                onValueChange={(value) => setFormData({...formData, labTestId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un test" />
                </SelectTrigger>
                <SelectContent>
                  {labTests?.map((test) => (
                    <SelectItem key={test._id} value={test._id}>
                      {test.testName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="result-value" className="text-right">
              Résultat
            </Label>
            <Input
              id="result-value"
              type="number"
              step="0.01"
              value={formData.resultValue}
              onChange={(e) => setFormData({...formData, resultValue: e.target.value})}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="result-date" className="text-right">
              Date
            </Label>
            <Input
              id="result-date"
              type="date"
              value={formData.resultDate}
              onChange={(e) => setFormData({...formData, resultDate: e.target.value})}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={addLabResultMutation.isPending}>
            {addLabResultMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
