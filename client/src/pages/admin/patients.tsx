
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/lib/types";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  const filteredPatients = patients?.filter(patient => 
    patient.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Liste des Patients</h1>
        <Button>
          <UserPlus className="w-5 h-5 mr-2" />
          Ajouter un Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              placeholder="Rechercher un patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Stage CKD</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients?.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>{patient.user.firstName} {patient.user.lastName}</TableCell>
                  <TableCell>{patient.user.email}</TableCell>
                  <TableCell>{new Date(patient.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge>{patient.ckdStage}</Badge>
                  </TableCell>
                  <TableCell>{patient.doctor?.user?.firstName} {patient.doctor?.user?.lastName}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Éditer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
