import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState, AuthUser } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    userDetails: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if the user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setAuthState(parsedAuth);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // If there's an error with the stored auth, clear it
        localStorage.removeItem('auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      if (!data.token || !data.user) {
        throw new Error('Invalid server response');
      }

      const newAuthState: AuthState = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        userDetails: data.userDetails
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Identifiants invalides ou serveur indisponible",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      await apiRequest('POST', '/api/auth/register', userData);
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        userDetails: null
      });
      localStorage.removeItem('auth');
      queryClient.clear();
      toast({
        title: "Logged out successfully",
      });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error during logout",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const contextValue = {
    ...authState,
    loading,
    login,
    register,
    logout
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}