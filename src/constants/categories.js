export const CATEGORIES = [
  { id: 'food', label: 'Alimentação', color: '#f97316', bg: '#f9731620' },
  { id: 'transport', label: 'Transporte', color: '#3b82f6', bg: '#3b82f620' },
  { id: 'leisure', label: 'Lazer', color: '#ec4899', bg: '#ec489920' },
  { id: 'salary', label: 'Salário', color: '#10d97a', bg: '#10d97a20' },
  { id: 'investments', label: 'Investimentos', color: '#7c5af0', bg: '#7c5af020' },
  { id: 'health', label: 'Saúde', color: '#ef4444', bg: '#ef444420' },
  { id: 'education', label: 'Educação', color: '#f59e0b', bg: '#f59e0b20' },
  { id: 'others', label: 'Outros', color: '#8888a8', bg: '#8888a820' },
];

export const TRANSACTION_TYPES = [
  { id: 'income', label: 'Receita' },
  { id: 'expense', label: 'Despesa' },
];

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];
export const getCategoryLabel = (id) => getCategoryById(id).label;
