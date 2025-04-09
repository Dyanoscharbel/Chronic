
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { WorkflowModal } from '@/components/dashboard/workflow-modal';
import { useState } from 'react';

export default function WorkflowsPage() {
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['/api/workflows'],
  });

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
          <CardTitle>Tous les Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Stade IRC</TableHead>
                <TableHead>Tests</TableHead>
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
                  <TableCell>{workflow.requirements.length} tests</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WorkflowModal 
        isOpen={workflowModalOpen} 
        onClose={() => setWorkflowModalOpen(false)} 
      />
    </div>
  );
}
