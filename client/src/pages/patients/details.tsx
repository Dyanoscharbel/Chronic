
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Patient, PatientLabResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { getCKDStageColor, calculateAge, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientDetailsProps {
  id: string;
}

export default function PatientDetails({ id }: PatientDetailsProps) {
  const [, setLocation] = useLocation();

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
  });

  const { data: labResults = [], isLoading: resultsLoading } = useQuery<PatientLabResult[]>({
    queryKey: [`/api/patient-lab-results/patient/${id}`],
    enabled: !!id,
  });

  if (patientLoading || resultsLoading) {
    return <PageLoader />;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const stageColors = getCKDStageColor(patient.ckdStage);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setLocation('/patients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Détails du Patient
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom Complet</p>
                <p className="text-lg font-semibold">{patient.user.firstName} {patient.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID Patient</p>
                <p className="text-lg">P-{patient._id.toString().padStart(5, '0')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{patient.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="text-lg">{patient.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age/Genre</p>
                <p className="text-lg">{calculateAge(patient.birthDate)} ans / {patient.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date de Naissance</p>
                <p className="text-lg">{formatDate(patient.birthDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse</p>
                <p className="text-lg">{patient.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stade MRC</p>
                <Badge variant="outline" className={`${stageColors.bg} ${stageColors.text} px-2 py-1`}>
                  {patient.ckdStage}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats de Laboratoire</CardTitle>
          </CardHeader>
          <CardContent>
            {labResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun résultat de laboratoire disponible</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Résultat</TableHead>
                    <TableHead>Unité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labResults.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>{formatDate(result.resultDate)}</TableCell>
                      <TableCell>{result.labTest.testName}</TableCell>
                      <TableCell>{result.resultValue}</TableCell>
                      <TableCell>{result.labTest.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
