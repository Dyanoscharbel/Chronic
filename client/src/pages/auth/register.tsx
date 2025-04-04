import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),
  lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  role: z.literal('medecin'),
  specialty: z.string().optional(),
  hospital: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'medecin',
      specialty: '',
      hospital: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const success = await register(data);
      if (success) {
        setLocation('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/40 via-primary/20 to-accent py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-grid-primary/[0.2] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl p-4"
      >
        <Card className="grid md:grid-cols-2 overflow-hidden w-full max-w-md shadow-2xl backdrop-blur-md bg-white/90 border border-primary/30 relative z-10">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-primary text-white text-2xl font-bold py-2 px-4 rounded"
              >
                CKD Care
              </motion.div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="docteur@exemple.com" type="email" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input placeholder="********" type="password" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécialité</FormLabel>
                      <FormControl>
                        <Input placeholder="Néphrologie" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hôpital/Clinique</FormLabel>
                      <FormControl>
                        <Input placeholder="Hôpital Général" {...field} disabled={isLoading} className="bg-white/50 backdrop-blur-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader color="white" size="sm" className="mr-2" /> : null}
                  S'inscrire
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-sm text-center text-gray-500">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
                Connectez-vous ici
              </Link>
            </div>
          </div>
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex flex-col justify-center items-center text-center space-y-6"
          >
            <h2 className="text-2xl font-bold text-primary">Gestion de la MRC</h2>
            <div className="space-y-4">
              <p className="text-gray-600">CKD Care vous aide à suivre vos patients atteints de MRC avec des outils modernes et efficaces.</p>
              <div className="grid grid-cols-1 gap-4 mt-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-white/50 rounded-lg backdrop-blur-sm"
                >
                  <h3 className="font-semibold text-primary">Surveillance Intégrée</h3>
                  <p className="text-sm text-gray-600">Suivi complet des paramètres biologiques et cliniques</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 bg-white/50 rounded-lg backdrop-blur-sm"
                >
                  <h3 className="font-semibold text-primary">Alertes Intelligentes</h3>
                  <p className="text-sm text-gray-600">Notifications en temps réel des changements critiques</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 bg-white/50 rounded-lg backdrop-blur-sm"
                >
                  <h3 className="font-semibold text-primary">Rapports Détaillés</h3>
                  <p className="text-sm text-gray-600">Génération automatique de rapports personnalisés</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}