// Lê extratos OFX (conta e cartão) no navegador: o arquivo não sai do aparelho.
// Cobre o OFX 1.x (SGML, tags de valor sem fechamento) e o 2.x (XML). Portado do projeto caderneta-gastos.

/** Muitos bancos ainda gravam em Windows-1252 ("CHARSET:1252"); ler como UTF-8 estragaria "São João". */
export function decodeOFX(bytes) {
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 400)).toUpperCase();
  const legacy = /CHARSET:\s*(1252|ISO-?8859-?1)/.test(head) || /ENCODING="?(WINDOWS-1252|ISO-8859-1)/.test(head);
  if (!legacy) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      // cabeçalho dizia UTF-8 (ou nada), mas os bytes não são: cai para o padrão antigo
    }
  }
  return new TextDecoder('windows-1252').decode(bytes);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const clean = (s) => s.replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENTITIES[e]).replace(/\s+/g, ' ').trim();
const noAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Valor da tag; no SGML ela não fecha, então vai até o próximo "<" ou fim da linha. */
function field(block, tag) {
  const m = block.match(new RegExp(`<${tag}>\\s*([^<\\r\\n]*)`, 'i'));
  return m ? clean(m[1]) : '';
}

/** "-45.90", "-45,90", "-1.234,56" → número com sinal. null se não for número. */
function parseAmount(text) {
  let t = text.replace(/\s/g, '');
  if (t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(/,/g, '');
  if (!/^[+-]?\d+(\.\d+)?$/.test(t)) return null;
  return Math.round(Number(t) * 100) / 100;
}

/** "20261124120000[-3:BRT]" → "2026-11-24". */
function parseDate(text) {
  const m = text.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Alguns bancos põem o tipo no MEMO ("PIX ENVIADO") e quem recebeu no NAME; outros repetem. Junta sem repetir. */
function joinDescription(memo, name) {
  if (!memo || !name) return memo || name;
  const a = noAccents(memo);
  const b = noAccents(name);
  if (a.includes(b)) return memo;
  if (b.includes(a)) return name;
  return `${memo} · ${name}`;
}

/**
 * Devolve { items } (lista de { fitid, date, amount, description, inflow }, amount positivo) ou { error }.
 */
export function parseOFX(text) {
  if (!/<OFX>/i.test(text)) return { error: 'Esse arquivo não parece um extrato OFX.' };
  const blocks = [...text.matchAll(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi)].map((m) => m[1]);
  if (blocks.length === 0) return { error: 'O extrato não tem nenhuma movimentação.' };

  const items = [];
  const seen = new Map();
  for (const block of blocks) {
    const amount = parseAmount(field(block, 'TRNAMT'));
    const date = parseDate(field(block, 'DTPOSTED'));
    if (amount === null || !date) return { error: 'O extrato tem uma movimentação com valor ou data inválidos.' };
    if (amount === 0) continue;
    const description = joinDescription(field(block, 'MEMO'), field(block, 'NAME')).slice(0, 80) || 'Movimentação importada';
    // Sem FITID (raro), monta um código estável com os dados; repetições iguais no mesmo dia ganham um contador.
    const base = field(block, 'FITID') || `${date}|${amount}|${description}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    items.push({ fitid: n ? `${base}#${n}` : base, date, amount: Math.abs(amount), description, inflow: amount > 0 });
  }
  return { items };
}

// Padrões comuns nos extratos brasileiros (sem acento, minúsculo).
const INVESTMENT = /\b(aplic|aplicacao|investimento|invest|cdb|rdb|lci|lca|tesouro|poupanca|caixinha|porquinho|cofrinho|renda fixa|previdencia)\b/;
const REDEMPTION = /\b(resgate|resg|retirada (da |de )?caixinha)\b/;
const CARD_PAYMENT = /\b(fatura|pagamento cartao|pagto cartao|pgto cartao|pag cartao)\b/;
const TRANSFER = /\b(mesma titularidade|entre contas|conta propria|transf(erencia)? propria)\b/;

/**
 * Tipo sugerido pelo texto. Saídas: expense, investment, card_payment ou transfer.
 * Entradas: income, redemption (dinheiro voltando de investimento) ou transfer.
 */
export function guessKind(description, inflow) {
  const t = noAccents(description);
  if (TRANSFER.test(t)) return 'transfer';
  if (inflow) return REDEMPTION.test(t) ? 'redemption' : 'income';
  if (CARD_PAYMENT.test(t)) return 'card_payment';
  if (INVESTMENT.test(t)) return 'investment';
  return 'expense';
}

// Palavras sem acento; a primeira que aparecer na descrição decide.
const KEYWORDS = [
  ['food', ['supermercado', 'mercado', 'carrefour', 'atacadao', 'assai', 'hortifruti', 'feira', 'ifood', 'rappi', 'restaurante', 'lanchonete', 'mcdonald', 'burger', 'pizza', 'padaria', 'delivery', 'acougue']],
  ['transport', ['uber', '99app', '99 pop', 'taxi', 'gasolina', 'combustivel', 'shell', 'ipiranga', 'posto', 'estacionamento', 'pedagio', 'sem parar', 'metro', 'onibus', 'transporte']],
  ['leisure', ['netflix', 'spotify', 'steam', 'cinema', 'teatro', 'show', 'ingresso', 'amazon prime', 'disney', 'hbo', 'lazer', 'playstation', 'xbox']],
  ['salary', ['salario', 'holerite', 'remuneracao', 'proventos', 'vencimento']],
  ['investments', ['dividendo', 'rendimento', 'juros sobre capital']],
  ['health', ['farmacia', 'drogaria', 'drogasil', 'droga raia', 'hospital', 'clinica', 'medico', 'dentista', 'exame', 'laboratorio', 'unimed', 'amil', 'academia', 'gym']],
  ['education', ['escola', 'faculdade', 'curso', 'udemy', 'alura', 'livro', 'mensalidade', 'universidade']],
];

export function guessCategory(description) {
  const t = ` ${noAccents(description)} `;
  let best = { id: 'others', i: Infinity };
  for (const [id, words] of KEYWORDS) {
    for (const w of words) {
      const i = t.indexOf(w);
      if (i >= 0 && i < best.i) best = { id, i };
    }
  }
  return best.id;
}

/** Chave das regras aprendidas: sem acento, números e símbolos ("PIX ENVIADO MARIA 123" → "pix enviado maria"). */
export function ruleKey(description) {
  return noAccents(description).replace(/[^a-z]+/g, ' ').trim();
}
