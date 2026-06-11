import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockTransactions } from '../data/mockData';
import { calcBalance, calcIncomes, calcExpenses } from '../utils/calculations';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useLocalStorage('ff_transactions', mockTransactions);
  const [categories,   setCategories]   = useLocalStorage('ff_categories',   []);

  const summary = useMemo(() => ({
    balance:  calcBalance(transactions),
    incomes:  calcIncomes(transactions),
    expenses: calcExpenses(transactions),
    count:    transactions.length,
  }), [transactions]);

  // ─── Transactions CRUD ────────────────────────────────────────────────────────
  const addTransaction = useCallback((data) => {
    const tx = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    setTransactions(prev => [tx, ...prev]);
    toast.success('Transação adicionada!');
    return tx;
  }, [setTransactions]);

  const updateTransaction = useCallback((id, data) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    toast.success('Transação atualizada!');
  }, [setTransactions]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação removida!');
  }, [setTransactions]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
    toast.success('Todos os dados foram removidos.');
  }, [setTransactions]);

  const resetTransactions = useCallback(() => {
    setTransactions(mockTransactions);
    toast.success('Dados de demonstração restaurados!');
  }, [setTransactions]);

  const importTransactions = useCallback((incoming) => {
    setTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const unique = incoming.filter(t => !existingIds.has(t.id));
      if (unique.length === 0) {
        toast('Nenhuma transação nova encontrada.', { icon: 'ℹ️' });
      } else {
        toast.success(`${unique.length} transação(ões) importada(s)!`);
      }
      return [...unique, ...prev];
    });
    // Retorna estrutura compatível com o ImportModal
    return Promise.resolve({ imported: 0, preview: [] });
  }, [setTransactions]);

  return (
    <FinanceContext.Provider value={{
      transactions, categories, summary,
      loadingData: false,
      addTransaction, updateTransaction, deleteTransaction,
      clearTransactions, resetTransactions, importTransactions,
      refetch: () => {},
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinanceContext = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinanceContext must be used within FinanceProvider');
  return ctx;
};
