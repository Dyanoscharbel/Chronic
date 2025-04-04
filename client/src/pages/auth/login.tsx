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
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        setLocation('/');
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
        className="w-full max-w-5xl p-4"
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="docteur@exemple.com" 
                          type="email" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white/50 backdrop-blur-sm"
                        />
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
                        <Input 
                          placeholder="********" 
                          type="password" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white/50 backdrop-blur-sm"
                        />
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
                  Se connecter
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-sm text-center text-gray-500">
              Vous n'avez pas de compte ?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
                Inscrivez-vous ici
              </Link>
            </div>
          </div>
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex flex-col justify-center items-center text-center space-y-6"
          >
            <h2 className="text-2xl font-bold text-primary">Maladie Rénale Chronique</h2>
            <div className="space-y-4">
              <p className="text-gray-600">La MRC affecte des millions de personnes dans le monde. Un suivi médical régulier est essentiel pour ralentir sa progression.</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-primary">Prévention</h3>
                  <p className="text-sm text-gray-600">Détection précoce et gestion des facteurs de risque</p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <h3 className="font-semibold text-primary">Suivi</h3>
                  <p className="text-sm text-gray-600">Surveillance régulière des marqueurs rénaux</p>
                </div>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}