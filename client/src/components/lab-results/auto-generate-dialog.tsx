import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LabTest, Patient } from '@/lib/types';
import {
  generateEgfrValue,
  generateProteinuriaValue,
  calculateCreatinine,
  generateSystolicBP,
  generateDiastolicBP
} from '@/lib/ckd-utils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface AutoGenerateDialogProps {
  patient: Patient;
  doctorId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AutoGenerateDialog({
  patient,
  doctorId,
  onSuccess,
  trigger
}: AutoGenerateDialogProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [useExistingValues, setUseExistingValues] = useState(true);
  const [selectedTests, setSelectedTests] = useState<{ [key: string]: boolean }>({
    egfr: true,
    creatinine: true,
    proteinuria: true,
    bloodPressure: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labTests, isLoading } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
    select: (data) => {
      const patientGender = patient?.gender;
      return data.filter(test => {
        if (patientGender === 'M') {
          return !test.testName.toLowerCase().includes('femme');
        } else if (patientGender === 'F') {
          return !test.testName.toLowerCase().includes('homme');
        }
        return true;
      });
    }
  });

  const generateLabResultsMutation = useMutation({
    mutationFn: async (results: any[]) => {
      setGenerating(true);
      const promises = results.map(result => 
        apiRequest('POST', '/api/patient-lab-results', result)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: [`/api/patient-lab-results/patient/${patient.id}`] });
      toast({
        title: 'Lab results generated',
        description: 'Lab results have been generated successfully',
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setGenerating(false);
      toast({
        title: 'Error',
        description: 'Failed to generate lab results: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  });

  const handleGenerateResults = () => {
    const results: any[] = [];
    const resultDate = new Date().toISOString().split('T')[0];

    // Get the appropriate lab test IDs
    const egfrTest = labTests?.find(test => test.testName === 'eGFR');
    const creatinineTest = labTests?.find(test => test.testName === 'Serum Creatinine');
    const proteinuriaTest = labTests?.find(test => test.testName === 'Urine Albumin-to-Creatinine Ratio');
    const bpTest = labTests?.find(test => test.testName === 'Blood Pressure');

    // Generate eGFR result
    if (selectedTests.egfr && egfrTest) {
      const egfrValue = useExistingValues && patient.lastEgfrValue 
        ? patient.lastEgfrValue 
        : generateEgfrValue(patient.ckdStage);

      results.push({
        patientId: patient.id,
        doctorId,
        labTestId: egfrTest.id,
        resultValue: egfrValue,
        resultDate
      });
    }

    // Generate creatinine result
    if (selectedTests.creatinine && creatinineTest) {
      // Calculate age from birthdate
      const birthDate = new Date(patient.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Use the last eGFR value or generate new one
      const egfrValue = useExistingValues && patient.lastEgfrValue 
        ? patient.lastEgfrValue 
        : generateEgfrValue(patient.ckdStage);

      const isFemale = patient.gender === 'F';
      const creatinineValue = calculateCreatinine(egfrValue, age, isFemale);

      results.push({
        patientId: patient.id,
        doctorId,
        labTestId: creatinineTest.id,
        resultValue: creatinineValue,
        resultDate
      });
    }

    // Generate proteinuria result
    if (selectedTests.proteinuria && proteinuriaTest && patient.proteinuriaLevel) {
      const proteinuriaValue = useExistingValues && patient.lastProteinuriaValue 
        ? patient.lastProteinuriaValue 
        : generateProteinuriaValue(patient.proteinuriaLevel);

      results.push({
        patientId: patient.id,
        doctorId,
        labTestId: proteinuriaTest.id,
        resultValue: proteinuriaValue,
        resultDate
      });
    }

    // Generate blood pressure result
    if (selectedTests.bloodPressure && bpTest) {
      const systolicBP = generateSystolicBP(patient.ckdStage);
      const diastolicBP = generateDiastolicBP(systolicBP);
      const bpValue = systolicBP; // We store only systolic for simplicity

      results.push({
        patientId: patient.id,
        doctorId,
        labTestId: bpTest.id,
        resultValue: bpValue,
        resultDate
      });
    }

    if (results.length > 0) {
      generateLabResultsMutation.mutate(results);
    } else {
      toast({
        title: 'No tests selected',
        description: 'Please select at least one test to generate',
        variant: 'destructive',
      });
    }
  };

  const handleTestToggle = (testName: string, checked: boolean) => {
    setSelectedTests(prev => ({
      ...prev,
      [testName]: checked
    }));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Auto-generate Results</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Lab Results</DialogTitle>
          <DialogDescription>
            Automatically generate lab results for this patient based on their CKD stage and proteinuria level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-existing"
              checked={useExistingValues}
              onCheckedChange={setUseExistingValues}
            />
            <Label htmlFor="use-existing">
              Use existing values when available
            </Label>
          </div>

          <div className="border rounded-md p-4">
            <div className="text-sm font-medium mb-3">Select tests to generate:</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="egfr" 
                  checked={selectedTests.egfr}
                  onCheckedChange={(checked) => handleTestToggle('egfr', checked as boolean)} 
                />
                <label
                  htmlFor="egfr"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  eGFR
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="creatinine" 
                  checked={selectedTests.creatinine}
                  onCheckedChange={(checked) => handleTestToggle('creatinine', checked as boolean)} 
                />
                <label
                  htmlFor="creatinine"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Serum Creatinine
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="proteinuria" 
                  checked={selectedTests.proteinuria}
                  onCheckedChange={(checked) => handleTestToggle('proteinuria', checked as boolean)} 
                  disabled={!patient.proteinuriaLevel}
                />
                <label
                  htmlFor="proteinuria"
                  className={`text-sm font-medium leading-none ${!patient.proteinuriaLevel ? 'opacity-50' : ''}`}
                >
                  Proteinuria (ACR)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bloodPressure" 
                  checked={selectedTests.bloodPressure}
                  onCheckedChange={(checked) => handleTestToggle('bloodPressure', checked as boolean)} 
                />
                <label
                  htmlFor="bloodPressure"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Blood Pressure
                </label>
              </div>
            </div>
          </div>

          {!patient.proteinuriaLevel && (
            <div className="flex p-4 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                Proteinuria level is not set for this patient. The proteinuria test will use default values if generated.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateResults}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : 'Generate Results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}