import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
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
import { PatientLabResult, Patient, LabTest, Doctor } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function LabResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTest, setFilterTest] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const { data: labResults, isLoading: resultsLoading } = useQuery<PatientLabResult[]>({
    queryKey: ['/api/patient-lab-results'],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const { data: labTests, isLoading: labTestsLoading } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests'],
  });

  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const getPatientName = (patientId: number) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient ? `${patient.user.firstName} ${patient.user.lastName}` : 'Unknown Patient';
  };

  const getPatient = (patientId: string) => {
    return patients?.find(p => p._id === patientId);
  };

  const getTestName = (testId: string) => {
    const test = labTests?.find(t => t._id === testId);
    return test ? test.testName : `Test #${testId}`;
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors?.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Unknown Doctor';
  };

  // Filter results based on search and filter
  const filteredResults = labResults?.filter(result => {
    const patient = getPatient(result.patientId);
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

  // Sort by date (newest first)
  const sortedResults = [...filteredResults].sort(
    (a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + resultsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Résultats de laboratoire</h1>
        <Link href="/lab-results/add">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter un résultat</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lab Results Registry</CardTitle>
              <CardDescription>
                View and manage all laboratory test results
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search patients or tests..."
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
                    <SelectValue placeholder="Filter by test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
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
              <h3 className="text-lg font-medium">No lab results found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result) => {
                      const patient = getPatient(result.patientId);
                      const test = labTests?.find(t => t._id === result.labTest);
                      const value = result.resultValue;
                      const min = test?.normalMin;
                      const max = test?.normalMax;

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
                        <TableRow key={result._id}>
                          <TableCell>
                            {patient ? (
                              <Link href={`/patients/${patient._id}`}>
                                <AvatarName
                                  firstName={patient.user.firstName}
                                  lastName={patient.user.lastName}
                                  className="cursor-pointer hover:opacity-80"
                                />
                              </Link>
                            ) : (
                              <span className="text-gray-500">Unknown Patient</span>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + resultsPerPage, filteredResults.length)} of {filteredResults.length} results
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
    </div>
  );
}