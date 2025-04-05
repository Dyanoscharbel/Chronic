import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarName } from '@/components/ui/avatar-name';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loader';
import { PatientLabResult, Patient, LabTest, Doctor, LabResultFormData } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';


const formSchema = z.object({
  patientId: z.string().min(1, { message: 'Veuillez sélectionner un patient' }),
  labTestId: z.string().min(1, { message: 'Veuillez sélectionner un test' }),
  resultValue: z.string().min(1, { message: 'Veuillez entrer une valeur' }),
  resultDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Veuillez entrer une date valide (AAAA-MM-JJ)' }),
});

export default function LabResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTest, setFilterTest] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const resultsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<LabResultFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      labTestId: '',
      resultValue: '',
      resultDate: new Date().toISOString().split('T')[0],
    },
  });

  const { data: labResults = [], isLoading: resultsLoading } = useQuery<PatientLabResult[]>({
    queryKey: ['/api/patient-lab-results'],
    select: (data) => data.map(result => ({
      ...result,
      patient: result.patient._id ? result.patient : result.patientId,
      labTest: result.labTest._id ? result.labTest : result.labTestId
    }))
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const { data: labTests = [], isLoading: labTestsLoading } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const createLabResultMutation = useMutation({
    mutationFn: async (data: LabResultFormData) => {
      return apiRequest('POST', '/api/patient-lab-results', {
        patientId: data.patientId,
        doctorId: user?.id,
        labTestId: data.labTestId,
        resultValue: parseFloat(data.resultValue),
        resultDate: data.resultDate
      });
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Le résultat a été ajouté avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patient-lab-results'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de l\'ajout du résultat',
        variant: 'destructive',
      });
    }
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p._id === patientId);
    return patient ? `${patient.user.firstName} ${patient.user.lastName}` : 'Patient inconnu';
  };

  const getTestName = (testId: string) => {
    const test = labTests?.find(t => t._id === testId);
    return test ? test.testName : `Test #${testId}`;
  };

  const getDoctorName = (doctorId: string | undefined) => {
    const doctor = doctors?.find(d => d._id === doctorId);
    return doctor ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Médecin inconnu';
  };

  const filteredResults = labResults?.filter(result => {
    const patient = patients?.find(p => p._id === result.patientId);
    const testName = getTestName(result.labTest);

    const matchesSearch = searchQuery ? (
      patient && (
        patient.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      testName.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;

    const matchesFilter = filterTest === 'all' ? true : result.labTest === filterTest;

    return matchesSearch && matchesFilter;
  }) || [];

  const sortedResults = [...filteredResults].sort(
    (a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime()
  );

  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + resultsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const onSubmit = (data: LabResultFormData) => {
    createLabResultMutation.mutate(data);
  };

  const watchLabTestId = form.watch('labTestId');

  if (watchLabTestId && labTests && (!selectedTest || selectedTest._id.toString() !== watchLabTestId)) {
    const test = labTests.find(t => t._id.toString() === watchLabTestId);
    if (test) {
      setSelectedTest(test);
    }
  }


  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Résultats de laboratoire</h1>
        <Button className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>Ajouter un résultat</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Registre des résultats</CardTitle>
              <CardDescription>
                Consultez et gérez tous les résultats d'analyses
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher patients ou tests..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={filterTest}
                  onValueChange={setFilterTest}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les tests</SelectItem>
                    {labTests?.map(test => (
                      <SelectItem key={test._id} value={test._id.toString()}>
                        {test.testName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">Aucun résultat de laboratoire trouvé</h3>
              <p className="text-sm">Essayez d'ajuster vos critères de recherche ou de filtrage</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result) => {
                      const patient = patients?.find(p => p._id === result.patient);
                      const test = labTests?.find(t => t._id === result.labTest);
                      const value = result.resultValue ? parseFloat(result.resultValue.toString()) : 0;
                      const min = test?.normalMin ? parseFloat(test?.normalMin?.toString()) : undefined;
                      const max = test?.normalMax ? parseFloat(test?.normalMax?.toString()) : undefined;

                      let status = 'Normal';
                      let statusColor = 'text-green-600 bg-green-50';

                      if (min !== undefined && max !== undefined) {
                        if (value < min) {
                          status = 'En dessous de la normale';
                          statusColor = 'text-orange-600 bg-orange-50';
                        } else if (value > max) {
                          status = 'Au-dessus de la normale';
                          statusColor = 'text-red-600 bg-red-50';
                        }
                      }

                      return (
                        <TableRow key={result._id}>
                          <TableCell>
                            {patient ? (
                              <span>{getPatientName(patient._id)}</span>
                            ) : (
                              <span className="text-gray-500">Patient inconnu</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getTestName(result.labTest)}
                          </TableCell>
                          <TableCell>
                            {value} {test?.unit || ''}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor}>
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getDoctorName(result.doctor)}
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

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Affichage de {startIndex + 1} à {Math.min(startIndex + resultsPerPage, filteredResults.length)} sur {filteredResults.length} résultats
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <span className="flex h-9 w-9 items-center justify-center">...</span>
                        </PaginationItem>
                      )}

                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un résultat</DialogTitle>
            <DialogDescription>
              Enregistrer un nouveau résultat d'analyse
            </DialogDescription>
          </DialogHeader>

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
                          <SelectValue placeholder="Sélectionner un patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
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
                name="labTestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de test</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un test" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labTests?.map((test) => (
                          <SelectItem key={test._id} value={test._id.toString()}>
                            {test.testName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTest && selectedTest.description && (
                      <FormDescription>
                        {selectedTest.description}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur du résultat</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Entrer la valeur"
                          {...field}
                          className="rounded-r-none"
                        />
                        <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-gray-50 text-gray-500">
                          {selectedTest?.unit || ''}
                        </div>
                      </div>
                    </FormControl>
                    {selectedTest && (selectedTest.normalMin !== null || selectedTest.normalMax !== null) && (
                      <FormDescription>
                        Plage normale: {selectedTest.normalMin || 'N/A'} - {selectedTest.normalMax || 'N/A'} {selectedTest.unit || ''}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du test</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createLabResultMutation.isPending}
                >
                  {createLabResultMutation.isPending && (
                    <Loader color="white" size="sm" className="mr-2" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}