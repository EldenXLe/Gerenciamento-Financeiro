export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8888a8] uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55556a]">
            <Icon size={15} />
          </div>
        )}
        <input
          {...props}
          className={`
            w-full bg-[#0a0a0f] border text-[#f0f0f8] rounded-xl text-sm
            placeholder:text-[#55556a] outline-none
            transition-all duration-200
            ${error ? 'border-[#f05a5a]' : 'border-[#ffffff10] focus:border-[#7c5af0]'}
            ${Icon ? 'pl-9 pr-4 py-2.5' : 'px-4 py-2.5'}
          `}
        />
      </div>
      {error && <span className="text-xs text-[#f05a5a]">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-medium text-[#8888a8] uppercase tracking-wider">{label}</label>}
      <select
        {...props}
        className={`
          w-full bg-[#0a0a0f] border text-[#f0f0f8] rounded-xl text-sm
          px-4 py-2.5 outline-none appearance-none cursor-pointer
          transition-all duration-200
          ${error ? 'border-[#f05a5a]' : 'border-[#ffffff10] focus:border-[#7c5af0]'}
        `}
      >
        {children}
      </select>
      {error && <span className="text-xs text-[#f05a5a]">{error}</span>}
    </div>
  );
}
