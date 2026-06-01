import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function Table({ columns, data, loading = false, emptyMessage = 'Nenhum registro encontrado.' }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-16 text-[#55556a]">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#ffffff08]">
            {columns.map(col => (
              <th key={col.key} className="text-left text-xs font-medium text-[#55556a] uppercase tracking-wider px-4 py-3 first:pl-0 last:pr-0">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ffffff05]">
          {data.map((row, i) => (
            <tr key={row.id || i} className="group hover:bg-[#ffffff04] transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 first:pl-0 last:pr-0 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="p-1.5 rounded-lg text-[#8888a8] hover:text-[#f0f0f8] disabled:opacity-30 transition-colors">
        <FiChevronLeft size={16} />
      </button>
      {visible.map((p, i, arr) => (
        <>
          {i > 0 && arr[i - 1] !== p - 1 && <span key={`e${p}`} className="text-[#55556a] text-xs px-1">…</span>}
          <button key={p} onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              p === page ? 'bg-[#7c5af0] text-white' : 'text-[#8888a8] hover:text-[#f0f0f8] hover:bg-[#ffffff08]'
            }`}>
            {p}
          </button>
        </>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="p-1.5 rounded-lg text-[#8888a8] hover:text-[#f0f0f8] disabled:opacity-30 transition-colors">
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
