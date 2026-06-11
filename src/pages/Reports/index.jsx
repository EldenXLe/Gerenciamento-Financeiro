import { useMemo, useState } from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import { useChartData } from '../../hooks/useFinance';
import Card from '../../components/Card';
import { BarChartComponent, LineChartComponent, PieChartComponent } from '../../components/Charts';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCategoryById, CATEGORIES } from '../../constants/categories';
import { groupByCategory, calcIncomes, calcExpenses } from '../../utils/calculations';

export default function Reports() {
  const { transactions } = useFinance();
  const { byMonth, byCategory } = useChartData();
  const [view, setView] = useState('bar');

  // Normaliza data para YYYY-MM-DD independente do formato (ISO completo ou só data)
  const toDateStr = (t) => (t.date || '').substring(0, 10);

  const currentMonth = new Date().toISOString().substring(0, 7);
  const thisMonth = transactions.filter(t => toDateStr(t).startsWith(currentMonth));
  const lastMonth = transactions.filter(t => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return toDateStr(t).startsWith(d.toISOString().substring(0, 7));
  });

  const comparison = useMemo(() => {
    const curr = { income: calcIncomes(thisMonth), expense: calcExpenses(thisMonth) };
    const prev = { income: calcIncomes(lastMonth), expense: calcExpenses(lastMonth) };
    const incomeDiff = prev.income > 0 ? ((curr.income - prev.income) / prev.income * 100).toFixed(1) : 0;
    const expDiff = prev.expense > 0 ? ((curr.expense - prev.expense) / prev.expense * 100).toFixed(1) : 0;
    return { curr, prev, incomeDiff, expDiff };
  }, [transactions]);

  const catData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const exp = transactions.filter(t => t.type === 'expense' && t.category === cat.id);
      const inc = transactions.filter(t => t.type === 'income'  && t.category === cat.id);
      return {
        ...cat,
        expenses: exp.reduce((a, t) => a + Number(t.amount), 0),
        incomes:  inc.reduce((a, t) => a + Number(t.amount), 0),
        count: exp.length + inc.length,
      };
    }).filter(c => c.count > 0);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[#10d97a20]"><FiTrendingUp size={18} className="text-[#10d97a]" /></div>
            <div>
              <p className="text-xs text-[#8888a8]">Receitas — Mês Atual</p>
              <p className="text-xl font-bold text-[#10d97a]">{formatCurrency(comparison.curr.income)}</p>
            </div>
          </div>
          <div className="text-xs text-[#55556a]">
            Mês anterior: {formatCurrency(comparison.prev.income)}
            {comparison.incomeDiff != 0 && (
              <span className={`ml-2 ${Number(comparison.incomeDiff) >= 0 ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}>
                {Number(comparison.incomeDiff) >= 0 ? '↑' : '↓'} {Math.abs(comparison.incomeDiff)}%
              </span>
            )}
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[#f05a5a20]"><FiTrendingDown size={18} className="text-[#f05a5a]" /></div>
            <div>
              <p className="text-xs text-[#8888a8]">Despesas — Mês Atual</p>
              <p className="text-xl font-bold text-[#f05a5a]">{formatCurrency(comparison.curr.expense)}</p>
            </div>
          </div>
          <div className="text-xs text-[#55556a]">
            Mês anterior: {formatCurrency(comparison.prev.expense)}
            {comparison.expDiff != 0 && (
              <span className={`ml-2 ${Number(comparison.expDiff) <= 0 ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}>
                {Number(comparison.expDiff) >= 0 ? '↑' : '↓'} {Math.abs(comparison.expDiff)}%
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly chart */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Evolução Mensal</h3>
          <div className="flex rounded-xl overflow-hidden border border-[#ffffff10] p-0.5 gap-0.5">
            {[['bar','Barras'],['line','Linhas']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  view === k ? 'bg-[#7c5af0] text-white' : 'text-[#55556a] hover:text-[#8888a8]'
                }`}>{l}</button>
            ))}
          </div>
        </div>
        {view === 'bar' ? <BarChartComponent data={byMonth} /> : <LineChartComponent data={byMonth} />}
      </Card>

      {/* Pie + Category breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-8">
          <h3 className="font-bold mb-6">Despesas por Categoria</h3>
          <PieChartComponent data={byCategory} />
        </Card>

        <Card className="p-8">
          <h3 className="font-bold mb-4">Detalhamento por Categoria</h3>
          <div className="space-y-3">
            {catData.map(cat => {
              const total = cat.expenses + cat.incomes;
              const maxTotal = Math.max(...catData.map(c => c.expenses + c.incomes));
              const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: cat.color }}>{cat.label}</span>
                    <span className="text-[#8888a8]">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1.5 bg-[#ffffff08] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
