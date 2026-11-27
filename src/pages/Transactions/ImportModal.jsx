import { useState, useRef } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useFinanceContext } from '../../context/FinanceContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { CATEGORIES, getTypeById } from '../../constants/categories';
import { decodeOFX, guessCategory, guessKind, parseOFX, ruleKey } from '../../utils/ofx';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const STEPS = { idle: 'idle', parsing: 'parsing', preview: 'preview', done: 'done', error: 'error' };

// Tipos da revisão. Transferência entre contas próprias e pagamento de fatura ficam de fora:
// o gasto já aparece no extrato do cartão / na outra conta, e contaria duas vezes.
const OUT_KINDS = [
  ['expense', 'Despesa'],
  ['investment', 'Investimento'],
  ['transfer', 'Transferência entre minhas contas'],
  ['card_payment', 'Pagamento de fatura'],
];
const IN_KINDS = [
  ['income', 'Receita'],
  ['redemption', 'Resgate de investimento'],
  ['transfer', 'Transferência entre minhas contas'],
];
const IMPORTABLE = new Set(['income', 'expense', 'investment', 'redemption']);
const HAS_CATEGORY = new Set(['income', 'expense']);

const selectCls = 'bg-[#0a0a0f] border border-[#ffffff10] rounded-lg text-xs px-2 py-1.5 outline-none focus:border-[#7c5af0] cursor-pointer';

export default function ImportModal({ isOpen, onClose }) {
  const { transactions, importTransactions } = useFinanceContext();
  const [rules, setRules]       = useLocalStorage('ff_import_rules', []);
  const [step, setStep]         = useState(STEPS.idle);
  const [items, setItems]       = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [doneMsg, setDoneMsg]   = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const reset       = () => { setStep(STEPS.idle); setItems([]); setErrorMsg(''); setFileName(''); };
  const handleClose = () => { reset(); onClose(); };
  const fail        = (msg) => { setErrorMsg(msg); setStep(STEPS.error); };

  const processFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['ofx', 'qfx'].includes(ext)) return fail('Formato inválido. Envie um arquivo .OFX ou .QFX.');
    if (file.size > 5 * 1024 * 1024) return fail('Arquivo grande demais para um extrato.');
    setFileName(file.name);
    setStep(STEPS.parsing);
    try {
      const parsed = parseOFX(decodeOFX(new Uint8Array(await file.arrayBuffer())));
      if (parsed.error) return fail(parsed.error);
      if (parsed.items.length === 0) return fail('Nenhuma transação encontrada no arquivo.');

      const existing = new Set(transactions.map(t => t.id));
      const ruleOf   = new Map(rules.map(r => [r.key, r]));
      setItems(parsed.items.map(m => {
        const key  = ruleKey(m.description);
        const auto = { kind: guessKind(m.description, m.inflow), category: guessCategory(m.description) };
        const rule = ruleOf.get(key);
        // Regra salva com tipo do outro sentido (ex.: "resgate" numa saída) não vale.
        const kinds = (m.inflow ? IN_KINDS : OUT_KINDS).map(([k]) => k);
        const kind  = rule && kinds.includes(rule.kind) ? rule.kind : auto.kind;
        const id    = `ofx_${m.fitid}`;
        const exists = existing.has(id);
        return {
          ...m, id, key, auto, kind, exists,
          learned: kind === rule?.kind,
          category: rule?.category ?? auto.category,
          selected: !exists && IMPORTABLE.has(kind),
        };
      }));
      setStep(STEPS.preview);
    } catch (err) {
      fail(err.message || 'Erro ao processar o arquivo.');
    }
  };

  const update = (id, change) => setItems(prev => prev.map(i => {
    if (i.id !== id) return i;
    const next = { ...i, ...change };
    // Trocar o tipo já marca ou desmarca: transferência e fatura não entram.
    if ('kind' in change) next.selected = !i.exists && IMPORTABLE.has(change.kind);
    return next;
  }));

  const selectable = items.filter(i => !i.exists && IMPORTABLE.has(i.kind));
  const chosen     = selectable.filter(i => i.selected);
  const allChosen  = selectable.length > 0 && chosen.length === selectable.length;
  const toggleAll  = () => setItems(prev => prev.map(i =>
    !i.exists && IMPORTABLE.has(i.kind) ? { ...i, selected: !allChosen } : i));
  const countKind  = (k) => items.filter(i => i.kind === k).length;
  const leftOut    = countKind('transfer') + countKind('card_payment');

  const handleImport = () => {
    importTransactions(chosen.map(i => ({
      id: i.id,
      description: i.description,
      amount: i.amount,
      type: i.kind,
      category: HAS_CATEGORY.has(i.kind) ? i.category : 'investments',
      date: i.date,
      note: 'Importado via OFX',
      createdAt: new Date().toISOString(),
    })));

    // Aprende com as correções: o que mudou vira regra; o que voltou ao automático deixa de ser regra.
    const next = new Map(rules.map(r => [r.key, r]));
    let learned = 0;
    for (const i of items.filter(i => !i.exists && i.key)) {
      const fixed = i.kind !== i.auto.kind || (HAS_CATEGORY.has(i.kind) && i.category !== i.auto.category);
      if (fixed) {
        const before = next.get(i.key);
        if (!before || before.kind !== i.kind || before.category !== i.category) learned++;
        next.set(i.key, { key: i.key, kind: i.kind, category: i.category });
      } else next.delete(i.key);
    }
    setRules([...next.values()]);

    setDoneMsg(learned
      ? `${learned} ${learned === 1 ? 'regra aprendida' : 'regras aprendidas'} para os próximos extratos.`
      : 'As transações foram adicionadas com sucesso.');
    setStep(STEPS.done);
    setTimeout(handleClose, 2200);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Extrato OFX" size="xl">
      {/* IDLE */}
      {step === STEPS.idle && (
        <div className="space-y-4">
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            role="button" tabIndex={0}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragging ? 'border-[#7c5af0] bg-[#7c5af010]' : 'border-[#ffffff15] hover:border-[#7c5af060] hover:bg-[#7c5af008]'}`}>
            <input ref={inputRef} type="file" accept=".ofx,.qfx" className="hidden" onChange={(e) => processFile(e.target.files?.[0])} />
            <div className="w-14 h-14 rounded-2xl bg-[#7c5af020] flex items-center justify-center mx-auto mb-4">
              <FiUpload size={26} className="text-[#7c5af0]" />
            </div>
            <p className="font-semibold text-base mb-1">Arraste o arquivo aqui</p>
            <p className="text-sm text-[#80859a] mb-3">ou clique para selecionar</p>
            <span className="text-xs px-3 py-1 rounded-lg bg-[#7c5af020] border border-[#7c5af030] text-[#9b7af5]">OFX / QFX</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#f59e0b10] border border-[#f59e0b20]">
            <FiInfo size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#a3a8ba]">
              Exporte o OFX pelo internet banking (conta ou cartão). Na revisão você marca o que foi investimento,
              transferência entre suas contas ou pagamento de fatura — essas duas últimas ficam de fora para não contar o mesmo dinheiro duas vezes.
            </p>
          </div>
        </div>
      )}

      {/* PARSING */}
      {step === STEPS.parsing && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-[#7c5af020] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiFileText size={26} className="text-[#7c5af0]" />
          </div>
          <p className="font-semibold mb-1">Processando <span className="text-[#7c5af0]">{fileName}</span></p>
          <p className="text-sm text-[#80859a]">Lendo as transações...</p>
        </div>
      )}

      {/* PREVIEW */}
      {step === STEPS.preview && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#7c5af010] border border-[#7c5af020]">
            <div className="flex items-center gap-2">
              <FiCheckCircle size={16} className="text-[#7c5af0]" />
              <span className="text-sm font-medium">
                <span className="text-[#7c5af0]">{items.length}</span> movimentações em <span className="text-[#f0f0f8]">{fileName}</span>
              </span>
            </div>
            {selectable.length > 0 && (
              <button onClick={toggleAll} className="text-xs text-[#7c5af0] hover:text-[#9b7af5] transition-colors">
                {allChosen ? 'Desmarcar todas' : 'Marcar todas'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {['expense', 'income', 'investment', 'redemption'].map(k => countKind(k) > 0 && (
              <span key={k} className="px-2 py-1 rounded-lg" style={{ background: getTypeById(k).color + '20', color: getTypeById(k).color }}>
                {countKind(k)} {getTypeById(k).label.toLowerCase()}
              </span>
            ))}
            {leftOut > 0 && (
              <span className="px-2 py-1 rounded-lg bg-[#ffffff08] text-[#a3a8ba]">
                {leftOut} fora (transferência/fatura)
              </span>
            )}
          </div>

          <ul className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
            {items.map(t => {
              const importable = IMPORTABLE.has(t.kind);
              const color = importable ? getTypeById(t.kind).color : '#a3a8ba';
              const sign  = importable ? (getTypeById(t.kind).sign > 0 ? '+' : '-') : '';
              return (
                <li key={t.id}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl border transition-all duration-150
                    ${t.selected ? 'bg-[#7c5af010] border-[#7c5af030]' : 'bg-[#ffffff03] border-[#ffffff06]'}`}>
                  <input type="checkbox" checked={t.selected} disabled={t.exists || !importable}
                    onChange={(e) => update(t.id, { selected: e.target.checked })}
                    aria-label={`Importar ${t.description}`}
                    className="w-4 h-4 flex-shrink-0 accent-[#7c5af0] cursor-pointer disabled:cursor-not-allowed" />
                  <div className={`flex-1 min-w-0 ${t.selected ? '' : 'opacity-60'}`}>
                    <p className="text-sm font-medium truncate" title={t.description}>{t.description}</p>
                    <p className="text-xs text-[#80859a]">
                      {formatDate(t.date)}
                      {t.exists && ' · já importada'}
                      {!t.exists && !importable && ' · fica de fora'}
                      {!t.exists && t.learned && ' · regra aprendida'}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                    <select value={t.kind} disabled={t.exists} aria-label="Tipo"
                      onChange={(e) => update(t.id, { kind: e.target.value })} className={`${selectCls} flex-1 min-w-0 sm:flex-none sm:w-44`}>
                      {(t.inflow ? IN_KINDS : OUT_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    {HAS_CATEGORY.has(t.kind) ? (
                      <select value={t.category} disabled={t.exists} aria-label="Categoria"
                        onChange={(e) => update(t.id, { category: e.target.value })} className={`${selectCls} flex-1 min-w-0 sm:flex-none sm:w-32`}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    ) : <span className="hidden sm:block w-32" />}
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0 ml-auto sm:w-28 text-right tabular-nums" style={{ color }}>
                    {sign}{formatCurrency(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between pt-2 border-t border-[#ffffff08]">
            <p className="text-xs text-[#80859a]"><span className="text-[#f0f0f8] font-medium">{chosen.length}</span> de {items.length} serão importadas</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={reset}>Voltar</Button>
              <Button onClick={handleImport} disabled={chosen.length === 0}>Importar {chosen.length > 0 && `(${chosen.length})`}</Button>
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {step === STEPS.done && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-[#10d97a20] flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={28} className="text-[#10d97a]" />
          </div>
          <p className="font-semibold text-[#10d97a] text-lg mb-1">Importação concluída!</p>
          <p className="text-sm text-[#80859a]">{doneMsg}</p>
        </div>
      )}

      {/* ERROR */}
      {step === STEPS.error && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-[#f05a5a20] flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={28} className="text-[#f05a5a]" />
            </div>
            <p className="font-semibold text-[#f05a5a] mb-2">Erro ao processar</p>
            <p className="text-sm text-[#a3a8ba] max-w-sm mx-auto">{errorMsg}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={reset}>Tentar novamente</Button>
            <Button variant="ghost" onClick={handleClose}>Fechar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
