import { useState, useMemo } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { groupByCategory, groupByMonth } from '../utils/calculations';

export function useFinance() {
  const finance = useFinanceContext();
  const auth    = useAuth();
  return { ...finance, ...auth };
}

export function useFilteredTransactions() {
  const { transactions } = useFinanceContext();
  const [filters, setFilters] = useState({
    type: '', category: '', search: '', dateFrom: '', dateTo: '',
  });
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const dateStr = (t.date || '').substring(0, 10);
      if (filters.type     && t.type     !== filters.type)     return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.dateFrom && dateStr < filters.dateFrom)      return false;
      if (filters.dateTo   && dateStr > filters.dateTo)        return false;
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [transactions, filters]);

  const paginated  = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const updateFilter = (key, value) => { setFilters(p => ({ ...p, [key]: value })); setPage(1); };
  const resetFilters = () => { setFilters({ type: '', category: '', search: '', dateFrom: '', dateTo: '' }); setPage(1); };

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
    const grouped  = groupByCategory(expenses);
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return { byMonth, byCategory };
}
