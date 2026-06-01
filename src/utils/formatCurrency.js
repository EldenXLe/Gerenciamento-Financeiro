export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const parseCurrency = (str) => {
  if (typeof str === 'number') return str;
  return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};
