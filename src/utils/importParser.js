import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES } from '../constants/categories';

// ─── Mapeamento automático de descrição → categoria ───────────────────────────
const KEYWORD_MAP = [
  { keywords: ['supermercado','mercado','extra','pão de açúcar','carrefour','atacadão','hortifruti','feira','açougue'], category: 'food' },
  { keywords: ['restaurante','lanchonete','ifood','rappi','delivery','mcdonald','burger','pizza','sushi','bar ','padaria','cafeteria','subway'], category: 'food' },
  { keywords: ['uber','99','lyft','taxi','combustivel','gasolina','etanol','shell','ipiranga','estacionamento','pedágio','passagem','metro','ônibus','transporte'], category: 'transport' },
  { keywords: ['netflix','spotify','steam','xbox','playstation','cinema','teatro','show','ingresso','lazer','amazon prime','disney','hbo'], category: 'leisure' },
  { keywords: ['salario','salário','pagamento','folha','holerite','remuneração','proventos'], category: 'salary' },
  { keywords: ['investimento','tesouro','cdb','lci','lca','fundo','ação','dividendo','rendimento','resgate','xp ','rico ','nuinvest','clear '], category: 'investments' },
  { keywords: ['farmácia','drogaria','hospital','clinica','médico','dentista','exame','laboratorio','plano de saude','unimed','amil','bradesco saude','academia','gym'], category: 'health' },
  { keywords: ['escola','faculdade','curso','udemy','alura','livro','material escolar','mensalidade','colegio','universidade'], category: 'education' },
];

function guessCategory(description) {
  const lower = (description || '').toLowerCase();
  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'others';
}

function guessType(amount, description) {
  if (typeof amount === 'number') return amount >= 0 ? 'income' : 'expense';
  const lower = (description || '').toLowerCase();
  const incomeWords = ['salario','salário','pagamento','recebimento','transferencia recebida','pix recebido','credito','crédito','rendimento','dividendo'];
  if (incomeWords.some(w => lower.includes(w))) return 'income';
  return 'expense';
}

function normalizeDate(raw) {
  if (!raw) return new Date().toISOString().substring(0, 10);
  // YYYYMMDD (OFX)
  if (/^\d{8}/.test(raw)) {
    const s = raw.substring(0, 8);
    return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
  }
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('/');
    return `${y}-${m}-${d}`;
  }
  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('-');
    return `${y}-${m}-${d}`;
  }
  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  return new Date().toISOString().substring(0, 10);
}

function normalizeAmount(raw) {
  if (typeof raw === 'number') return Math.abs(raw);
  const cleaned = String(raw).replace(/[^\d,.-]/g, '');
  // Formato brasileiro: 1.234,56
  if (/\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned)) {
    return Math.abs(parseFloat(cleaned.replace(/\./g, '').replace(',', '.')));
  }
  return Math.abs(parseFloat(cleaned.replace(',', '.')) || 0);
}

// ─── Parser OFX ───────────────────────────────────────────────────────────────
export function parseOFX(content) {
  const transactions = [];
  const stmttrns = content.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) || [];

  for (const block of stmttrns) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([^<\n\r]+)`, 'i'));
      return m ? m[1].trim() : '';
    };

    const rawAmount = parseFloat(get('TRNAMT').replace(',', '.') || '0');
    const desc = get('MEMO') || get('NAME') || 'Transação importada';
    const date = normalizeDate(get('DTPOSTED'));
    const fitid = get('FITID') || uuidv4();

    transactions.push({
      id: `ofx_${fitid}`,
      description: desc,
      amount: Math.abs(rawAmount),
      type: rawAmount >= 0 ? 'income' : 'expense',
      category: guessCategory(desc),
      date,
      note: 'Importado via OFX',
      createdAt: new Date().toISOString(),
    });
  }
  return transactions;
}

// ─── Parser CSV ───────────────────────────────────────────────────────────────
export function parseCSV(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Detecta separador
  const sep = lines[0].includes(';') ? ';' : ',';

  // Detecta colunas pelo cabeçalho
  const headers = lines[0].split(sep).map(h =>
    h.replace(/['"]/g, '').trim().toLowerCase()
  );

  const findCol = (...names) => {
    for (const n of names) {
      const i = headers.findIndex(h => h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };

  const colDate   = findCol('data', 'date', 'dt');
  const colDesc   = findCol('descri', 'memo', 'histórico', 'historico', 'lancamento', 'lançamento', 'name');
  const colAmount = findCol('valor', 'value', 'amount', 'quantia', 'vlr');
  const colType   = findCol('tipo', 'type', 'natureza');
  const colCat    = findCol('categoria', 'category');

  if (colDesc < 0 || colAmount < 0) {
    throw new Error('Colunas obrigatórias não encontradas. O CSV precisa ter colunas de descrição e valor.');
  }

  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 2) continue;

    const rawAmount = cols[colAmount] || '0';
    const amount = normalizeAmount(rawAmount);
    if (amount === 0) continue;

    const desc = cols[colDesc] || `Transação linha ${i}`;
    const rawDate = colDate >= 0 ? cols[colDate] : '';
    const rawType = colType >= 0 ? cols[colType] : '';

    // Tipo: tenta pela coluna, senão pelo sinal do valor, senão pela descrição
    let type = 'expense';
    if (rawType) {
      const t = rawType.toLowerCase();
      if (t.includes('credit') || t.includes('entrada') || t.includes('receita') || t === 'c') type = 'income';
      else if (t.includes('debit') || t.includes('saida') || t.includes('saída') || t === 'd') type = 'expense';
    } else {
      // Detecta pelo sinal no valor original
      const raw = String(cols[colAmount]);
      if (raw.startsWith('-')) type = 'expense';
      else type = guessType(null, desc);
    }

    const category = colCat >= 0 && cols[colCat]
      ? (CATEGORIES.find(c => c.label.toLowerCase() === cols[colCat].toLowerCase())?.id || guessCategory(desc))
      : guessCategory(desc);

    transactions.push({
      id: `csv_${uuidv4()}`,
      description: desc,
      amount,
      type,
      category,
      date: normalizeDate(rawDate),
      note: 'Importado via CSV',
      createdAt: new Date().toISOString(),
    });
  }
  return transactions;
}

// ─── Parser PDF (texto extraído) ──────────────────────────────────────────────
export function parsePDFText(text) {
  const transactions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Padrão comum em extratos: DATA  DESCRIÇÃO  VALOR
  // Ex: "15/05/2025  Supermercado Extra  -620,00"
  const pattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;

  for (const line of lines) {
    const match = line.match(pattern);
    if (!match) continue;

    const [, rawDate, desc, rawAmount] = match;
    const amount = normalizeAmount(rawAmount);
    if (amount === 0) continue;

    const type = rawAmount.trim().startsWith('-')
      ? 'expense'
      : guessType(null, desc);

    transactions.push({
      id: `pdf_${uuidv4()}`,
      description: desc.trim(),
      amount,
      type,
      category: guessCategory(desc),
      date: normalizeDate(rawDate),
      note: 'Importado via PDF',
      createdAt: new Date().toISOString(),
    });
  }
  return transactions;
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────
export async function parseExtract(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'ofx' || ext === 'qfx') {
    const text = await file.text();
    return parseOFX(text);
  }

  if (ext === 'csv' || ext === 'txt') {
    const text = await file.text();
    return parseCSV(text);
  }

  if (ext === 'pdf') {
    // Usa PDF.js para extrair texto do PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return parsePDFText(fullText);
  }

  throw new Error(`Formato .${ext} não suportado. Use OFX, CSV ou PDF.`);
}
