
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from '@/components/ui/loader';
import { PatientFormData, Patient } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

interface AddEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date (YYYY-MM-DD)' }),
  gender: z.enum(['M', 'F', 'Autre'], { required_error: 'Please select a gender' }),
  address: z.string().optional(),
  phone: z.string().optional(),
  ckdStage: z.enum(['Stage 1', 'Stage 2', 'Stage 3A', 'Stage 3B', 'Stage 4', 'Stage 5'], { required_error: 'Please select a CKD stage' }),
});

export default function AddEditDialog({ isOpen, onClose, patient }: AddEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!patient;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing ? {} : {
      firstName: '',
      lastName: '',
      email: '',
      birthDate: new Date().toISOString().split('T')[0],
      gender: 'M',
      address: '',
      phone: '',
      ckdStage: 'Stage 3A',
    },
  });

  useEffect(() => {
    if (patient && isEditing) {
      form.reset({
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        email: patient.user.email,
        birthDate: new Date(patient.birthDate).toISOString().split('T')[0],
        gender: patient.gender as 'M' | 'F' | 'Autre',
        address: patient.address || '',
        phone: patient.phone || '',
        ckdStage: patient.ckdStage,
      });
    }
  }, [patient, isEditing, form]);

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      return apiRequest('POST', '/api/patients', {
        ...data,
        doctorId: user?.id
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Patient has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create patient',
        variant: 'destructive',
      });
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      return apiRequest('PUT', `/api/patients/${patient?._id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patient?._id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update patient',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: PatientFormData) => {
    if (isEditing) {
      updatePatientMutation.mutate(data);
    } else {
      createPatientMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the information for this patient'
              : 'Enter the details to register a new patient'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter email address" 
                          {...field} 
                          disabled={isEditing}
                        />
                      </FormControl>
                      {isEditing && (
                        <FormDescription>
                          Email cannot be changed after registration
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="M" />
                            </FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="F" />
                            </FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Autre" />
                            </FormControl>
                            <FormLabel className="font-normal">Other</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Contact Information</h3>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter full address" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Medical Information</h3>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ckdStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CKD Stage</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CKD stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Stage 1">Stage 1</SelectItem>
                          <SelectItem value="Stage 2">Stage 2</SelectItem>
                          <SelectItem value="Stage 3A">Stage 3A</SelectItem>
                          <SelectItem value="Stage 3B">Stage 3B</SelectItem>
                          <SelectItem value="Stage 4">Stage 4</SelectItem>
                          <SelectItem value="Stage 5">Stage 5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
              >
                {(createPatientMutation.isPending || updatePatientMutation.isPending) && (
                  <Loader color="white" size="sm" className="mr-2" />
                )}
                {isEditing ? 'Update Patient' : 'Create Patient'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
