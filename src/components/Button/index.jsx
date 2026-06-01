import { FiLoader } from 'react-icons/fi';

const variants = {
  primary: 'bg-[#7c5af0] hover:bg-[#9b7af5] text-white shadow-lg shadow-[#7c5af030]',
  secondary: 'bg-[#ffffff0a] hover:bg-[#ffffff14] text-[#f0f0f8] border border-[#ffffff10]',
  danger: 'bg-[#f05a5a20] hover:bg-[#f05a5a30] text-[#f05a5a] border border-[#f05a5a30]',
  ghost: 'hover:bg-[#ffffff08] text-[#8888a8] hover:text-[#f0f0f8]',
  success: 'bg-[#10d97a20] hover:bg-[#10d97a30] text-[#10d97a] border border-[#10d97a30]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  icon: Icon, iconRight: IconRight, className = '', disabled, ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? <FiLoader className="animate-spin" size={14} /> : Icon && <Icon size={14} />}
      {children}
      {IconRight && !loading && <IconRight size={14} />}
    </button>
  );
}
