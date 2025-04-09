
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { WorkflowModal } from '@/components/dashboard/workflow-modal';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function WorkflowsPage() {
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['/api/workflows'],
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: 'Workflow supprimé',
        description: 'Le workflow a été supprimé avec succès',
      });
    },
  });

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedWorkflow(null);
    setWorkflowModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
        <div className="h-96 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
        <Button 
          onClick={() => setWorkflowModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un Workflow</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Stade IRC</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows?.map((workflow) => (
                <TableRow key={workflow._id}>
                  <TableCell>{workflow.name}</TableCell>
                  <TableCell>{workflow.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{workflow.ckdStage}</Badge>
                  </TableCell>
                  <TableCell>{workflow.requirements?.length || 0} tests</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(workflow)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce workflow ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteWorkflowMutation.mutate(workflow._id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WorkflowModal 
        isOpen={workflowModalOpen} 
        onClose={handleCloseModal}
        workflow={selectedWorkflow}
      />
    </div>
  );
}
