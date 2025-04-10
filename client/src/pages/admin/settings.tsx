
import { useAuth } from '@/hooks/use-auth';
import SettingsPage from '@/pages/settings';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div>Accès non autorisé</div>;
  }

  return <SettingsPage />;
}
