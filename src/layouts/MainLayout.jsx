import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useLocation } from 'react-router-dom';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral das suas finanças' },
  '/transactions': { title: 'Transações', subtitle: 'Gerencie suas movimentações' },
  '/reports': { title: 'Relatórios', subtitle: 'Análise detalhada' },
  '/settings': { title: 'Configurações', subtitle: 'Gerencie sua conta' },
};

export default function MainLayout() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'FinanceFlow' };

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-6xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
