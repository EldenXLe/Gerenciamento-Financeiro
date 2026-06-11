import { useState, useRef } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useFinanceContext } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getCategoryById } from '../../constants/categories';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { v4 as uuidv4 } from 'uuid';

const STEPS = { idle: 'idle', parsing: 'parsing', preview: 'preview', done: 'done', error: 'error' };

// ─── OFX keyword → category mapping ─────────────────────────────────────────
const KEYWORD_MAP = [
  { keywords: ['supermercado','mercado','extra','carrefour','atacadão','hortifruti','feira','ifood','rappi','restaurante','lanchonete','mcdonald','burger','pizza','padaria','delivery'], category: 'food' },
  { keywords: ['uber','99app','taxi','gasolina','combustivel','shell','ipiranga','posto','estacionamento','pedágio','metro','ônibus','transporte'], category: 'transport' },
  { keywords: ['netflix','spotify','steam','cinema','teatro','show','ingresso','amazon prime','disney','hbo','lazer'], category: 'leisure' },
  { keywords: ['salario','salário','holerite','remuneração','proventos','vencimento'], category: 'salary' },
  { keywords: ['investimento','tesouro','cdb','lci','lca','dividendo','rendimento','resgate','xp ','nuinvest','btg'], category: 'investments' },
  { keywords: ['farmácia','drogaria','hospital','clinica','médico','dentista','exame','laboratorio','unimed','amil','academia','gym'], category: 'health' },
  { keywords: ['escola','faculdade','curso','udemy','alura','livro','mensalidade','universidade'], category: 'education' },
];

function guessCategory(desc) {
  const lower = (desc || '').toLowerCase();
  for (const { keywords, category } of KEYWORD_MAP) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'others';
}

function parseOFX(content) {
  const transactions = [];
  const blocks = content.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => { const m = block.match(new RegExp(`<${tag}>([^<\n\r]+)`, 'i')); return m ? m[1].trim() : ''; };
    const rawAmount = parseFloat(get('TRNAMT').replace(',', '.') || '0');
    const desc  = get('MEMO') || get('NAME') || 'Transação OFX';
    const fitid = get('FITID') || uuidv4();
    const rawDate = get('DTPOSTED');
    let date = new Date().toISOString().substring(0, 10);
    if (rawDate?.length >= 8) {
      date = `${rawDate.substring(0,4)}-${rawDate.substring(4,6)}-${rawDate.substring(6,8)}`;
    }
    if (rawAmount === 0) continue;
    transactions.push({
      id: `ofx_${fitid}`,
      description: desc,
      amount: Math.abs(rawAmount),
      type: rawAmount >= 0 ? 'income' : 'expense',
      category: guessCategory(desc),
      date,
      note: 'Importado via OFX',
    });
  }
  return transactions;
}

export default function ImportModal({ isOpen, onClose }) {
  const { importTransactions } = useFinanceContext();
  const [step, setStep]         = useState(STEPS.idle);
  const [parsed, setParsed]     = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const reset      = () => { setStep(STEPS.idle); setParsed([]); setSelected(new Set()); setErrorMsg(''); setFileName(''); };
  const handleClose = () => { reset(); onClose(); };

  const processFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['ofx', 'qfx'].includes(ext)) {
      setErrorMsg('Formato inválido. Envie um arquivo .OFX ou .QFX.');
      setStep(STEPS.error);
      return;
    }
    setFileName(file.name);
    setStep(STEPS.parsing);
    try {
      const text   = await file.text();
      const result = parseOFX(text);
      if (result.length === 0) { setErrorMsg('Nenhuma transação encontrada no arquivo.'); setStep(STEPS.error); return; }
      setParsed(result);
      setSelected(new Set(result.map(t => t.id)));
      setStep(STEPS.preview);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao processar o arquivo.');
      setStep(STEPS.error);
    }
  };

  const handleFile = (e) => processFile(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); };
  const toggleSelect = (id) => { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleAll    = () => selected.size === parsed.length ? setSelected(new Set()) : setSelected(new Set(parsed.map(t => t.id)));

  const handleImport = () => {
    const toImport = parsed.filter(t => selected.has(t.id));
    importTransactions(toImport);
    setStep(STEPS.done);
    setTimeout(handleClose, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Extrato OFX" size="xl">
      {/* IDLE */}
      {step === STEPS.idle && (
        <div className="space-y-4">
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={handleDrop} onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragging ? 'border-[#7c5af0] bg-[#7c5af010]' : 'border-[#ffffff15] hover:border-[#7c5af060] hover:bg-[#7c5af008]'}`}>
            <input ref={inputRef} type="file" accept=".ofx,.qfx" className="hidden" onChange={handleFile} />
            <div className="w-14 h-14 rounded-2xl bg-[#7c5af020] flex items-center justify-center mx-auto mb-4">
              <FiUpload size={26} className="text-[#7c5af0]" />
            </div>
            <p className="font-semibold text-base mb-1">Arraste o arquivo aqui</p>
            <p className="text-sm text-[#55556a] mb-3">ou clique para selecionar</p>
            <span className="text-xs px-3 py-1 rounded-lg bg-[#7c5af020] border border-[#7c5af030] text-[#9b7af5]">OFX / QFX</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#f59e0b10] border border-[#f59e0b20]">
            <FiInfo size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#8888a8]">
              Exporte o arquivo OFX pelo internet banking do seu banco. As categorias são detectadas automaticamente pela descrição.
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
          <p className="text-sm text-[#55556a]">Lendo as transações...</p>
        </div>
      )}

      {/* PREVIEW */}
      {step === STEPS.preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#7c5af010] border border-[#7c5af020]">
            <div className="flex items-center gap-2">
              <FiCheckCircle size={16} className="text-[#7c5af0]" />
              <span className="text-sm font-medium"><span className="text-[#7c5af0]">{parsed.length}</span> transações encontradas em <span className="text-[#f0f0f8]">{fileName}</span></span>
            </div>
            <button onClick={toggleAll} className="text-xs text-[#7c5af0] hover:text-[#9b7af5] transition-colors">
              {selected.size === parsed.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {parsed.map(t => {
              const cat        = getCategoryById(t.category);
              const isSelected = selected.has(t.id);
              return (
                <div key={t.id} onClick={() => toggleSelect(t.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 border
                    ${isSelected ? 'bg-[#7c5af010] border-[#7c5af030]' : 'bg-[#ffffff03] border-[#ffffff06] opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border transition-all
                    ${isSelected ? 'bg-[#7c5af0] border-[#7c5af0]' : 'border-[#ffffff20]'}`}>
                    {isSelected && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: cat.bg, color: cat.color }}>
                    {t.description[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#55556a]">{formatDate(t.date)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${t.type === 'income' ? 'text-[#10d97a]' : 'text-[#f05a5a]'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#ffffff08]">
            <p className="text-xs text-[#55556a]"><span className="text-[#f0f0f8] font-medium">{selected.size}</span> de {parsed.length} selecionadas</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={reset}>Voltar</Button>
              <Button onClick={handleImport} disabled={selected.size === 0}>Importar {selected.size > 0 && `(${selected.size})`}</Button>
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
          <p className="text-sm text-[#55556a]">As transações foram adicionadas com sucesso.</p>
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
            <p className="text-sm text-[#8888a8] max-w-sm mx-auto">{errorMsg}</p>
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
