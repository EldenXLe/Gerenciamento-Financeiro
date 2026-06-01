import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiRepeat, FiBarChart2, FiSettings, FiZap, FiLogOut
} from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../utils/formatCurrency';

const NAV = [
  { to: '/', icon: FiGrid, label: 'Dashboard' },
  { to: '/transactions', icon: FiRepeat, label: 'Transações' },
  { to: '/reports', icon: FiBarChart2, label: 'Relatórios' },
  { to: '/settings', icon: FiSettings, label: 'Configurações' },
];

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout, summary } = useFinance();
  const location = useLocation();

  return (
    <aside className={`
      flex flex-col h-full bg-[#111118] border-r border-[#ffffff08]
      ${mobile ? 'w-64' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#ffffff08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7c5af0] flex items-center justify-center shadow-lg shadow-[#7c5af040]">
            <FiZap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Finance<span className="text-[#7c5af0]">Flow</span>
          </span>
        </div>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-5 p-4 rounded-2xl bg-gradient-to-br from-[#7c5af020] to-[#7c5af008] border border-[#7c5af030]">
        <p className="text-xs text-[#8888a8] mb-1">Saldo Total</p>
        <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}
           style={{ fontFamily: 'Syne, sans-serif' }}>
          {formatCurrency(summary.balance)}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group
              ${isActive
                ? 'bg-[#7c5af020] text-[#9b7af5] border border-[#7c5af030]'
                : 'text-[#8888a8] hover:text-[#f0f0f8] hover:bg-[#ffffff08]'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-[#9b7af5]' : 'text-[#55556a] group-hover:text-[#8888a8]'} />
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c5af0]" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#ffffff08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5af0] to-[#9b7af5] flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-[#55556a] truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-[#55556a] hover:text-[#f05a5a] transition-colors" title="Sair">
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
