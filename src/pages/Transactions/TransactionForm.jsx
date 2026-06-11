import { useState } from 'react';
import { FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import { CATEGORIES, TRANSACTION_TYPES } from '../../constants/categories';
import Input, { Select } from '../../components/Input';
import Button from '../../components/Button';
import { toInputDate } from '../../utils/formatDate';

const empty = {
  description: '', amount: '', type: 'expense',
  category: 'food', date: toInputDate(new Date()), note: ''
};

export default function TransactionForm({ transaction, onClose }) {
  const { addTransaction, updateTransaction } = useFinance();
  const [form, setForm] = useState(transaction ? {
    ...transaction,
    amount: Number(transaction.amount).toString(),
    date: (transaction.date || '').substring(0, 10), // normaliza ISO → YYYY-MM-DD
  } : empty);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Campo obrigatório';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Valor inválido';
    if (!form.date) e.date = 'Campo obrigatório';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, amount: parseFloat(form.amount) };
    if (transaction) updateTransaction(transaction.id, data);
    else addTransaction(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-[#ffffff10] p-1 gap-1">
        {TRANSACTION_TYPES.map(t => (
          <button key={t.id} type="button"
            onClick={() => set('type', t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              form.type === t.id
                ? t.id === 'income'
                  ? 'bg-[#10d97a20] text-[#10d97a]'
                  : 'bg-[#f05a5a20] text-[#f05a5a]'
                : 'text-[#55556a] hover:text-[#8888a8]'
            }`}>{t.label}</button>
        ))}
      </div>

      <Input label="Descrição" value={form.description}
        onChange={e => set('description', e.target.value)}
        placeholder="Ex: Supermercado, Salário..." icon={FiFileText}
        error={errors.description} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor (R$)" type="number" step="0.01" min="0"
          value={form.amount} onChange={e => set('amount', e.target.value)}
          placeholder="0,00" icon={FiDollarSign} error={errors.amount} />
        <Input label="Data" type="date" value={form.date}
          onChange={e => set('date', e.target.value)}
          icon={FiCalendar} error={errors.date} />
      </div>

      <Select label="Categoria" value={form.category}
        onChange={e => set('category', e.target.value)}>
        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </Select>

      <Input label="Observação (opcional)" value={form.note}
        onChange={e => set('note', e.target.value)}
        placeholder="Alguma nota adicional..." />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {transaction ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}
