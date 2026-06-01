import { useState } from 'react';
import { FiZap, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useFinance } from '../../hooks/useFinance';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Login() {
  const { login, loading } = useFinance();
  const [email, setEmail] = useState('alex@financeflow.app');
  const [password, setPassword] = useState('123456');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, password);
    if (!ok) setError('E-mail ou senha incorretos. Tente: alex@financeflow.app / 123456');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c5af0] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#10d97a] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c5af0] shadow-lg shadow-[#7c5af040] mb-5">
            <FiZap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Finance<span className="text-[#7c5af0]">Flow</span>
          </h1>
          <p className="text-sm text-[#55556a]">Controle financeiro inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-[#16161f] border border-[#ffffff0f] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              icon={FiMail}
              required
            />
            <div>
              <Input
                label="Senha"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                icon={FiLock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="mt-1 text-xs text-[#55556a] hover:text-[#8888a8] transition-colors flex items-center gap-1"
              >
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

          <div className="mt-6 p-3 bg-[#7c5af010] border border-[#7c5af020] rounded-xl text-xs text-center text-[#8888a8]">
            <span className="text-[#7c5af0] font-medium">Demo:</span> alex@financeflow.app / 123456
          </div>
        </div>
      </div>
    </div>
  );
}
