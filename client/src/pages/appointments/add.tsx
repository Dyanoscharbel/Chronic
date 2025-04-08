import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from '@/components/ui/loader';
import { Patient, Doctor, AppointmentFormData } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

const formSchema = z.object({
  patientId: z.string().min(1, { message: 'Please select a patient' }),
  doctorId: z.string().min(1, { message: 'Please select a doctor' }),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date (YYYY-MM-DD)' }),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Please enter a valid time (HH:MM)' }),
  purpose: z.string().optional(),
});

export default function AppointmentAdd() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Load data for dropdowns
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  const { data: doctors, isLoading: doctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });
  
  // Define form
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      purpose: '',
    },
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const dateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      
      return apiRequest('POST', '/api/appointments', {
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        appointmentDate: dateTime.toISOString(),
        purpose: data.purpose,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Appointment has been scheduled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setLocation('/appointments');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule appointment',
        variant: 'destructive',
      });
    }
  });
  
  // Form submission
  const onSubmit = (data: AppointmentFormData) => {
    createAppointmentMutation.mutate(data);
  };
  
  const isLoading = patientsLoading || doctorsLoading;
  
  // Check if the selected date is in the past
  const isPastDate = (date: string, time: string) => {
    const selectedDate = new Date(`${date}T${time}`);
    return selectedDate < new Date();
  };
  
  // Watch date and time values
  const watchDate = form.watch('appointmentDate');
  const watchTime = form.watch('appointmentTime');
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setLocation('/appointments')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Schedule Appointment</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>New Appointment</CardTitle>
          <CardDescription>
            Schedule a new appointment for a patient with a doctor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id.toString()}>
                              {patient.user.firstName} {patient.user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors?.map((doctor) => (
                            <SelectItem key={doctor._id} value={doctor._id.toString()}>
                              Dr. {doctor.user.firstName} {doctor.user.lastName} ({doctor.specialty})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {isPastDate(watchDate, watchTime) && (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="text-yellow-700">
                        <p>Warning: You are scheduling an appointment in the past.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the reason for this appointment"
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any relevant details about the appointment purpose.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <CardFooter className="flex justify-between px-0 pb-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/appointments')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createAppointmentMutation.isPending}
                  >
                    {createAppointmentMutation.isPending && (
                      <Loader color="white" size="sm" className="mr-2" />
                    )}
                    Schedule Appointment
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
