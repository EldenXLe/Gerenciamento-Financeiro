import { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiFilter, FiX, FiUpload } from 'react-icons/fi';
import { useFilteredTransactions, useFinance } from '../../hooks/useFinance';
import { CATEGORIES, TRANSACTION_TYPES, getCategoryById, getTypeById } from '../../constants/categories';
import { Table, Pagination } from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input, { Select } from '../../components/Input';
import Card from '../../components/Card';
import TransactionForm from './TransactionForm';
import ImportModal from './ImportModal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/calculations';

export default function Transactions() {
  const { deleteTransaction, transactions } = useFinance();
  const { paginated, filters, updateFilter, resetFilters, page, setPage, totalPages, total } = useFilteredTransactions();
  const [modal, setModal] = useState(null); // null | 'add' | 'import' | { edit: tx } | { confirm: id }
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = Object.values(filters).some(Boolean);

  const columns = [
    {
      key: 'description', label: 'Descrição',
      render: (v, row) => {
        const cat = getCategoryById(row.category);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: cat.bg, color: cat.color }}>
              {v[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#f0f0f8]">{v}</p>
              <p className="text-xs text-[#80859a]">{cat.label}</p>
            </div>
          </div>
        );
      }
    },
    { key: 'date', label: 'Data', render: v => <span className="text-[#a3a8ba] text-xs">{formatDate(v)}</span> },
    {
      key: 'type', label: 'Tipo',
      render: v => {
        const type = getTypeById(v);
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: type.color + '20', color: type.color }}>
            {type.label}
          </span>
        );
      }
    },
    {
      key: 'amount', label: 'Valor',
      render: (v, row) => {
        const type = getTypeById(row.type);
        return (
          <span className="font-semibold tabular-nums" style={{ color: type.color }}>
            {type.sign > 0 ? '+' : '-'}{formatCurrency(v)}
          </span>
        );
      }
    },
    {
      key: 'id', label: '',
      render: (id, row) => (
        <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button onClick={() => setModal({ edit: row })} aria-label="Editar" title="Editar"
            className="p-1.5 rounded-lg text-[#a3a8ba] hover:text-[#7c5af0] hover:bg-[#7c5af010] transition-colors">
            <FiEdit2 size={13} />
          </button>
          <button onClick={() => setModal({ confirm: id })} aria-label="Excluir" title="Excluir"
            className="p-1.5 rounded-lg text-[#a3a8ba] hover:text-[#f05a5a] hover:bg-[#f05a5a10] transition-colors">
            <FiTrash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <Input icon={FiSearch} placeholder="Buscar transações..."
            value={filters.search} onChange={e => updateFilter('search', e.target.value)} />
        </div>
        <Button variant="secondary" icon={FiFilter} onClick={() => setFiltersOpen(!filtersOpen)}>
          Filtros {hasFilters && (
            <span className="ml-1 w-4 h-4 rounded-full bg-[#7c5af0] text-white text-xs flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
        <Button variant="secondary" icon={FiDownload} onClick={() => exportToCSV(transactions)}>
          CSV
        </Button>
        <Button variant="secondary" icon={FiUpload} onClick={() => setModal('import')}>
          Importar
        </Button>
        <Button icon={FiPlus} onClick={() => setModal('add')}>
          Nova Transação
        </Button>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <Select label="Tipo" value={filters.type} onChange={e => updateFilter('type', e.target.value)} className="w-36">
              <option value="">Todos</option>
              {TRANSACTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </Select>
            <Select label="Categoria" value={filters.category} onChange={e => updateFilter('category', e.target.value)} className="w-44">
              <option value="">Todas</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Input label="De" type="date" value={filters.dateFrom}
              onChange={e => updateFilter('dateFrom', e.target.value)} className="w-36" />
            <Input label="Até" type="date" value={filters.dateTo}
              onChange={e => updateFilter('dateTo', e.target.value)} className="w-36" />
            {hasFilters && (
              <Button variant="ghost" size="sm" icon={FiX} onClick={resetFilters}>
                Limpar
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#80859a]">{total} transação{total !== 1 ? 's' : ''}</p>
        </div>
        <Table columns={columns} data={paginated} emptyMessage="Nenhuma transação encontrada." />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </Card>

      {/* Add Modal */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title="Nova Transação">
        <TransactionForm onClose={() => setModal(null)} />
      </Modal>

      {/* Import Modal */}
      <ImportModal isOpen={modal === 'import'} onClose={() => setModal(null)} />

      {/* Edit Modal */}
      <Modal isOpen={!!modal?.edit} onClose={() => setModal(null)} title="Editar Transação">
        {modal?.edit && <TransactionForm transaction={modal.edit} onClose={() => setModal(null)} />}
      </Modal>

      {/* Confirm Delete */}
      <Modal isOpen={!!modal?.confirm} onClose={() => setModal(null)} title="Excluir Transação" size="sm">
        <p className="text-sm text-[#a3a8ba] mb-6">
          Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
          <Button variant="danger" className="flex-1"
            onClick={() => { deleteTransaction(modal.confirm); setModal(null); }}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
