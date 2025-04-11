
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from '@/components/ui/loader';
import { Save } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Email invalide')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || ''
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      setIsEmailLoading(true);
      await apiRequest('PUT', '/api/admin/profile', { email: data.email });
      toast({
        title: 'Email mis à jour',
        description: 'Votre email a été mis à jour avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de l\'email',
        variant: 'destructive'
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsPasswordLoading(true);
      await apiRequest('POST', '/api/admin/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre mot de passe a été mis à jour avec succès'
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du mot de passe',
        variant: 'destructive'
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Paramètres Administrateur</h1>

      <div className="space-y-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Modifier l'email</CardTitle>
            <CardDescription>
              Mettez à jour l'adresse email de votre compte administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormControl>
                        <Input type="email" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isEmailLoading}
                  className="w-full h-11 text-base"
                >
                  {isEmailLoading ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Mettre à jour l'email
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Changer le mot de passe</CardTitle>
            <CardDescription>
              Mettez à jour le mot de passe de votre compte administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Mot de passe actuel</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isPasswordLoading}
                  className="w-full h-11 text-base"
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
