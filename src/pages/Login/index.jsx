import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiZap, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c5af0] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#10d97a] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c5af0] shadow-lg shadow-[#7c5af040] mb-5">
            <FiZap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Finance<span className="text-[#7c5af0]">Flow</span></h1>
          <p className="text-sm text-[#80859a]">Controle financeiro inteligente</p>
        </div>

        <div className="bg-[#16161f] border border-[#ffffff0f] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-6">Entrar na conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="E-mail" type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="seu@email.com" icon={FiMail} required />

            <div>
              <Input label="Senha" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••" icon={FiLock} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="mt-1 text-xs text-[#80859a] hover:text-[#a3a8ba] transition-colors flex items-center gap-1">
                {showPass ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                {showPass ? 'Ocultar senha' : 'Mostrar senha'}
              </button>
            </div>

            {error && (
              <div className="text-xs text-[#f05a5a] bg-[#f05a5a10] border border-[#f05a5a20] rounded-xl p-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#80859a] mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-[#7c5af0] hover:text-[#9b7af5] transition-colors font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
