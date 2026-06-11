export const calcBalance = (transactions) =>
  transactions.reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);

export const calcIncomes = (transactions) =>
  transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);

export const calcExpenses = (transactions) =>
  transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);

export const groupByCategory = (transactions) =>
  transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

export const groupByMonth = (transactions) =>
  transactions.reduce((acc, t) => {
    const key = (t.date || '').substring(0, 7);
    if (!key) return acc;
    if (!acc[key]) acc[key] = { income: 0, expense: 0 };
    acc[key][t.type] += Number(t.amount);
    return acc;
  }, {});

export const exportToCSV = (transactions) => {
  const headers = ['Data,Descrição,Categoria,Tipo,Valor'];
  const rows = transactions.map(t =>
    `${(t.date||'').substring(0,10)},"${t.description}",${t.category},${t.type},${t.amount}`
  );
  const csv  = [...headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'transacoes.csv'; a.click();
  URL.revokeObjectURL(url);
};
