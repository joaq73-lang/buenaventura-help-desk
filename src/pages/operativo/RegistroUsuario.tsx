import React, { useState } from 'react';
import { UserPlus, Save, X, AlertCircle, Check, Building2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { User, UserRole } from '../../types';

export default function RegistroUsuario() {
  const { users, addUser, miningUnits } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    employeeCode: '',
    username: '',
    name: '',
    email: '',
    dni: '',
    role: 'solicitante' as UserRole,
    miningUnit: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: 'solicitante', label: 'Solicitante', description: 'Empleado que crea tickets de soporte' },
    { value: 'tecnico', label: 'Técnico', description: 'Personal que resuelve tickets' },
    { value: 'supervisor', label: 'Supervisor', description: 'Supervisa y gestiona el equipo' },
    { value: 'administrador', label: 'Administrador', description: 'Acceso completo al sistema' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'El código de empleado es requerido';
    } else if (users.some(u => u.employeeCode.toLowerCase() === formData.employeeCode.toLowerCase())) {
      newErrors.employeeCode = 'Este código ya existe';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      newErrors.username = 'Este nombre de usuario ya existe';
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo letras minúsculas, números y guiones bajos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo inválido';
    } else if (!formData.email.toLowerCase().includes('buenaventura')) {
      newErrors.email = 'Debe ser un correo corporativo (@buenaventura.com)';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    } else if (users.some(u => u.dni === formData.dni)) {
      newErrors.dni = 'Este DNI ya está registrado';
    }

    if (!formData.miningUnit) {
      newErrors.miningUnit = 'Seleccione una unidad minera';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const newUser = {
      id: Date.now().toString(),
      employeeCode: formData.employeeCode.toUpperCase(),
      username: formData.username.toLowerCase(),
      name: formData.name,
      email: formData.email.toLowerCase(),
      dni: formData.dni,
      role: formData.role,
      isFirstLogin: true,
      miningUnit: formData.miningUnit,
      isActive: true,
      createdAt: new Date(),
    };

    addUser(newUser as User);
    setShowSuccess(true);

    // Reset form
    setFormData({
      employeeCode: '',
      username: '',
      name: '',
      email: '',
      dni: '',
      role: 'solicitante',
      miningUnit: '',
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Registro de Usuario</h1>
        <p className="text-gray-500 text-sm">Alta de nuevos colaboradores en el sistema</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Usuario registrado exitosamente</p>
              <p className="text-sm text-green-600">El usuario recibirá credenciales temporales</p>
            </div>
          </div>
          <button onClick={() => setShowSuccess(false)} className="text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-gold" />
          </div>
          <h2 className="text-lg font-semibold text-slate-dark">Datos del Nuevo Usuario</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Empleado *
              </label>
              <input
                type="text"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                className={`input-field ${errors.employeeCode ? 'input-error' : ''}`}
                placeholder="EMP001"
                maxLength={10}
              />
              {errors.employeeCode && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.employeeCode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                className={`input-field ${errors.username ? 'input-error' : ''}`}
                placeholder="usuario123"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="Juan Pérez García"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI *
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                className={`input-field ${errors.dni ? 'input-error' : ''}`}
                placeholder="12345678"
                maxLength={8}
              />
              {errors.dni && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dni}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Corporativo *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="nombre@buenaventura.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="input-field"
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad Minera *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.miningUnit}
                  onChange={(e) => setFormData({ ...formData, miningUnit: e.target.value })}
                  className={`input-field pl-10 ${errors.miningUnit ? 'input-error' : ''}`}
                >
                  <option value="">Seleccione...</option>
                  {miningUnits.map(unit => (
                    <option key={unit.id} value={unit.code}>{unit.name}</option>
                  ))}
                </select>
              </div>
              {errors.miningUnit && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.miningUnit}
                </p>
              )}
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Rol seleccionado:</span>{' '}
              {roleOptions.find(r => r.value === formData.role)?.description}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" />
              Registrar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
