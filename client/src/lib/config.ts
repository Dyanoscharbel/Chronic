
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-repl.example.repl.co/api'  // L'URL sera générée par Replit
  : 'http://localhost:5000/api';
