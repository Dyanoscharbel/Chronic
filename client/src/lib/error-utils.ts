
import { toast } from '@/hooks/use-toast';

export const handleError = (error: any) => {
  const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
  toast({
    variant: "destructive",
    title: "Erreur",
    description: errorMessage,
  });
};
