import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function ChangePasswordModal() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [touched, setTouched] = useState<{ current: boolean; new: boolean; confirm: boolean }>({
    current: false,
    new: false,
    confirm: false,
  });
  const { changePassword } = useApp();

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    if (password.length < 8) issues.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) issues.push('Al menos una mayúscula');
    if (!/[a-z]/.test(password)) issues.push('Al menos una minúscula');
    if (!/[0-9]/.test(password)) issues.push('Al menos un número');
    if (!/[!@#$%^&*]/.test(password)) issues.push('Al menos un carácter especial (!@#$%^&*)');
    return issues;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.current = 'La contraseña actual es requerida';
    }

    const passwordIssues = validatePassword(newPassword);
    if (passwordIssues.length > 0) {
      newErrors.new = passwordIssues.join(', ');
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      changePassword(newPassword);
    }
  };

  const passwordStrength = newPassword.length > 0 ? validatePassword(newPassword).length : 5;
  const strengthColors = ['bg-green-500', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500'];
  const strengthLabels = ['Muy fuerte', 'Fuerte', 'Media', 'Débil', 'Muy débil'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 modal-content">
        <div className="px-6 py-4 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #1A7A6A, #145F52)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cambio de Contraseña</h2>
              <p className="text-sm text-white/70">Primer acceso detectado</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Por seguridad, debe cambiar su contraseña temporal por una definitiva antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual (Temporal)
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, current: true }))}
                  className={`input-field pr-10 ${errors.current && touched.current ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.current && touched.current && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.current}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, new: true }))}
                  className={`input-field pl-10 ${errors.new && touched.new ? 'input-error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i >= passwordStrength ? strengthColors[passwordStrength] : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Fortaleza: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}

              {errors.new && touched.new && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.new}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                  className={`input-field pl-10 ${errors.confirm && touched.confirm ? 'input-error' : ''}`}
                  placeholder="Repita la nueva contraseña"
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}
              </div>
              {errors.confirm && touched.confirm && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirm}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Cambiar Contraseña
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de la contraseña:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                {newPassword.length >= 8 ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                Mínimo 8 caracteres
              </li>
              <li className="flex items-center gap-2">
                {/[A-Z]/.test(newPassword) ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                Una letra mayúscula
              </li>
              <li className="flex items-center gap-2">
                {/[a-z]/.test(newPassword) ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                Una letra minúscula
              </li>
              <li className="flex items-center gap-2">
                {/[0-9]/.test(newPassword) ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                Un número
              </li>
              <li className="flex items-center gap-2">
                {/[!@#$%^&*]/.test(newPassword) ? <CheckCircle className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                Un carácter especial (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
