import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                     = useLocalStorage('ff_user', null);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('ff_auth', false);
  const [loading, setLoading]               = useState(false);

  // Credenciais de demonstração — fácil para recrutadores testarem
  const DEMO_EMAIL    = 'alex@financeflow.app';
  const DEMO_PASSWORD = '123456';

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          setUser(mockUser);
          setIsAuthenticated(true);
          toast.success(`Bem-vindo de volta, ${mockUser.name}!`);
          resolve({ success: true });
        } else {
          toast.error('Credenciais inválidas.');
          resolve({ success: false, message: 'E-mail ou senha inválidos.' });
        }
        setLoading(false);
      }, 800);
    });
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { id: 'user-' + Date.now(), name, email };
        setUser(newUser);
        setIsAuthenticated(true);
        toast.success(`Conta criada! Bem-vindo, ${name}!`);
        resolve({ success: true });
        setLoading(false);
      }, 800);
    });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    toast('Até logo!', { icon: '👋' });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, initializing: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
