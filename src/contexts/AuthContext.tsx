import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      authAPI.setToken(storedToken);
      // Verify token and get user info
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.verify();
      if (response.valid) {
        setUser(response.user);
      } else {
        localStorage.removeItem('authToken');
        setToken(null);
        authAPI.setToken(null);
      }
    } catch (error) {
      // Silently fail token verification if backend is not available
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Backend server is not available') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        // Backend not available - clear auth and continue
        localStorage.removeItem('authToken');
        setToken(null);
        authAPI.setToken(null);
      } else {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        authAPI.setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      authAPI.setToken(response.token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Backend server is not available') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Backend server is not available. Please ensure the server is running or configure VITE_API_BASE_URL environment variable.');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await authAPI.register(email, password, name);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      authAPI.setToken(response.token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Backend server is not available') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Backend server is not available. Please ensure the server is running or configure VITE_API_BASE_URL environment variable.');
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    authAPI.setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
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

