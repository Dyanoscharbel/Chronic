import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Save, User, Lock, Building, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AvatarName } from '@/components/ui/avatar-name';
import { Loader } from '@/components/ui/loader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doctor } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  specialty: z.string().optional(),
  hospital: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  criticalAlertsOnly: z.boolean(),
  appointmentReminders: z.boolean(),
  labResultAlerts: z.boolean(),
});

const themeSchema = z.object({
  primaryColor: z.string(),
  variant: z.enum(['professional', 'tint', 'vibrant']),
  appearance: z.enum(['light', 'dark', 'system']),
  radius: z.number(),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, userDetails } = useAuth();
  const [selectedTab, setSelectedTab] = useState('profile');

  // Get user details if doctor
  const { data: doctorDetails, isLoading: doctorLoading } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${userDetails?.id}`],
    enabled: !!user && user.role === 'medecin' && !!userDetails,
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      specialty: userDetails?.specialty || '',
      hospital: userDetails?.hospital || '',
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Notification preferences form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      criticalAlertsOnly: false,
      appointmentReminders: true,
      labResultAlerts: true,
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return response;
    },
    onSuccess: (data) => {
      // Mettre à jour l'état d'authentification
      const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}');
      const newAuth = {
        ...currentAuth,
        user: data.user,
        userDetails: data.userDetails,
        isAuthenticated: true
      };
      localStorage.setItem('auth', JSON.stringify(newAuth));
      
      // Forcer le rechargement de la page pour mettre à jour l'interface
      window.location.reload();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    }
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      // Mock implementation as we don't have a real change password endpoint
      return apiRequest('POST', '/api/user/change-password', data);
    },
    onSuccess: () => {
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully',
      });
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    }
  });

  // Notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      // Mock implementation as we don't have a real update notifications endpoint
      return apiRequest('POST', '/api/user/notification-preferences', data);
    },
    onSuccess: () => {
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
        variant: 'destructive',
      });
    }
  });

  // Form submissions
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  const onNotificationsSubmit = (data: z.infer<typeof notificationSchema>) => {
    updateNotificationsMutation.mutate(data);
  };

  // Theme form
  const themeForm = useForm<z.infer<typeof themeSchema>>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primaryColor: 'hsl(173 74% 18%)',
      variant: 'professional',
      appearance: 'light',
      radius: 0.5,
    },
  });

  // Theme update mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof themeSchema>) => {
      // Envoyer les données au serveur pour mettre à jour theme.json
      return apiRequest('POST', '/api/user/theme', {
        primaryColor: data.primaryColor,
        variant: data.variant,
        appearance: data.appearance,
        radius: data.radius
      });
    },
    onSuccess: (_, variables) => {
      // Créer un objet avec les paramètres du thème
      const themeSettings = {
        primary: variables.primaryColor,
        variant: variables.variant,
        appearance: variables.appearance,
        radius: variables.radius
      };

      // Stocker les paramètres dans localStorage pour les réutiliser au chargement
      localStorage.setItem('theme', JSON.stringify(themeSettings));

      toast({
        title: 'Thème mis à jour',
        description: 'Vos préférences de thème ont été enregistrées. Rechargement de la page...',
      });

      // Appliquer les CSS variables au document root
      document.documentElement.style.setProperty('--primary', variables.primaryColor);

      // Rechargement de la page après délai pour permettre à l'utilisateur de voir le toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de la mise à jour du thème',
        variant: 'destructive',
      });
    }
  });

  const onThemeSubmit = (data: z.infer<typeof themeSchema>) => {
    updateThemeMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="h-60 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column - User info */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <AvatarName
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="lg"
                  showName={false}
                />
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Role: {user.role && user.role === 'medecin' ? 'Medical Professional' : user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || ''}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <nav className="space-y-1">
                <Button
                  variant={selectedTab === 'profile' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant={selectedTab === 'password' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTab('password')}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Password
                </Button>
                <Button
                  variant={selectedTab === 'notifications' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTab('notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant={selectedTab === 'theme' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTab('theme')}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Theme
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Settings tabs */}
        <div className="md:col-span-3">
          <Card className="h-full">
            {selectedTab === 'profile' && (
              <>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormDescription>
                                Email cannot be changed
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {user.role === 'medecin' && (
                          <>
                            <FormField
                              control={profileForm.control}
                              name="specialty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specialty</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Nephrology" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="hospital"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hospital/Clinic</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. General Hospital" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>

                      <CardFooter className="px-0 pt-4 pb-0">
                        <Button
                          type="submit"
                          className="ml-auto"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader size="sm" color="white" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}

            {selectedTab === 'password' && (
              <>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
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
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <CardFooter className="px-0 pt-4 pb-0">
                        <Button
                          type="submit"
                          className="ml-auto"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader size="sm" color="white" className="mr-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}

            {selectedTab === 'notifications' && (
              <>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="criticalAlertsOnly"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Critical Alerts Only</FormLabel>
                                <FormDescription>
                                  Only receive notifications for critical alerts
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="appointmentReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Appointment Reminders</FormLabel>
                                <FormDescription>
                                  Receive reminders for upcoming appointments
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="labResultAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Lab Result Alerts</FormLabel>
                                <FormDescription>
                                  Receive alerts for new lab results
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <CardFooter className="px-0 pt-4 pb-0">
                        <Button
                          type="submit"
                          className="ml-auto"
                          disabled={updateNotificationsMutation.isPending}
                        >
                          {updateNotificationsMutation.isPending ? (
                            <>
                              <Loader size="sm" color="white" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}

            {selectedTab === 'theme' && (
              <>
                <CardHeader>
                  <CardTitle>Application Theme</CardTitle>
                  <CardDescription>
                    Customize the application appearance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...themeForm}>
                    <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={themeForm.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Color</FormLabel>
                              <div className="grid grid-cols-5 gap-3">
                                {['hsl(173 74% 18%)', 'hsl(221 83% 53%)', 'hsl(142 76% 36%)', 'hsl(346 84% 61%)', 'hsl(270 67% 47%)'].map((color) => (
                                  <div 
                                    key={color} 
                                    className={`h-12 rounded-md border-2 cursor-pointer transition-all ${field.value === color ? 'ring-2 ring-offset-2 border-primary' : 'border-muted'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => field.onChange(color)}
                                  />
                                ))}
                              </div>
                              <FormDescription>
                                Choose a primary color for the application
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={themeForm.control}
                          name="variant"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color Variant</FormLabel>
                              <div className="grid grid-cols-3 gap-4">
                                {[
                                  { value: 'professional', label: 'Professional' },
                                  { value: 'tint', label: 'Tint' },
                                  { value: 'vibrant', label: 'Vibrant' },
                                ].map((variant) => (
                                  <div
                                    key={variant.value}
                                    className={`border rounded-md p-4 text-center cursor-pointer transition-all hover:border-primary ${field.value === variant.value ? 'bg-muted border-primary' : ''}`}
                                    onClick={() => field.onChange(variant.value)}
                                  >
                                    {variant.label}
                                  </div>
                                ))}
                              </div>
                              <FormDescription>
                                Set how intense the color should appear
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={themeForm.control}
                          name="appearance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appearance</FormLabel>
                              <div className="grid grid-cols-3 gap-4">
                                {[
                                  { value: 'light', label: 'Light' },
                                  { value: 'dark', label: 'Dark' },
                                  { value: 'system', label: 'System' },
                                ].map((appearance) => (
                                  <div
                                    key={appearance.value}
                                    className={`border rounded-md p-4 text-center cursor-pointer transition-all hover:border-primary ${field.value === appearance.value ? 'bg-muted border-primary' : ''}`}
                                    onClick={() => field.onChange(appearance.value)}
                                  >
                                    {appearance.label}
                                  </div>
                                ))}
                              </div>
                              <FormDescription>
                                Choose light or dark mode, or follow system settings
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={themeForm.control}
                          name="radius"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Border Radius: {field.value}</FormLabel>
                              <FormControl>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-full"
                                />
                              </FormControl>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Square</span>
                                <span>Round</span>
                              </div>
                              <FormDescription>
                                Adjust the roundness of UI elements
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Theme Preview */}
                        <div className="bg-muted p-4 rounded-md mt-6">
                          <h3 className="text-md font-medium mb-2">Theme Preview</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Button 
                              size="sm" 
                              style={{
                                backgroundColor: themeForm.watch('primaryColor'),
                                borderRadius: `${themeForm.watch('radius') * 0.5}rem`
                              }}
                            >
                              Primary Button
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              style={{
                                borderRadius: `${themeForm.watch('radius') * 0.5}rem`
                              }}
                            >
                              Secondary Button
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              style={{
                                borderRadius: `${themeForm.watch('radius') * 0.5}rem`
                              }}
                            >
                              Destructive Button
                            </Button>
                          </div>
                        </div>
                      </div>

                      <CardFooter className="px-0 pt-4 pb-0">
                        <Button
                          type="submit"
                          className="ml-auto"
                          disabled={updateThemeMutation.isPending}
                          style={{
                            backgroundColor: themeForm.watch('primaryColor'),
                            color: 'white',
                            borderRadius: `${themeForm.watch('radius') * 0.5}rem`
                          }}
                        >
                          {updateThemeMutation.isPending ? (
                            <>
                              <Loader size="sm" color="white" className="mr-2" />
                              Applying Theme...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Apply Theme
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}