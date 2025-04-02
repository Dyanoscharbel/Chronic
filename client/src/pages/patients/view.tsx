import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Edit, Calendar, FileText, AlertCircle, 
  PlusCircle, Download, ChevronUp, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  getStatusColor 
} from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface PatientViewProps {
  id: string;
}

export default function PatientView({ id }: PatientViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const patientId = parseInt(id);
  const [addLabResultDialogOpen, setAddLabResultDialogOpen] = useState(false);
  const [addAppointmentDialogOpen, setAddAppointmentDialogOpen] = useState(false);
  
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
    queryKey: [`/api/patients/${patientId}`],
    enabled: !isNaN(patientId),
  });
  
  // Fetch lab results
  const { data: labResults, isLoading: labResultsLoading } = useQuery<PatientLabResult[]>({
    queryKey: [`/api/patient-lab-results/patient/${patientId}`],
    enabled: !isNaN(patientId),
  });
  
  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/patient/${patientId}`],
    enabled: !isNaN(patientId),
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
  
  // Submit handlers
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
      labTestId: parseInt(labTestId),
      resultValue: parseFloat(resultValue),
      resultDate
    });
  };
  
  const handleAppointmentSubmit = () => {
    if (!appointmentDate || !appointmentTime || !doctorId) {
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
      doctorId: parseInt(doctorId),
      appointmentDate: dateTime.toISOString(),
      purpose,
      status: 'pending'
    });
  };
  
  // Loading state
  if (patientLoading || isNaN(patientId)) {
    return <PageLoader />;
  }
  
  // Handle patient not found
  if (!patient) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h1>
        <p className="text-gray-600 mb-4">The patient you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation('/patients')}>
          Return to Patient List
        </Button>
      </div>
    );
  }
  
  const stageColors = getCKDStageColor(patient.ckdStage);
  const age = calculateAge(patient.birthDate);
  
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
        <h1 className="text-2xl font-semibold text-gray-900">Patient Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column - Patient info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-gray-500">PATIENT ID: P-{patient.id.toString().padStart(5, '0')}</div>
                <Link href={`/patients/edit/${patient.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-2 pt-2">
                <AvatarName
                  firstName={patient.user.firstName}
                  lastName={patient.user.lastName}
                  size="lg"
                  showName={false}
                />
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {patient.user.firstName} {patient.user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{patient.user.email}</p>
                </div>
                <Badge variant="outline" className={`${stageColors.bg} ${stageColors.text} px-3 py-1`}>
                  {patient.ckdStage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-3 text-sm py-1">
                    <div className="text-gray-500">Age</div>
                    <div className="font-medium text-right">{age} years</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm py-1">
                    <div className="text-gray-500">Gender</div>
                    <div className="font-medium text-right">{patient.gender}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm py-1">
                    <div className="text-gray-500">Birth Date</div>
                    <div className="font-medium text-right">{formatDate(patient.birthDate)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 gap-3 text-sm py-1">
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium">{patient.phone || 'Not provided'}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm py-1">
                    <div className="text-gray-500">Address</div>
                    <div className="font-medium">{patient.address || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Assigned Workflows Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-md">Monitoring Workflows</CardTitle>
              <CardDescription>
                Active monitoring protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflows && workflows.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {workflows
                    .filter(wf => wf.ckdStage === patient.ckdStage || !wf.ckdStage)
                    .map((workflow) => (
                      <AccordionItem key={workflow.id} value={`workflow-${workflow.id}`}>
                        <AccordionTrigger className="text-sm font-medium">
                          {workflow.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-500 mb-2">{workflow.description}</p>
                          {workflow.requirements && workflow.requirements.length > 0 ? (
                            <ul className="text-sm space-y-2">
                              {workflow.requirements.map((req, idx) => (
                                <li key={idx} className="flex justify-between">
                                  <span>{req.testName}</span>
                                  <span className="text-gray-500">{req.frequency}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No specific requirements</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No workflows assigned
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Tabs */}
        <div className="md:col-span-3">
          <Tabs defaultValue="lab-results">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>
            
            {/* Lab Results Tab */}
            <TabsContent value="lab-results">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Lab Results</CardTitle>
                    <CardDescription>Patient's laboratory test results</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => setAddLabResultDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Result</span>
                    </Button>
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Normal Range</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labResults?.map((result) => {
                            const test = labTests?.find(t => t.id === result.labTestId);
                            const value = parseFloat(result.resultValue.toString());
                            const min = test?.normalMin ? parseFloat(test.normalMin.toString()) : undefined;
                            const max = test?.normalMax ? parseFloat(test.normalMax.toString()) : undefined;
                            
                            let status = 'Normal';
                            let statusColor = 'text-green-600 bg-green-50';
                            
                            if (min !== undefined && max !== undefined) {
                              if (value < min) {
                                status = 'Below Normal';
                                statusColor = 'text-orange-600 bg-orange-50';
                              } else if (value > max) {
                                status = 'Above Normal';
                                statusColor = 'text-red-600 bg-red-50';
                              }
                            }
                            
                            return (
                              <TableRow key={result.id}>
                                <TableCell className="font-medium">
                                  {test?.testName || `Test #${result.labTestId}`}
                                </TableCell>
                                <TableCell>
                                  {value} {test?.unit || ''}
                                </TableCell>
                                <TableCell>
                                  {min !== undefined && max !== undefined 
                                    ? `${min} - ${max} ${test?.unit || ''}`
                                    : 'Not specified'
                                  }
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusColor}>
                                    {status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatDate(result.resultDate)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
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
                    <CardDescription>Scheduled and past appointments</CardDescription>
                  </div>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setAddAppointmentDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
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
                      <p className="text-sm">Schedule an appointment to get started</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setAddAppointmentDialogOpen(true)}
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Appointments</h3>
                        {appointments?.filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'cancelled').length === 0 ? (
                          <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded-md">
                            No upcoming appointments
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {appointments
                              ?.filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'cancelled')
                              .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                              .map((appointment) => {
                                const doctor = doctors?.find(d => d.id === appointment.doctorId);
                                const statusColor = getStatusColor(appointment.status);
                                
                                return (
                                  <Card key={appointment.id} className="p-4">
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
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Past Appointments</h3>
                        {appointments?.filter(a => new Date(a.appointmentDate) < new Date() || a.status === 'cancelled').length === 0 ? (
                          <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded-md">
                            No past appointments
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {appointments
                              ?.filter(a => new Date(a.appointmentDate) < new Date() || a.status === 'cancelled')
                              .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                              .slice(0, 5) // Show only the most recent 5
                              .map((appointment) => {
                                const doctor = doctors?.find(d => d.id === appointment.doctorId);
                                const statusColor = getStatusColor(appointment.status);
                                
                                return (
                                  <Card key={appointment.id} className="p-4">
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
                        )}
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
              Record a new lab test result for {patient.user.firstName} {patient.user.lastName}
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
                      <SelectItem key={test.id} value={test.id.toString()}>
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
            <Button 
              onClick={handleLabResultSubmit}
              disabled={addLabResultMutation.isPending}
            >
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
              Schedule a new appointment for {patient.user.firstName} {patient.user.lastName}
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
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
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
            <Button 
              onClick={handleAppointmentSubmit}
              disabled={addAppointmentMutation.isPending}
            >
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
