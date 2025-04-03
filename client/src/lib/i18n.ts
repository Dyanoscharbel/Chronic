import { create } from 'zustand';

interface I18nStore {
  language: 'fr';
  setLanguage: (language: 'fr') => void;
}

const translations = {
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
};

export const useI18n = create<I18nStore>((set) => ({
  language: 'fr',
  setLanguage: (language) => {
    //This line is kept for consistency, though it's now redundant.
    localStorage.setItem('language', language);
    set({ language });
  },
}));

export const t = (key: keyof typeof translations): string => {
  return translations[key] || key;
};