
import { create } from 'zustand';

type Language = 'fr' | 'en';

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

const translations = {
  fr: {
    // Auth
    'login': 'Connexion',
    'register': 'Inscription',
    'email': 'Email',
    'password': 'Mot de passe',
    'logout': 'Déconnexion',
    
    // Navigation
    'dashboard': 'Tableau de bord',
    'patients': 'Patients',
    'appointments': 'Rendez-vous',
    'lab_results': 'Résultats laboratoire',
    'notifications': 'Notifications',
    'settings': 'Paramètres',
    
    // Settings
    'profile': 'Profil',
    'notifications_settings': 'Notifications',
    'theme': 'Thème',
    'language': 'Langue',
    'save_changes': 'Enregistrer',
    'saving': 'Enregistrement...',
    'firstName': 'Prénom',
    'lastName': 'Nom',
    'currentPassword': 'Mot de passe actuel',
    'newPassword': 'Nouveau mot de passe',
    'confirmPassword': 'Confirmer le mot de passe',
    'profile_updated': 'Profil mis à jour',
    'password_changed': 'Mot de passe modifié',
    'preferences_updated': 'Préférences mises à jour',
  },
  en: {
    // Auth
    'login': 'Login',
    'register': 'Register',
    'email': 'Email',
    'password': 'Password',
    'logout': 'Logout',
    
    // Navigation
    'dashboard': 'Dashboard',
    'patients': 'Patients',
    'appointments': 'Appointments',
    'lab_results': 'Lab Results',
    'notifications': 'Notifications',
    'settings': 'Settings',
    
    // Settings
    'profile': 'Profile',
    'notifications_settings': 'Notifications',
    'theme': 'Theme',
    'language': 'Language',
    'save_changes': 'Save Changes',
    'saving': 'Saving...',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'currentPassword': 'Current Password',
    'newPassword': 'New Password',
    'confirmPassword': 'Confirm Password',
    'profile_updated': 'Profile Updated',
    'password_changed': 'Password Changed',
    'preferences_updated': 'Preferences Updated',
  }
} as const;

export const useI18n = create<I18nStore>((set) => ({
  language: (localStorage.getItem('language') as Language) || 'fr',
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
}));

export const t = (key: keyof typeof translations.fr): string => {
  const { language } = useI18n.getState();
  return translations[language][key] || key;
};
