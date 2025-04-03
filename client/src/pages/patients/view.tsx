import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft, Edit, Calendar, FileText, AlertCircle,
  PlusCircle, Download, ChevronUp, ChevronDown
} from 'lucide-react';
import { AutoGenerateDialog } from '@/components/lab-results/auto-generate-dialog';
import { GenerateReport } from '@/components/patient-report/generate-report';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { AvatarName } from '@/components/ui/avatar-name';
import { Loader, PageLoader } from '@/components/ui/loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Patient, PatientLabResult, Appointment, LabTest, Doctor, Workflow } from '@/lib/types';
import {
  getCKDStageColor,
  calculateAge,
  formatDate,
  formatTime,
  getStatusColor,
} from '@/lib/utils';
import { determineProgressionRisk } from '@/lib/ckd-utils';

interface PatientViewProps {
  id: string;
}

export default function PatientView({ id }: PatientViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const patientId = id?.toString();

  // Dialog states
  const [addLabResultDialogOpen, setAddLabResultDialogOpen] = useState(false);
  const [addAppointmentDialogOpen, setAddAppointmentDialogOpen] = useState(false);
  const [patientDetailsDialogOpen, setPatientDetailsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('lab-results');

  // Form states
  const [labTestId, setLabTestId] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [resultDate, setResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [purpose, setPurpose] = useState('');

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
    enabled: !!id && id !== 'undefined',
    queryFn: async () => {
      if (!id || id === 'undefined') {
        setLocation('/patients');
        throw new Error('Invalid patient ID');
      }
      const response = await apiRequest('GET', `/api/patients/${id}`);
      return response;
    },
  });

  // Set doctor if missing
  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
    enabled: !!id && id !== 'undefined',
    queryFn: async () => {
      if (!id || id === 'undefined') {
        setLocation('/patients');
        throw new Error('Invalid patient ID');
      }
      const response = await apiRequest('GET', `/api/patients/${id}`);
      return response;
    },
  });

  // Set doctor if missing
  useEffect(() => {
    const updateDoctor = async () => {
      if (patient && !patient.doctor && user) {
        try {
          await apiRequest('PUT', `/api/patients/${patient._id}`, {
            ...patient,
            doctor: user.id
          });
          queryClient.invalidateQueries({ queryKey: [`/api/patients/${id}`] });
        } catch (error) {
          console.error('Failed to update doctor:', error);
        }
      }
    };
    updateDoctor();
  }, [patient, user, id, queryClient]);

  // Fetch lab results
  const { data: labResults, isLoading: labResultsLoading } = useQuery<PatientLabResult[]>({
    queryKey: [`/api/patient-lab-results/patient/${patientId}`],
    enabled: !!patientId,
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/patient/${patientId}`],
    enabled: !!patientId,
  });

  // Fetch lab tests for dropdown
  const { data: labTests } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
  });

  // Fetch doctors for dropdown
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  // Fetch workflows
  const { data: workflows } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
  });

  // Mutation for adding lab result
  const addLabResultMutation = useMutation({
    mutationFn: async (newResult: any) => {
      return apiRequest('POST', '/api/patient-lab-results', newResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patient-lab-results/patient/${patientId}`] });
      toast({
        title: 'Lab result added',
        description: 'Lab result has been added successfully',
      });
      setAddLabResultDialogOpen(false);
      resetLabResultForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add lab result: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for adding appointment
  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppointment: any) => {
      return apiRequest('POST', '/api/appointments', newAppointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/patient/${patientId}`] });
      toast({
        title: 'Appointment scheduled',
        description: 'The appointment has been scheduled successfully',
      });
      setAddAppointmentDialogOpen(false);
      resetAppointmentForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  });


  // Reset forms
  const resetLabResultForm = () => {
    setLabTestId('');
    setResultValue('');
    setResultDate(new Date().toISOString().split('T')[0]);
  };

  const resetAppointmentForm = () => {
    setAppointmentDate('');
    setAppointmentTime('');
    setDoctorId('');
    setPurpose('');
  };

  // Loading state for initial data fetch
  if (patientLoading || !patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Chargement des données patient...</p>
      </div>
    );
  }

  if (!patient) {
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

  // Ensure user data exists
  if (!patient.user) {
    return <PageLoader />;
  }

  // Wait for additional data to load
  if (!labTests || !doctors) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Chargement des données complémentaires...</p>
      </div>
    );
  }

  // Wait for additional data to load
  if (!labTests || !doctors) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Chargement des données complémentaires...</p>
      </div>
    );
  }

  const stageColors = getCKDStageColor(patient.ckdStage);
  const age = calculateAge(patient.birthDate);
  const progressionRisk = determineProgressionRisk(patient.lastEgfrValue, patient.proteinuriaLevel);

  // Get recent test results
  const recentResults = labResults?.sort((a, b) =>
    new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime()
  ).slice(0, 5);

  // Get test result status
  const getTestStatus = (result: PatientLabResult) => {
    const test = labTests?.find(t => t._id === result.labTest);
    if (!test) return { status: 'Unknown', color: 'bg-gray-100 text-gray-700' };

    const value = parseFloat(result.resultValue.toString());
    const min = test.normalMin ? parseFloat(test.normalMin.toString()) : undefined;
    const max = test.normalMax ? parseFloat(test.normalMax.toString()) : undefined;

    if (min === undefined || max === undefined) {
      return { status: 'No Range', color: 'bg-gray-100 text-gray-700' };
    }

    if (value < min) {
      return { status: 'Below Normal', color: 'bg-orange-100 text-orange-700' };
    } else if (value > max) {
      return { status: 'Above Normal', color: 'bg-red-100 text-red-700' };
    }

    return { status: 'Normal', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="flex flex-col space-y-6">
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
          <h1 className="text-2xl font-semibold text-gray-900">Patient Profile</h1>
        </div>
        <div className="flex gap-2">
          <GenerateReport patient={patient} />
          <Link href={`/patients/edit/${patient._id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column - Patient info */}
        <div className="md:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col items-center space-y-4">
                  {patient?.user ? (
                    <>
                      <AvatarName
                        firstName={patient.user.firstName}
                        lastName={patient.user.lastName}
                        size="lg"
                      />
                      <div className="text-center">
                        <h2 className="text-xl font-semibold">
                          {patient.user.firstName} {patient.user.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">{patient.user.email}</p>
                        <p className="text-sm text-gray-500">ID: P-{patient._id?.toString()}</p>
                      </div>
                      <Badge variant="outline" className={`${stageColors.bg} ${stageColors.text}`}>
                        {patient.ckdStage || 'Stage not set'}
                      </Badge>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Loader size="lg" />
                      <p className="mt-2 text-sm text-gray-500">Loading patient data...</p>
                    </div>
                  )}
                </div>
              </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Birth Date</span>
                      <span>{formatDate(patient.birthDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender</span>
                      <span>{patient.gender === 'M' ? 'Male' : 'Female'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span>{patient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span>{patient.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* CKD Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">CKD Status</h3>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">eGFR</span>
                      <span>{patient.lastEgfrValue || 'Not measured'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Proteinuria</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {patient.proteinuriaLevel || 'Not assessed'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Risk Level</span>
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
              </div>
            </CardContent>
          </Card>

          {/* Recent Lab Results Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Test Results</CardTitle>
              <CardDescription>Last 5 laboratory results</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults && recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults.map((result) => {
                    const test = labTests?.find(t => t._id === result.labTest);
                    const status = getTestStatus(result);

                    return (
                      <div key={result._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{test?.testName}</div>
                            <div className="text-sm text-gray-500">{formatDate(result.resultDate)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {result.resultValue} {test?.unit}
                            </div>
                            <Badge variant="outline" className={status.color}>
                              {status.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No recent test results
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs */}
        <div className="md:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            {/* Lab Results Tab */}
            <TabsContent value="lab-results">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Laboratory Results</CardTitle>
                    <CardDescription>Complete test history and analysis</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setAddLabResultDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Result
                    </Button>
                    {labTests && (
                      <AutoGenerateDialog
                        patient={patient}
                        labTests={labTests}
                        doctorId={1}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {labResultsLoading ? (
                    <div className="h-60 flex items-center justify-center">
                      <Loader size="lg" />
                    </div>
                  ) : labResults?.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium">No lab results yet</h3>
                      <p className="text-sm">Add a lab result to get started</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setAddLabResultDialogOpen(true)}
                      >
                        Add First Result
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Test</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Normal Range</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Doctor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {labResults.map((result) => {
                              const test = labTests?.find(t => t._id === result.labTest);
                              const status = getTestStatus(result);
                              const doctor = doctors?.find(d => d._id === result.doctor);

                              return (
                                <TableRow key={result._id}>
                                  <TableCell className="font-medium">
                                    {test?.testName}
                                  </TableCell>
                                  <TableCell>
                                    {result.resultValue} {test?.unit}
                                  </TableCell>
                                  <TableCell>
                                    {test?.normalMin} - {test?.normalMax} {test?.unit}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={status.color}>
                                      {status.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(result.resultDate)}
                                  </TableCell>
                                  <TableCell>
                                    {doctor ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'N/A'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Test Results Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">eGFR Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {/* Add eGFR trend chart here */}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Risk Assessment</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <div className="text-sm font-medium">Current Risk Level</div>
                                  <Badge variant="outline" className={
                                    progressionRisk === 'High' ? 'bg-red-50 text-red-700' :
                                      progressionRisk === 'Moderate' ? 'bg-yellow-50 text-yellow-700' :
                                        'bg-green-50 text-green-700'
                                  }>
                                    {progressionRisk} Risk
                                  </Badge>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Key Factors</div>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    <li>eGFR: {patient.lastEgfrValue || 'Not measured'}</li>
                                    <li>Proteinuria: {patient.proteinuriaLevel || 'Not assessed'}</li>
                                    <li>CKD Stage: {patient.ckdStage}</li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Scheduled and past visits</CardDescription>
                  </div>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setAddAppointmentDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="h-60 flex items-center justify-center">
                      <Loader size="lg" />
                    </div>
                  ) : appointments?.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center text-gray-500">
                      <Calendar className="h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium">No appointments yet</h3>
                      <p className="text-sm">Schedule your first appointment</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setAddAppointmentDialogOpen(true)}
                      >
                        Schedule Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Upcoming Appointments */}
                      <div>
                        <h3 className="text-sm font-medium mb-3">Upcoming Appointments</h3>
                        <div className="space-y-3">
                          {appointments
                            .filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'cancelled')
                            .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                            .map(appointment => {
                              const doctor = doctors?.find(d => d._id === appointment.doctor);
                              const statusColor = getStatusColor(appointment.status);

                              return (
                                <Card key={appointment._id} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-md font-medium">
                                        {formatDate(appointment.appointmentDate)}
                                        <span className="text-gray-500 ml-2">
                                          {formatTime(appointment.appointmentDate)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1">
                                        {appointment.purpose || 'General consultation'}
                                      </div>
                                      {doctor && (
                                        <div className="text-sm mt-2">
                                          With Dr. {doctor.user.firstName} {doctor.user.lastName}
                                          <span className="text-xs text-gray-500 ml-2">
                                            ({doctor.specialty})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </Badge>
                                  </div>
                                </Card>
                              );
                            })}
                        </div>
                      </div>

                      {/* Past Appointments */}
                      <div>
                        <h3 className="text-sm font-medium mb-3">Past Appointments</h3>
                        <div className="space-y-3">
                          {appointments
                            .filter(a => new Date(a.appointmentDate) < new Date() || a.status === 'cancelled')
                            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                            .slice(0, 5)
                            .map(appointment => {
                              const doctor = doctors?.find(d => d._id === appointment.doctor);
                              const statusColor = getStatusColor(appointment.status);

                              return (
                                <Card key={appointment._id} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-md font-medium">
                                        {formatDate(appointment.appointmentDate)}
                                        <span className="text-gray-500 ml-2">
                                          {formatTime(appointment.appointmentDate)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-500 mt-1">
                                        {appointment.purpose || 'General consultation'}
                                      </div>
                                      {doctor && (
                                        <div className="text-sm mt-2">
                                          With Dr. {doctor.user.firstName} {doctor.user.lastName}
                                          <span className="text-xs text-gray-500 ml-2">
                                            ({doctor.specialty})
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </Badge>
                                  </div>
                                </Card>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Lab Result Dialog */}
      <Dialog open={addLabResultDialogOpen} onOpenChange={setAddLabResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab Result</DialogTitle>
            <DialogDescription>
              Record a new lab test result for {patient?.user?.firstName} {patient?.user?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-type" className="text-right">
                Test Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={labTestId}
                  onValueChange={setLabTestId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test" />
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
                Result
              </Label>
              <Input
                id="result-value"
                type="number"
                step="0.01"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
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
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLabResultDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLabResultSubmit} disabled={addLabResultMutation.isPending}>
              {addLabResultMutation.isPending ? (
                <>
                  <Loader color="white" size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Result'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={addAppointmentDialogOpen} onOpenChange={setAddAppointmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for {patient?.user?.firstName} {patient?.user?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointment-date" className="text-right">
                Date
              </Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointment-time" className="text-right">
                Time
              </Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                Doctor
              </Label>
              <div className="col-span-3">
                <Select
                  value={doctorId}
                  onValueChange={setDoctorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.user.firstName} {doctor.user.lastName} ({doctor.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right">
                Purpose
              </Label>
              <Input
                id="purpose"
                placeholder="Consultation, follow-up, etc."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAppointmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAppointmentSubmit} disabled={addAppointmentMutation.isPending}>
              {addAppointmentMutation.isPending ? (
                <>
                  <Loader color="white" size="sm" className="mr-2" />
                  Scheduling...
                </>
              ) : (
                'Schedule Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const handleLabResultSubmit = () => {
  if (!labTestId || !resultValue || !resultDate) {
    toast({
      title: 'Error',
      description: 'Please fill all required fields',
      variant: 'destructive',
    });
    return;
  }

  addLabResultMutation.mutate({
    patientId,
    doctorId: 1, // Use the first doctor for now (would normally come from auth)
    labTest: labTestId,
    resultValue: parseFloat(resultValue),
    resultDate
  });
};

const handleAppointmentSubmit = () => {
  if (!appointmentDate || !appointmentTime || !doctorId || !purpose) {
    toast({
      title: 'Error',
      description: 'Please fill all required fields',
      variant: 'destructive',
    });
    return;
  }

  const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

  addAppointmentMutation.mutate({
    patientId,
    doctorId,
    appointmentDate: dateTime.toISOString(),
    purpose,
    status: 'pending'
  });
};