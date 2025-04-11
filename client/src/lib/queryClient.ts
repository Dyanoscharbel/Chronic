import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

//Added config import
import { API_URL } from './config';

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Récupère le token d'authentification depuis le localStorage
  const storedAuth = localStorage.getItem('auth');
  const authData = storedAuth ? JSON.parse(storedAuth) : null;
  const token = authData?.token;

  // Prépare les en-têtes avec l'autorisation si un jeton est disponible
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  console.log(`Envoi requête ${method} vers ${API_URL}${path}`, { 
    headers, 
    data: data || 'Pas de données' 
  });

  const res = await fetch(`${API_URL}${path}`, { // Updated fetch URL
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`Réponse reçue de ${API_URL}${path}:`, {
    status: res.status,
    ok: res.ok,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries())
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Récupère le token d'authentification depuis le localStorage
    const storedAuth = localStorage.getItem('auth');
    const authData = storedAuth ? JSON.parse(storedAuth) : null;
    const token = authData?.token;

    // Prépare les en-têtes avec l'autorisation si un jeton est disponible
    const headers: Record<string, string> = token 
      ? { "Authorization": `Bearer ${token}` } 
      : {};

    const res = await fetch(`${API_URL}${queryKey[0] as string}`, { //Updated fetch URL
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});