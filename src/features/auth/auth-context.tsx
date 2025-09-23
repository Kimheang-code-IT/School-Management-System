import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'staff';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mockUser: AuthUser = {
  id: 'auth-user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: 'administrator',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    setUser({ ...mockUser, email });
  };

  const logout = () => setUser(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
