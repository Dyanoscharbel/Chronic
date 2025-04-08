import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft, Edit, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { AvatarName } from '@/components/ui/avatar-name';
import { Patient, PatientLabResult, Appointment } from '@/lib/types';
import { calculateAge, formatDate, formatTime, getCKDStageColor } from '@/lib/utils';
import { Link } from 'wouter';
import { determineProgressionRisk } from '@/lib/ckd-utils';

interface PatientViewProps {
  id: string;
}

export default function PatientView({ id }: PatientViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
    queryFn: async () => {
      if (!id) {
        setLocation('/patients');
        throw new Error('Invalid patient ID');
      }
      const response = await apiRequest('GET', `/api/patients/${id}`);
      if (!response?.data) {
        throw new Error('Patient not found');
      }
      return response.data;
    }
  });

  // Fetch lab results
  const { data: labResults = [] } = useQuery<PatientLabResult[]>({
    queryKey: [`/api/patient-lab-results/patient/${id}`],
    enabled: !!id && !!patient,
  });

  // Fetch appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/patient/${id}`],
    enabled: !!id && !!patient,
  });

  if (patientLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Chargement des données patient...</p>
      </div>
    );
  }

  if (!patient || !patient.user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient introuvable</h1>
        <p className="text-gray-600 mb-4">Le patient que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button onClick={() => setLocation('/patients')}>
          Retour à la liste des patients
        </Button>
      </div>
    );
  }

  const stageColors = getCKDStageColor(patient.ckdStage);
  const age = calculateAge(patient.birthDate);
  const progressionRisk = determineProgressionRisk(patient.lastEgfrValue, patient.proteinuriaLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/patients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Dossier Patient</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/edit/${patient._id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Modifier le profil</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <AvatarName
              firstName={patient.user.firstName}
              lastName={patient.user.lastName}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-bold">{patient.user.firstName} {patient.user.lastName}</h2>
              <p className="text-gray-500">{patient.user.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`text-lg ${stageColors.bg} ${stageColors.text}`}>
            {patient.ckdStage || 'Stage non défini'}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Informations Personnelles</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Date de naissance</span>
                <span>{formatDate(patient.birthDate)} ({age} ans)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Genre</span>
                <span>{patient.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone</span>
                <span>{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adresse</span>
                <span>{patient.address}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Informations Médicales</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Médecin traitant</span>
                <span>Dr. {patient.doctor?.user.firstName} {patient.doctor?.user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stade IRC</span>
                <span>{patient.ckdStage || 'Non défini'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">eGFR</span>
                <span>{patient.lastEgfrValue || 'Non mesuré'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Protéinurie</span>
                <span>{patient.proteinuriaLevel || 'Non évalué'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Niveau de risque</span>
                <Badge variant="outline" className={
                  progressionRisk === 'High' ? 'bg-red-50 text-red-700' :
                    progressionRisk === 'Moderate' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                }>
                  {progressionRisk}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats de Laboratoire</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Test</th>
                <th className="text-left">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {labResults.map((result) => (
                <tr key={result._id}>
                  <td>{formatDate(result.resultDate)}</td>
                  <td>{result.labTest}</td>
                  <td>{result.resultValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{formatDate(appointment.appointmentDate)} à {formatTime(appointment.appointmentDate)}</p>
                    <p className="text-gray-500">{appointment.purpose}</p>
                  </div>
                  <Badge className={getStatusColor(appointment.doctorStatus).bg}>
                    {appointment.doctorStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}