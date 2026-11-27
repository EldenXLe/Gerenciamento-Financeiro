import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decodeOFX, guessCategory, guessKind, parseOFX, ruleKey } from './ofx.js';

// OFX 1.x (SGML) como os bancos exportam: cabeçalho em texto, tags de valor sem fechamento.
const SGML = `OFXHEADER:100
DATA:OFXSGML
CHARSET:1252

<OFX>
<BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261124120000[-3:BRT]
<TRNAMT>-32.90
<FITID>A1
<MEMO>IFOOD *Restaurante São João
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20261105
<TRNAMT>3500.00
<FITID>A2
<MEMO>Salário
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261110000000
<TRNAMT>-1.234,56
<FITID>A3
<NAME>Aluguel &amp; condomínio
</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1>
</OFX>`;

describe('parseOFX', () => {
  const { items } = parseOFX(SGML);

  it('lê saídas e entradas com valor positivo e marca a direção', () => {
    assert.equal(items.length, 3);
    assert.deepEqual(items[0], { fitid: 'A1', date: '2026-11-24', amount: 32.9, description: 'IFOOD *Restaurante São João', inflow: false });
    assert.deepEqual(items[1], { fitid: 'A2', date: '2026-11-05', amount: 3500, description: 'Salário', inflow: true });
  });

  it('aceita vírgula decimal, usa NAME quando falta MEMO e desfaz &amp;', () => {
    assert.deepEqual(items[2], { fitid: 'A3', date: '2026-11-10', amount: 1234.56, description: 'Aluguel & condomínio', inflow: false });
  });

  it('lê o OFX 2.x em XML', () => {
    const xml = `<?xml version="1.0"?><OFX><STMTTRN><TRNTYPE>DEBIT</TRNTYPE><DTPOSTED>20261103</DTPOSTED><TRNAMT>-55.90</TRNAMT><FITID>X9</FITID><MEMO>NETFLIX.COM</MEMO></STMTTRN></OFX>`;
    assert.equal(parseOFX(xml).items[0].description, 'NETFLIX.COM');
  });

  it('sem FITID, gera código estável e diferencia compras iguais no mesmo dia', () => {
    const raw = `<OFX>
<STMTTRN><DTPOSTED>20261101<TRNAMT>-10.00<MEMO>Café</STMTTRN>
<STMTTRN><DTPOSTED>20261101<TRNAMT>-10.00<MEMO>Café</STMTTRN>
</OFX>`;
    const ids = parseOFX(raw).items.map((i) => i.fitid);
    assert.deepEqual(ids, ['2026-11-01|-10|Café', '2026-11-01|-10|Café#1']);
  });

  it('junta MEMO e NAME quando um completa o outro', () => {
    const one = (memo, name) => parseOFX(`<OFX><STMTTRN><DTPOSTED>20261101<TRNAMT>-5<MEMO>${memo}<NAME>${name}</STMTTRN></OFX>`).items[0].description;
    assert.equal(one('PIX ENVIADO', 'Maria Souza'), 'PIX ENVIADO · Maria Souza');
    assert.equal(one('UBER *TRIP', 'UBER'), 'UBER *TRIP');
  });

  it('recusa o que não é extrato e movimentação inválida', () => {
    assert.match(parseOFX('data;valor').error, /não parece/);
    assert.match(parseOFX('<OFX></OFX>').error, /nenhuma movimentação/);
    assert.match(parseOFX('<OFX><STMTTRN><DTPOSTED>20261340<TRNAMT>-5</STMTTRN></OFX>').error, /inválidos/);
  });
});

const latin1 = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));

describe('decodeOFX', () => {
  it('lê Windows-1252 sem estragar acentos e UTF-8 normalmente', () => {
    assert.match(decodeOFX(latin1('CHARSET:1252\n<OFX><MEMO>São João</OFX>')), /São João/);
    assert.match(decodeOFX(new TextEncoder().encode('<OFX><MEMO>Açaí</OFX>')), /Açaí/);
    assert.match(decodeOFX(latin1('<OFX><MEMO>Pão</OFX>')), /Pão/);
  });
});

describe('guessKind', () => {
  const cases = [
    ['APLICACAO CDB', false, 'investment'],
    ['TESOURO DIRETO', false, 'investment'],
    ['Dinheiro guardado na Caixinha', false, 'investment'],
    ['PAGAMENTO DE FATURA', false, 'card_payment'],
    ['TED MESMA TITULARIDADE', false, 'transfer'],
    ['TED MESMA TITULARIDADE', true, 'transfer'],
    ['IFOOD *Padaria', false, 'expense'],
    ['RESGATE CDB', true, 'redemption'],
    ['Salário', true, 'income'],
    ['PIX RECEBIDO', true, 'income'],
  ];
  for (const [text, inflow, kind] of cases) {
    it(`${inflow ? 'entrada' : 'saída'} "${text}" → ${kind}`, () => assert.equal(guessKind(text, inflow), kind));
  }
});

describe('guessCategory e ruleKey', () => {
  it('sugere categoria ignorando acento', () => {
    assert.equal(guessCategory('FARMÁCIA SÃO PAULO'), 'health');
    assert.equal(guessCategory('UBER *TRIP'), 'transport');
    assert.equal(guessCategory('PIX ENVIADO JOSE'), 'others');
  });
  it('chave da regra ignora acento, número e símbolo', () => {
    assert.equal(ruleKey('PIX ENVIADO · Maria 123'), 'pix enviado maria');
    assert.equal(ruleKey('Pix enviado - MARIA 987'), ruleKey('PIX ENVIADO · Maria 123'));
  });
});
