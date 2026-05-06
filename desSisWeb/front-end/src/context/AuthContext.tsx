import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../api/auth';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '../api/auth';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { username: string; firstName?: string; lastName?: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      getProfile()
        .then(setUser)
        .catch(() => {
          sessionStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(identifier: string, password: string) {
    const response = await apiLogin({ identifier, password });
    sessionStorage.setItem('accessToken', response.accessToken);
    const profile = await getProfile();
    setUser(profile);
  }

  async function register(data: { username: string; firstName?: string; lastName?: string; email: string; password: string }) {
    const response = await apiRegister(data);
    sessionStorage.setItem('accessToken', response.accessToken);
    const profile = await getProfile();
    setUser(profile);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // ignore errors on logout
    } finally {
      sessionStorage.removeItem('accessToken');
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
