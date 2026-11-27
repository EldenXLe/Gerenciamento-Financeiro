export const CATEGORIES = [
  { id: 'food', label: 'Alimentação', color: '#f97316', bg: '#f9731620' },
  { id: 'transport', label: 'Transporte', color: '#3b82f6', bg: '#3b82f620' },
  { id: 'leisure', label: 'Lazer', color: '#ec4899', bg: '#ec489920' },
  { id: 'salary', label: 'Salário', color: '#10d97a', bg: '#10d97a20' },
  { id: 'investments', label: 'Investimentos', color: '#7c5af0', bg: '#7c5af020' },
  { id: 'health', label: 'Saúde', color: '#ef4444', bg: '#ef444420' },
  { id: 'education', label: 'Educação', color: '#f59e0b', bg: '#f59e0b20' },
  { id: 'others', label: 'Outros', color: '#a3a8ba', bg: '#a3a8ba20' },
];

// sign: +1 entra na conta, -1 sai. Investimento e resgate não contam como despesa/receita.
export const TRANSACTION_TYPES = [
  { id: 'income', label: 'Receita', color: '#10d97a', sign: 1 },
  { id: 'expense', label: 'Despesa', color: '#f05a5a', sign: -1 },
  { id: 'investment', label: 'Investimento', color: '#7c5af0', sign: -1 },
  { id: 'redemption', label: 'Resgate', color: '#38bdf8', sign: 1 },
];

export const getTypeById = (id) => TRANSACTION_TYPES.find(t => t.id === id) || TRANSACTION_TYPES[1];

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7];
export const getCategoryLabel = (id) => getCategoryById(id).label;
