import { useState } from 'react';
import { FiUser, FiTrash2, FiSave, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout, transactions, clearTransactions, resetTransactions } = useFinance();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmModal, setConfirmModal] = useState(null); // null | 'clear' | 'reset'

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Configurações salvas!');
  };

  const handleConfirm = () => {
    if (confirmModal === 'clear') {
      clearTransactions();   // ← usa o Context, não localStorage direto
    } else if (confirmModal === 'reset') {
      resetTransactions();   // ← usa o Context, não localStorage direto
    }
    setConfirmModal(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#7c5af020]">
            <FiUser size={18} className="text-[#7c5af0]" />
          </div>
          <h3 className="font-bold">Perfil</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c5af0] to-[#9b7af5] flex items-center justify-center text-white text-2xl font-bold">
              {name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-[#55556a]">{email}</p>
            </div>
          </div>
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          <Button type="submit" icon={FiSave}>Salvar Alterações</Button>
        </form>
      </Card>

      {/* Stats */}
      <Card className="p-8">
        <h3 className="font-bold mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Total de Transações', transactions.length],
            ['Receitas', transactions.filter(t => t.type === 'income').length],
            ['Despesas', transactions.filter(t => t.type === 'expense').length],
            ['Categorias Usadas', new Set(transactions.map(t => t.category)).size],
          ].map(([label, val]) => (
            <div key={label} className="p-3 rounded-xl bg-[#ffffff05] border border-[#ffffff08]">
              <p className="text-2xl font-bold text-[#7c5af0]">{val}</p>
              <p className="text-xs text-[#55556a]">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-8 border-[#f05a5a20]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#f05a5a20]">
            <FiAlertTriangle size={18} className="text-[#f05a5a]" />
          </div>
          <h3 className="font-bold text-[#f05a5a]">Zona de Perigo</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#f05a5a08] border border-[#f05a5a15]">
            <div>
              <p className="text-sm font-medium">Restaurar dados demo</p>
              <p className="text-xs text-[#55556a]">Volta aos dados de exemplo originais</p>
            </div>
            <Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={() => setConfirmModal('reset')}>
              Restaurar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#f05a5a08] border border-[#f05a5a15]">
            <div>
              <p className="text-sm font-medium">Limpar todos os dados</p>
              <p className="text-xs text-[#55556a]">Remove todas as transações permanentemente</p>
            </div>
            <Button variant="danger" size="sm" icon={FiTrash2} onClick={() => setConfirmModal('clear')}>
              Limpar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#f05a5a08] border border-[#f05a5a15]">
            <div>
              <p className="text-sm font-medium">Sair da conta</p>
              <p className="text-xs text-[#55556a]">Encerrar sessão atual</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout}>Sair</Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal === 'clear' ? 'Limpar todos os dados' : 'Restaurar dados demo'}
        size="sm"
      >
        <p className="text-sm text-[#8888a8] mb-6">
          {confirmModal === 'clear'
            ? 'Todas as transações serão removidas permanentemente. Esta ação não pode ser desfeita.'
            : 'Os dados atuais serão substituídos pelos dados de demonstração. Continuar?'
          }
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmModal(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleConfirm}>
            {confirmModal === 'clear' ? 'Limpar tudo' : 'Restaurar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
