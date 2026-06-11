import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiZap, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name     = 'Nome é obrigatório';
    if (!form.email.trim())       e.email    = 'E-mail é obrigatório';
    if (form.password.length < 6) e.password = 'Senha deve ter ao menos 6 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register({ name: form.name, email: form.email, password: form.password });
    if (result.success) navigate('/');
    else setErrors({ global: result.message });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#7c5af0] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c5af0] shadow-lg shadow-[#7c5af040] mb-5">
            <FiZap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Finance<span className="text-[#7c5af0]">Flow</span></h1>
          <p className="text-sm text-[#55556a]">Crie sua conta gratuita</p>
        </div>

        <div className="bg-[#16161f] border border-[#ffffff0f] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-6">Criar conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome completo" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Seu nome" icon={FiUser} error={errors.name} />

            <Input label="E-mail" type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="seu@email.com" icon={FiMail} error={errors.email} />

            <div>
              <Input label="Senha" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres" icon={FiLock} error={errors.password} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="mt-1 text-xs text-[#55556a] hover:text-[#8888a8] transition-colors flex items-center gap-1">
                {showPass ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                {showPass ? 'Ocultar senha' : 'Mostrar senha'}
              </button>
            </div>

            <Input label="Confirmar senha" type={showPass ? 'text' : 'password'}
              value={form.confirm} onChange={e => set('confirm', e.target.value)}
              placeholder="Repita a senha" icon={FiLock} error={errors.confirm} />

            {errors.global && (
              <div className="text-xs text-[#f05a5a] bg-[#f05a5a10] border border-[#f05a5a20] rounded-xl p-3">
                {errors.global}
              </div>
            )}

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#55556a] mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#7c5af0] hover:text-[#9b7af5] transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
