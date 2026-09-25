import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from './api';
import type {
  AuthStatus,
  AuthUser,
  LoginInput,
  RegisterInput,
} from './types';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'anonymous');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getCurrentUser(controller.signal)
      .then((nextUser) => {
        setUser(nextUser);
        setStatus(nextUser ? 'authenticated' : 'anonymous');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const nextUser = await loginRequest(input);
    setUser(nextUser);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await registerRequest(input);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    login,
    register,
    logout,
    refresh,
  }), [login, logout, refresh, register, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return value;
}
