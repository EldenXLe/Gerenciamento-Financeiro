import { useState, useMemo } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { groupByCategory, groupByMonth } from '../utils/calculations';

export function useFinance() {
  const context = useFinanceContext();
  return context;
}

export function useFilteredTransactions() {
  const { transactions } = useFinanceContext();
  const [filters, setFilters] = useState({ type: '', category: '', search: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filters.type && t.type !== filters.type) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo && t.date > filters.dateTo) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!t.description.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ type: '', category: '', search: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  return { filtered, paginated, filters, updateFilter, resetFilters, page, setPage, totalPages, total: filtered.length };
}

export function useChartData() {
  const { transactions } = useFinanceContext();

  const byMonth = useMemo(() => {
    const grouped = groupByMonth(transactions);
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: month.substring(5) + '/' + month.substring(2, 4),
        Receitas: data.income,
        Despesas: data.expense,
      }));
  }, [transactions]);

  const byCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = groupByCategory(expenses);
    return Object.entries(grouped)
      .map(([cat, value]) => ({ name: cat, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return { byMonth, byCategory };
}
