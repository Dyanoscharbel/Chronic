
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { getCKDStageColor, calculateAge, formatDate } from '@/lib/utils';

interface PatientDetailsProps {
  id: string;
}

export default function PatientDetails({ id }: PatientDetailsProps) {
  const [, setLocation] = useLocation();

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
  });

  if (isLoading) {
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
          Patient Details
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg">{patient.user.firstName} {patient.user.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Patient ID</p>
              <p className="text-lg">P-{patient._id.toString().padStart(5, '0')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{patient.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg">{patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Age/Gender</p>
              <p className="text-lg">{calculateAge(patient.birthDate)} / {patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Birth Date</p>
              <p className="text-lg">{formatDate(patient.birthDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-lg">{patient.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CKD Stage</p>
              <Badge variant="outline" className={`${stageColors.bg} ${stageColors.text} px-2 py-1`}>
                {patient.ckdStage}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
