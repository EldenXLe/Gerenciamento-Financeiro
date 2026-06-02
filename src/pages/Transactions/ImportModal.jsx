import { useState, useRef } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import { parseExtract } from '../../utils/importParser';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getCategoryById } from '../../constants/categories';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const STEPS = { idle: 'idle', parsing: 'parsing', preview: 'preview', done: 'done', error: 'error' };

export default function ImportModal({ isOpen, onClose }) {
  const { importTransactions } = useFinance();
  const [step, setStep] = useState(STEPS.idle);
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const reset = () => {
    setStep(STEPS.idle);
    setParsed([]);
    setSelected(new Set());
    setErrorMsg('');
    setFileName('');
  };

  const handleClose = () => { reset(); onClose(); };

  const processFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setStep(STEPS.parsing);
    try {
      const result = await parseExtract(file);
      if (result.length === 0) {
        setErrorMsg('Nenhuma transação encontrada no arquivo. Verifique se o formato está correto.');
        setStep(STEPS.error);
        return;
      }
      setParsed(result);
      setSelected(new Set(result.map(t => t.id)));
      setStep(STEPS.preview);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao processar o arquivo.');
      setStep(STEPS.error);
    }
  };

  const handleFile = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === parsed.length) setSelected(new Set());
    else setSelected(new Set(parsed.map(t => t.id)));
  };

  const handleImport = () => {
    const toImport = parsed.filter(t => selected.has(t.id));
    importTransactions(toImport);
    setStep(STEPS.done);
    setTimeout(handleClose, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Extrato Bancário" size="xl">
      {/* STEP: IDLE — drop zone */}
      {step === STEPS.idle && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-200
              ${dragging
                ? 'border-[#7c5af0] bg-[#7c5af010]'
                : 'border-[#ffffff15] hover:border-[#7c5af060] hover:bg-[#7c5af008]'
              }
            `}
          >
            <input ref={inputRef} type="file" accept=".ofx,.qfx,.csv,.txt,.pdf" className="hidden" onChange={handleFile} />
            <div className="w-14 h-14 rounded-2xl bg-[#7c5af020] flex items-center justify-center mx-auto mb-4">
              <FiUpload size={26} className="text-[#7c5af0]" />
            </div>
            <p className="font-semibold text-base mb-1">Arraste o arquivo aqui</p>
            <p className="text-sm text-[#55556a] mb-3">ou clique para selecionar</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {['OFX / QFX', 'CSV', 'PDF'].map(f => (
                <span key={f} className="text-xs px-3 py-1 rounded-lg bg-[#ffffff08] border border-[#ffffff10] text-[#8888a8]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Info boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { fmt: 'OFX / QFX', desc: 'Exportado direto pelo internet banking da maioria dos bancos. Formato mais confiável.' },
              { fmt: 'CSV', desc: 'Planilha exportada pelo banco ou gerada manualmente. Precisa ter colunas de data, descrição e valor.' },
              { fmt: 'PDF', desc: 'Extrato em PDF. A leitura depende da qualidade do texto no arquivo — PDFs digitalizados podem não funcionar.' },
            ].map(({ fmt, desc }) => (
              <div key={fmt} className="p-3 rounded-xl bg-[#ffffff04] border border-[#ffffff08]">
                <p className="text-xs font-bold text-[#7c5af0] mb-1">{fmt}</p>
                <p className="text-xs text-[#55556a]">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#f59e0b10] border border-[#f59e0b20]">
            <FiInfo size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#8888a8]">
              As categorias são atribuídas automaticamente pela descrição da transação e podem ser editadas após a importação.
            </p>
          </div>
        </div>
      )}

      {/* STEP: PARSING */}
      {step === STEPS.parsing && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-[#7c5af020] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiFileText size={26} className="text-[#7c5af0]" />
          </div>
          <p className="font-semibold mb-1">Processando <span className="text-[#7c5af0]">{fileName}</span></p>
          <p className="text-sm text-[#55556a]">Lendo e interpretando as transações...</p>
        </div>
      )}

      {/* STEP: PREVIEW */}
      {step === STEPS.preview && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#7c5af010] border border-[#7c5af020]">
            <div className="flex items-center gap-2">
              <FiCheckCircle size={16} className="text-[#7c5af0]" />
              <span className="text-sm font-medium">
                <span className="text-[#7c5af0]">{parsed.length}</span> transações encontradas em{' '}
                <span className="text-[#f0f0f8]">{fileName}</span>
              </span>
            </div>
            <button onClick={toggleAll} className="text-xs text-[#7c5af0] hover:text-[#9b7af5] transition-colors">
              {selected.size === parsed.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>

          {/* Transaction list */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {parsed.map(t => {
              const cat = getCategoryById(t.category);
              const isSelected = selected.has(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleSelect(t.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl cursor-pointer
                    transition-all duration-150 border
                    ${isSelected
                      ? 'bg-[#7c5af010] border-[#7c5af030]'
                      : 'bg-[#ffffff03] border-[#ffffff06] opacity-50'
                    }
                  `}
                >
                  {/* Checkbox visual */}
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border transition-all ${
                    isSelected ? 'bg-[#7c5af0] border-[#7c5af0]' : 'border-[#ffffff20] bg-transparent'
                  }`}>
                    {isSelected && <span className="text-white text-[10px]">✓</span>}
                  </div>

                  {/* Category dot */}
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: cat.bg, color: cat.color }}>
                    {t.description[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#55556a]">{formatDate(t.date)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: cat.bg, color: cat.color }}>
                        {cat.label}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    t.type === 'income' ? 'text-[#10d97a]' : 'text-[#f05a5a]'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#ffffff08]">
            <p className="text-xs text-[#55556a]">
              <span className="text-[#f0f0f8] font-medium">{selected.size}</span> de {parsed.length} selecionadas
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={reset}>Voltar</Button>
              <Button onClick={handleImport} disabled={selected.size === 0}>
                Importar {selected.size > 0 && `(${selected.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: DONE */}
      {step === STEPS.done && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-[#10d97a20] flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={28} className="text-[#10d97a]" />
          </div>
          <p className="font-semibold text-[#10d97a] text-lg mb-1">Importação concluída!</p>
          <p className="text-sm text-[#55556a]">As transações já estão disponíveis.</p>
        </div>
      )}

      {/* STEP: ERROR */}
      {step === STEPS.error && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-[#f05a5a20] flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={28} className="text-[#f05a5a]" />
            </div>
            <p className="font-semibold text-[#f05a5a] mb-2">Erro ao processar o arquivo</p>
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
