
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Settings, Database, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Paramètres Administrateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuration Système
              </CardTitle>
              <CardDescription>
                Paramètres généraux du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Maintenance du Système</Button>
              <Button className="w-full">Gestion des Logs</Button>
              <Button className="w-full">Sauvegarde des Données</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Base de Données
              </CardTitle>
              <CardDescription>
                Gestion de la base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Optimisation de la BD</Button>
              <Button className="w-full">Nettoyage des Données</Button>
              <Button className="w-full">Exportation des Données</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Gestion des Accès</Button>
              <Button className="w-full">Journaux de Sécurité</Button>
              <Button className="w-full">Paramètres de Mot de Passe</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
