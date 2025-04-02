import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X } from 'lucide-react';
import { Workflow, WorkflowRequirement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowModal({ isOpen, onClose }: WorkflowModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [workflowData, setWorkflowData] = useState<{
    name: string;
    type: string;
    description: string;
    requirements: {
      testName: string;
      frequency: string;
      alertThresholdType: string;
      alertThresholdValue: string;
      alertThresholdUnit: string;
      action: string;
    }[];
  }>({
    name: '',
    type: 'CKD Stage 3A Monitoring',
    description: '',
    requirements: [
      {
        testName: 'eGFR',
        frequency: 'Every 3 months',
        alertThresholdType: 'Below',
        alertThresholdValue: '30',
        alertThresholdUnit: 'mL/min',
        action: 'Alert Only'
      },
      {
        testName: 'Urine Albumin-to-Creatinine',
        frequency: 'Every 6 months',
        alertThresholdType: 'Above',
        alertThresholdValue: '300',
        alertThresholdUnit: 'mg/g',
        action: 'Alert Only'
      },
      {
        testName: 'Blood Pressure',
        frequency: 'Every visit',
        alertThresholdType: 'Above',
        alertThresholdValue: '140/90',
        alertThresholdUnit: 'mmHg',
        action: 'Alert Only'
      }
    ]
  });
  
  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflow: any) => {
      // Format the requirements data properly
      const requirementsData = workflow.requirements.map((req: any) => ({
        testName: req.testName,
        frequency: req.frequency,
        alertThreshold: `${req.alertThresholdType} ${req.alertThresholdValue} ${req.alertThresholdUnit}`,
        action: req.action
      }));
      
      const ckdStage = workflow.type.includes('Stage') 
        ? workflow.type.replace('Monitoring', '').trim() 
        : undefined;
      
      return await apiRequest('POST', '/api/workflows', {
        name: workflow.name,
        description: workflow.description,
        ckdStage,
        requirements: requirementsData
      });
    },
    onSuccess: () => {
      toast({
        title: 'Workflow created',
        description: 'Your workflow has been saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create workflow',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });
  
  const handleSaveWorkflow = () => {
    if (!workflowData.name.trim()) {
      toast({
        title: 'Required field missing',
        description: 'Please provide a name for the workflow',
        variant: 'destructive',
      });
      return;
    }
    
    saveWorkflowMutation.mutate(workflowData);
  };
  
  const resetForm = () => {
    setWorkflowData({
      name: '',
      type: 'CKD Stage 3A Monitoring',
      description: '',
      requirements: [
        {
          testName: 'eGFR',
          frequency: 'Every 3 months',
          alertThresholdType: 'Below',
          alertThresholdValue: '30',
          alertThresholdUnit: 'mL/min',
          action: 'Alert Only'
        },
        {
          testName: 'Urine Albumin-to-Creatinine',
          frequency: 'Every 6 months',
          alertThresholdType: 'Above',
          alertThresholdValue: '300',
          alertThresholdUnit: 'mg/g',
          action: 'Alert Only'
        },
        {
          testName: 'Blood Pressure',
          frequency: 'Every visit',
          alertThresholdType: 'Above',
          alertThresholdValue: '140/90',
          alertThresholdUnit: 'mmHg',
          action: 'Alert Only'
        }
      ]
    });
  };
  
  const addNewRequirement = () => {
    setWorkflowData({
      ...workflowData,
      requirements: [
        ...workflowData.requirements,
        {
          testName: '',
          frequency: 'Every 3 months',
          alertThresholdType: 'Below',
          alertThresholdValue: '',
          alertThresholdUnit: '',
          action: 'Alert Only'
        }
      ]
    });
  };
  
  const removeRequirement = (index: number) => {
    const updatedRequirements = [...workflowData.requirements];
    updatedRequirements.splice(index, 1);
    setWorkflowData({
      ...workflowData,
      requirements: updatedRequirements
    });
  };
  
  const updateRequirement = (index: number, field: string, value: string) => {
    const updatedRequirements = [...workflowData.requirements];
    (updatedRequirements[index] as any)[field] = value;
    setWorkflowData({
      ...workflowData,
      requirements: updatedRequirements
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Patient Workflow</DialogTitle>
          <DialogDescription>
            Create a standardized monitoring workflow for patients based on their CKD stage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                className="mt-1"
                placeholder="Stage 3 CKD Monitoring"
                value={workflowData.name}
                onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
              />
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="workflow-type">Type</Label>
              <Select 
                value={workflowData.type}
                onValueChange={(value) => setWorkflowData({ ...workflowData, type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select workflow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CKD Stage 2 Monitoring">CKD Stage 2 Monitoring</SelectItem>
                  <SelectItem value="CKD Stage 3A Monitoring">CKD Stage 3A Monitoring</SelectItem>
                  <SelectItem value="CKD Stage 3B Monitoring">CKD Stage 3B Monitoring</SelectItem>
                  <SelectItem value="CKD Stage 4 Monitoring">CKD Stage 4 Monitoring</SelectItem>
                  <SelectItem value="CKD Stage 5 Monitoring">CKD Stage 5 Monitoring</SelectItem>
                  <SelectItem value="Custom Workflow">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-6">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea 
                id="workflow-description" 
                className="mt-1"
                rows={3}
                placeholder="Monitoring protocol for patients with moderately decreased kidney function"
                value={workflowData.description}
                onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900">Monitoring Requirements</h4>
            <div className="mt-3 border border-gray-200 rounded-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test / Procedure
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert Threshold
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {workflowData.requirements.map((req, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index < 3 ? (
                          req.testName
                        ) : (
                          <Input
                            value={req.testName}
                            onChange={(e) => updateRequirement(index, 'testName', e.target.value)}
                            placeholder="Test name"
                          />
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Select 
                          value={req.frequency}
                          onValueChange={(value) => updateRequirement(index, 'frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Every 3 months">Every 3 months</SelectItem>
                            <SelectItem value="Every 6 months">Every 6 months</SelectItem>
                            <SelectItem value="Every 12 months">Every 12 months</SelectItem>
                            <SelectItem value="Every visit">Every visit</SelectItem>
                            <SelectItem value="Custom...">Custom...</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Select 
                            value={req.alertThresholdType}
                            onValueChange={(value) => updateRequirement(index, 'alertThresholdType', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Below">Below</SelectItem>
                              <SelectItem value="Above">Above</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            className="w-16 mx-2"
                            value={req.alertThresholdValue}
                            onChange={(e) => updateRequirement(index, 'alertThresholdValue', e.target.value)}
                          />
                          <span className="ml-2">{req.alertThresholdUnit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Select 
                          value={req.action}
                          onValueChange={(value) => updateRequirement(index, 'action', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alert Only">Alert Only</SelectItem>
                            <SelectItem value="Schedule Appointment">Schedule Appointment</SelectItem>
                            <SelectItem value="Refer to Specialist">Refer to Specialist</SelectItem>
                            <SelectItem value="Medication Review">Medication Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-2">
                        {workflowData.requirements.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-6 py-3 bg-gray-50 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={addNewRequirement}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-primary hover:text-primary-dark focus:outline-none"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Test
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveWorkflow}
            disabled={saveWorkflowMutation.isPending}
          >
            {saveWorkflowMutation.isPending ? 'Saving...' : 'Save Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
