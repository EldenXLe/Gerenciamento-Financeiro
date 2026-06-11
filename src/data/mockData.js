import { v4 as uuidv4 } from 'uuid';

export const mockTransactions = [
  { id: uuidv4(), description: 'Salário Mensal', amount: 8500, type: 'income', category: 'salary', date: '2026-05-05', note: 'Pagamento mensal' },
  { id: uuidv4(), description: 'Freelance Design', amount: 2200, type: 'income', category: 'salary', date: '2026-05-12', note: '' },
  { id: uuidv4(), description: 'Dividendos', amount: 450, type: 'income', category: 'investments', date: '2026-05-15', note: '' },
  { id: uuidv4(), description: 'Aluguel', amount: 1800, type: 'expense', category: 'others', date: '2026-05-01', note: 'Apartamento' },
  { id: uuidv4(), description: 'Supermercado Extra', amount: 620, type: 'expense', category: 'food', date: '2026-05-03', note: '' },
  { id: uuidv4(), description: 'Uber', amount: 85, type: 'expense', category: 'transport', date: '2026-05-07', note: '' },
  { id: uuidv4(), description: 'Netflix + Spotify', amount: 78, type: 'expense', category: 'leisure', date: '2026-05-08', note: '' },
  { id: uuidv4(), description: 'Farmácia', amount: 145, type: 'expense', category: 'health', date: '2026-05-10', note: '' },
  { id: uuidv4(), description: 'Curso React', amount: 299, type: 'expense', category: 'education', date: '2026-05-11', note: 'Udemy' },
  { id: uuidv4(), description: 'Restaurante', amount: 210, type: 'expense', category: 'food', date: '2026-05-14', note: '' },
  { id: uuidv4(), description: 'Aporte Tesouro Direto', amount: 500, type: 'expense', category: 'investments', date: '2026-05-16', note: '' },
  { id: uuidv4(), description: 'Academia', amount: 120, type: 'expense', category: 'health', date: '2026-05-17', note: '' },
  { id: uuidv4(), description: 'Gasolina', amount: 200, type: 'expense', category: 'transport', date: '2026-05-19', note: '' },
  { id: uuidv4(), description: 'Show Banda', amount: 160, type: 'expense', category: 'leisure', date: '2026-05-20', note: '' },
  { id: uuidv4(), description: 'Salário Mensal', amount: 8500, type: 'income', category: 'salary', date: '2026-04-05', note: '' },
  { id: uuidv4(), description: 'Renda Extra', amount: 1000, type: 'income', category: 'salary', date: '2026-04-18', note: '' },
  { id: uuidv4(), description: 'Aluguel', amount: 1800, type: 'expense', category: 'others', date: '2026-04-01', note: '' },
  { id: uuidv4(), description: 'Supermercado', amount: 580, type: 'expense', category: 'food', date: '2026-04-05', note: '' },
  { id: uuidv4(), description: 'Plano de Saúde', amount: 340, type: 'expense', category: 'health', date: '2026-04-06', note: '' },
  { id: uuidv4(), description: 'Livros', amount: 180, type: 'expense', category: 'education', date: '2026-04-10', note: '' },
  { id: uuidv4(), description: 'Cinema', amount: 90, type: 'expense', category: 'leisure', date: '2026-04-15', note: '' },
  { id: uuidv4(), description: 'Metrô/Ônibus', amount: 110, type: 'expense', category: 'transport', date: '2026-04-20', note: '' },
  { id: uuidv4(), description: 'Salário Mensal', amount: 8500, type: 'income', category: 'salary', date: '2026-03-05', note: '' },
  { id: uuidv4(), description: 'Aluguel', amount: 1800, type: 'expense', category: 'others', date: '2026-03-01', note: '' },
  { id: uuidv4(), description: 'Supermercado', amount: 640, type: 'expense', category: 'food', date: '2026-03-08', note: '' },
  { id: uuidv4(), description: 'Viagem SP', amount: 850, type: 'expense', category: 'leisure', date: '2026-03-15', note: '' },
  { id: uuidv4(), description: 'Consulta médica', amount: 250, type: 'expense', category: 'health', date: '2026-03-22', note: '' },
];

export const mockUser = {
  id: 'demo-user-001',
  name: 'Alex Ribeiro',
  email: 'alex@financeflow.app',
};
