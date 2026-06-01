import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockTransactions, mockUser } from '../data/mockData';
import { calcBalance, calcIncomes, calcExpenses } from '../utils/calculations';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage('ff_transactions', mockTransactions);
  const [user, setUser] = useLocalStorage('ff_user', mockUser);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('ff_auth', false);
  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => ({
    balance: calcBalance(transactions),
    incomes: calcIncomes(transactions),
    expenses: calcExpenses(transactions),
    count: transactions.length,
  }), [transactions]);

  const addTransaction = useCallback((data) => {
    const newTransaction = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success('Transação adicionada!');
    return newTransaction;
  }, [setTransactions]);

  const updateTransaction = useCallback((id, data) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    toast.success('Transação atualizada!');
  }, [setTransactions]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação removida!');
  }, [setTransactions]);

  const login = useCallback((email, password) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'alex@financeflow.app' && password === '123456') {
          setIsAuthenticated(true);
          toast.success('Bem-vindo de volta!');
          resolve(true);
        } else {
          toast.error('Credenciais inválidas');
          resolve(false);
        }
        setLoading(false);
      }, 1000);
    });
  }, [setIsAuthenticated]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    toast('Até logo!', { icon: '👋' });
  }, [setIsAuthenticated]);

  const value = {
    transactions,
    summary,
    user,
    isAuthenticated,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    login,
    logout,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinanceContext must be used within FinanceProvider');
  return context;
};
