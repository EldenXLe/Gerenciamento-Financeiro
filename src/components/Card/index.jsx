export default function Card({ children, className = '', hover = false, glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#16161f] border border-[#ffffff0f] rounded-2xl
        transition-all duration-300
        ${hover ? 'hover:bg-[#1c1c28] hover:border-[#ffffff18] hover:-translate-y-0.5 hover:shadow-xl' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_#7c5af020]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, color = '#7c5af0', loading = false }) {
  return (
    <Card hover glow className="p-8">
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-32" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#8888a8] font-medium">{label}</span>
            <div className="p-2 rounded-xl" style={{ background: color + '20' }}>
              <Icon size={18} style={{ color }} />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
          {trend && (
            <div className={`mt-2 text-xs ${trend.positive ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}>
              {trend.positive ? '↑' : '↓'} {trend.label}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
