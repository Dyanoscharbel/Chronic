
import { SettingsPage } from '@/pages/settings';
import { AppLayout } from '@/components/layout/app-layout';

export default function AdminSettingsPage() {
  return (
    <AppLayout isAdmin>
      <SettingsPage />
    </AppLayout>
  );
}
