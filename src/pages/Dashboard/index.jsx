import { useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { useFinance, useChartData } from '../../hooks/useFinance';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import { BarChartComponent } from '../../components/Charts';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getCategoryById, CATEGORIES } from '../../constants/categories';

export default function Dashboard() {
  const { transactions, summary } = useFinance();
  const { byMonth } = useChartData();

  const recent = useMemo(() =>
    [...transactions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8),
  [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Saldo Total" value={formatCurrency(summary.balance)}
          icon={FiDollarSign} color={summary.balance >= 0 ? '#10d97a' : '#f05a5a'} />
        <StatCard label="Receitas" value={formatCurrency(summary.incomes)} icon={FiTrendingUp} color="#10d97a" />
        <StatCard label="Despesas" value={formatCurrency(summary.expenses)} icon={FiTrendingDown} color="#f05a5a" />
        <StatCard label="Transações" value={summary.count} icon={FiActivity} color="#7c5af0" />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-8">
          <div className="mb-6">
            <h3 className="font-bold text-base">Receitas vs Despesas</h3>
            <p className="text-xs text-[#55556a] mt-0.5">Últimos 6 meses</p>
          </div>
          <BarChartComponent data={byMonth} />
        </Card>

        <Card className="p-8">
          <h3 className="font-bold text-base mb-5">Últimas Transações</h3>
          <div className="space-y-3">
            {recent.map(t => {
              const cat = getCategoryById(t.category);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.bg, color: cat.color }}>
                    {t.type === 'income' ? <FiArrowUpRight size={16} /> : <FiArrowDownRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-xs text-[#55556a]">{formatDate(t.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${t.type === 'income' ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <CategorySummary transactions={transactions} />
    </div>
  );
}

function CategorySummary({ transactions }) {
  const byCategory = useMemo(() => {
    return CATEGORIES.map(cat => {
      const items = transactions.filter(t => t.category === cat.id);
      const total = items.reduce((a, t) => a + t.amount, 0);
      return { ...cat, total, count: items.length };
    }).filter(c => c.count > 0).sort((a, b) => b.total - a.total);
  }, [transactions]);

  return (
    <Card className="p-8">
      <h3 className="font-bold text-base mb-5">Resumo por Categoria</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {byCategory.map(cat => (
          <div key={cat.id}
            className="p-5 rounded-xl border border-[#ffffff08] hover:border-[#ffffff14] transition-colors"
            style={{ background: cat.bg + '30' }}>
            <div className="text-xs font-medium mb-1" style={{ color: cat.color }}>{cat.label}</div>
            <div className="text-base font-bold">{formatCurrency(cat.total)}</div>
            <div className="text-xs text-[#55556a]">{cat.count} transações</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
