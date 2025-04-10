
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres ont été mis à jour avec succès.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres Administrateur</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les notifications importantes par email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les notifications urgentes par SMS
                </p>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration du Système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'Hôpital</Label>
              <Input defaultValue="Centre Hospitalier" />
            </div>
            <div>
              <Label>Email de Contact</Label>
              <Input type="email" defaultValue="contact@hopital.com" />
            </div>
            <div>
              <Label>Numéro de Téléphone</Label>
              <Input type="tel" defaultValue="+1234567890" />
            </div>
            <Button onClick={handleSaveSettings}>
              Sauvegarder les paramètres
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
