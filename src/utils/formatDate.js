import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '';
  return format(parsed, pattern, { locale: ptBR });
};

export const formatDateShort = (date) => formatDate(date, 'dd MMM');
export const formatMonth = (date) => formatDate(date, 'MMMM yyyy');
export const toInputDate = (date) => formatDate(date, 'yyyy-MM-dd');
