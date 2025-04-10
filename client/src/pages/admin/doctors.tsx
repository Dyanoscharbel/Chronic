
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { Doctor } from "@/lib/types";

export default function AdminDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const filteredDoctors = doctors?.filter(doctor => 
    doctor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Liste des Médecins</h1>
          <Button>
            <UserPlus className="w-5 h-5 mr-2" />
            Ajouter un Médecin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Médecins</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Rechercher un médecin..."
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
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Hôpital</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors?.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell>{doctor.user.firstName} {doctor.user.lastName}</TableCell>
                    <TableCell>{doctor.user.email}</TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>{doctor.hospital}</TableCell>
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
