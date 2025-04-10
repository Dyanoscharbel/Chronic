import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Paramètres Administrateur</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-medium">Configuration Système</h2>
            <button className="btn">Maintenance du Système</button>
            <button className="btn">Gestion des Logs</button>
            <button className="btn">Sauvegarde des Données</button>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-medium">Base de Données</h2>
            <button className="btn">Optimisation de la BD</button>
            <button className="btn">Nettoyage des Données</button>
            <button className="btn">Exportation des Données</button>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-medium">Sécurité</h2>
            <button className="btn">Gestion des Accès</button>
            <button className="btn">Journaux de Sécurité</button>
            <button className="btn">Paramètres de Mot de Passe</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}