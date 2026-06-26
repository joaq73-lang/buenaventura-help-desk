import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function Login() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const { login } = useApp();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const result = login(employeeCode, username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Error de autenticación');
    }
    setIsLoading(false);
  };

  const demoAccounts = [
    { code: 'EMP001', username: 'admin',      role: 'Administrador', cls: 'bg-teal-50  text-teal-800  border border-teal-200' },
    { code: 'EMP002', username: 'supervisor', role: 'Supervisor',    cls: 'bg-cyan-50  text-cyan-800  border border-cyan-200' },
    { code: 'EMP003', username: 'tecnico1',   role: 'Técnico',       cls: 'bg-green-50 text-green-800 border border-green-200' },
    { code: 'EMP005', username: 'solicitante',role: 'Solicitante',   cls: 'bg-gray-50  text-gray-700  border border-gray-200' },
  ];

  return (
    /* cream gradient background */
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE6D8 50%, #E0D9CC 100%)' }}
    >
      {/* subtle texture overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1A7A6A22 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* ---- Card ---- */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-bv-cream-dark">

          {/* Header */}
          <div
            className="px-8 py-8 flex flex-col items-center text-center"
            style={{ background: 'linear-gradient(160deg, #F5F0E8 0%, #EDE6D8 100%)' }}
          >
            {/* Full Buenaventura logo */}
            <img
              src="./images/image.png"
              alt="Buenaventura"
              className="h-14 w-auto object-contain mb-5 drop-shadow-sm"
            />

            {/* Divider accent */}
            <div className="flex items-center gap-3 w-full mb-1">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #1A7A6A55)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#1A7A6A' }}>
                Help Desk
              </span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #1A7A6A55)' }} />
            </div>
            <p className="text-sm text-gray-500 mt-1">Sistema de Soporte Técnico</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Employee Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Código de Empleado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={e => setEmployeeCode(e.target.value.toUpperCase())}
                    className="input-field pl-9 text-sm"
                    placeholder="EMP001"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())}
                    className="input-field pl-9 text-sm"
                    placeholder="usuario"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pl-9 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-sm mt-2 flex items-center justify-center gap-2 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3 font-medium">Acceso rápido (demo)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.code}
                    onClick={() => { setEmployeeCode(acc.code); setUsername(acc.username); setPassword('demo1234'); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 ${acc.cls}`}
                  >
                    <span className="font-semibold block">{acc.role}</span>
                    <span className="opacity-70">{acc.username}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-5">
          Compañía de Minas Buenaventura S.A.A. &nbsp;·&nbsp; Help Desk v1.0
        </p>
      </div>
    </div>
  );
}
