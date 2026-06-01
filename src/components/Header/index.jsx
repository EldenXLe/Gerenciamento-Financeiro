import { useState } from 'react';
import { FiBell, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import Sidebar from '../Sidebar';

export default function Header({ title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08] bg-[#111118]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl text-[#8888a8] hover:text-[#f0f0f8] hover:bg-[#ffffff08] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h1>
            {subtitle && <p className="text-xs text-[#8888a8]">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl text-[#8888a8] hover:text-[#f0f0f8] hover:bg-[#ffffff08] transition-colors relative">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7c5af0]" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
          <button
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#16161f] text-[#8888a8]"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>
      )}
    </>
  );
}
