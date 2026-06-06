import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { normalizeUser, type AuthUser } from '@/lib/normalizeUser';
import { consumeTokenFromCurrentUrl } from '@/lib/authUrl';
import {
  clearStoredAuth,
  fetchSessionUser,
  redirectToLandingLogout,
  revokeServerSession,
} from '@/lib/authSession';


interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (userData: AuthUser, accessToken: string) => void;
  updateUser: (userData: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  if (typeof localStorage === 'undefined')
    return null;
  const storedUser = localStorage.getItem('userData');
  if (!storedUser)
    return null;
  try {
    return normalizeUser(JSON.parse(storedUser));
  }
  catch {
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof localStorage === 'undefined')
    return null;
  return localStorage.getItem('accessToken') || null;
}

async function persistValidatedSession(
  accessToken: string,
  setUser: (u: AuthUser | null) => void,
  setToken: (t: string | null) => void,
) {
  const data = await fetchSessionUser(accessToken);
  const normalized = normalizeUser(data);
  if (!normalized)
    throw new Error('Invalid user payload');

  setUser(normalized);
  setToken(accessToken);
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('userData', JSON.stringify(normalized));
  return normalized;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (typeof window === 'undefined') {
        setIsReady(true);
        return;
      }

      const params = new URLSearchParams(window.location.search);

      if (params.get('logout') === '1') {
        clearStoredAuth();
        if (!cancelled) {
          setUser(null);
          setToken(null);
          window.history.replaceState({}, '', '/');
          setIsReady(true);
        }
        return;
      }

      const tokenFromUrl = consumeTokenFromCurrentUrl();

      if (tokenFromUrl) {
        try {
          await persistValidatedSession(tokenFromUrl, setUser, setToken);
        }
        catch {
          if (!cancelled) {
            setUser(null);
            setToken(null);
            clearStoredAuth();
          }
        }
      }

      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setIsReady(true);
        }
        return;
      }

      if (!tokenFromUrl) {
        try {
          if (!cancelled)
            await persistValidatedSession(storedToken, setUser, setToken);
        }
        catch (error) {
          const isUnauthorized = axios.isAxiosError(error) && error.response?.status === 401;
          if (!cancelled && isUnauthorized) {
            setUser(null);
            setToken(null);
            clearStoredAuth();
          }
        }
      }

      if (!cancelled)
        setIsReady(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData: AuthUser, accessToken: string) => {
    const normalized = normalizeUser(userData) ?? userData;
    setUser(normalized);
    setToken(accessToken);
    localStorage.setItem('userData', JSON.stringify(normalized));
    localStorage.setItem('accessToken', accessToken);
  };

  const updateUser = (userData: AuthUser) => {
    const normalized = normalizeUser(userData) ?? userData;
    setUser(normalized);
    localStorage.setItem('userData', JSON.stringify(normalized));
  };

  const logout = async () => {
    const currentToken = token || readStoredToken();
    await revokeServerSession(currentToken);
    setUser(null);
    setToken(null);
    redirectToLandingLogout();
  };

  const isAuthenticated = !!(user && token);

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, isAuthenticated, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
