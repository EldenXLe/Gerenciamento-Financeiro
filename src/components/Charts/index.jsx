import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCategoryById } from '../../constants/categories';

const COLORS = ['#7c5af0','#10d97a','#f97316','#3b82f6','#ec4899','#f59e0b','#ef4444','#8888a8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1c1c28] border border-[#ffffff10] rounded-xl p-3 shadow-xl text-sm">
      {label && <p className="text-[#8888a8] text-xs mb-2">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#8888a8]">{p.name}:</span>
          <span className="font-medium text-[#f0f0f8]">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function BarChartComponent({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={6} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => 'R$' + (v/1000).toFixed(0) + 'k'} tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#8888a8', paddingTop: '16px' }} />
        <Bar dataKey="Receitas" fill="#10d97a" radius={[6,6,0,0]} />
        <Bar dataKey="Despesas" fill="#7c5af0" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartComponent({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => 'R$' + (v/1000).toFixed(0) + 'k'} tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="Receitas" stroke="#10d97a" strokeWidth={2} dot={{ fill: '#10d97a', strokeWidth: 0, r: 4 }} />
        <Line type="monotone" dataKey="Despesas" stroke="#7c5af0" strokeWidth={2} dot={{ fill: '#7c5af0', strokeWidth: 0, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({ data }) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
            paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((item, i) => {
          const cat = getCategoryById(item.name);
          const total = data.reduce((a, d) => a + d.value, 0);
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-[#8888a8] flex-1 truncate">{cat.label}</span>
              <span className="text-xs font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
