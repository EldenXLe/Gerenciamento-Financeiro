import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`
        relative w-full ${sizes[size]} bg-[#16161f] border border-[#ffffff10]
        rounded-2xl shadow-2xl animate-fade-in overflow-hidden
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08]">
          <h2 className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8888a8] hover:text-[#f0f0f8] hover:bg-[#ffffff0a] transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
