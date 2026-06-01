import { v4 as uuidv4 } from 'uuid';

export const mockTransactions = [
  { id: uuidv4(), description: 'Salário Mensal', amount: 8500, type: 'income', category: 'salary', date: '2025-05-05', note: 'Pagamento mensal' },

];

export const mockUser = {
  id: uuidv4(),
  name: 'Alex Ribeiro',
  email: 'alex@financeflow.app',
  avatar: null,
};
