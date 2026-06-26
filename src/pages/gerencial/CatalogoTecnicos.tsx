import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, UserCheck, UserX, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Technician } from '../../types';

export default function CatalogoTecnicos() {
  const { technicians, users, addTechnician, updateTechnician, deleteTechnician, reassignTechnicianTickets } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disponible' | 'ocupado' | 'inactivo'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    userId: '',
    level: 'N1' as 'N1' | 'N2' | 'N3',
    specialty: '',
    maxTickets: 10,
  });

  const availableUsers = users.filter(
    (u) => u.role === 'tecnico' && !technicians.find((t) => t.userId === u.id && t.id !== editingTechnician?.id)
  );

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tech.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [technicians, searchTerm, statusFilter]);

  const paginatedTechnicians = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTechnicians.slice(start, start + itemsPerPage);
  }, [filteredTechnicians, currentPage]);

  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);

  const openModal = (technician?: Technician) => {
    if (technician) {
      setEditingTechnician(technician);
      setFormData({
        userId: technician.userId,
        level: technician.level,
        specialty: technician.specialty,
        maxTickets: technician.maxTickets,
      });
    } else {
      setEditingTechnician(null);
      setFormData({ userId: '', level: 'N1', specialty: '', maxTickets: 10 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTechnician(null);
    setFormData({ userId: '', level: 'N1', specialty: '', maxTickets: 10 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = users.find((u) => u.id === formData.userId);
    if (!selectedUser) return;

    if (editingTechnician) {
      updateTechnician(editingTechnician.id, {
        userId: formData.userId,
        name: selectedUser.name,
        level: formData.level,
        specialty: formData.specialty,
        maxTickets: formData.maxTickets,
      });
    } else {
      const newTechnician: Technician = {
        id: Date.now().toString(),
        userId: formData.userId,
        name: selectedUser.name,
        level: formData.level,
        specialty: formData.specialty,
        currentLoad: 0,
        status: 'disponible',
        maxTickets: formData.maxTickets,
        isActive: true,
      };
      addTechnician(newTechnician);
    }

    closeModal();
  };

  const handleDeactivate = (id: string) => {
    if (confirm('¿Está seguro de desactivar este técnico? Sus tickets serán reasignados automáticamente.')) {
      const tech = technicians.find((t) => t.id === id);
      if (tech && tech.currentLoad > 0) {
        reassignTechnicianTickets(id);
      }
      deleteTechnician(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    const tech = technicians.find((t) => t.id === id);
    if (tech) {
      const newStatus: 'disponible' | 'ocupado' | 'inactivo' =
        tech.status === 'disponible' ? 'ocupado' : 'disponible';
      updateTechnician(id, { status: newStatus });
    }
  };

  const getLoadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-500';
    return 'text-green-600';
  };

  const getLoadBgColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Catálogo de Técnicos</h1>
          <p className="text-gray-500 text-sm">Gestión del personal de soporte técnico</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Técnico
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'disponible' | 'ocupado' | 'inactivo');
              setCurrentPage(1);
            }}
            className="input-field w-full md:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4 text-left">Técnico</th>
                <th className="px-6 py-4 text-center">Nivel</th>
                <th className="px-6 py-4 text-left">Especialidad</th>
                <th className="px-6 py-4 text-center">Carga Actual</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTechnicians.map((tech) => (
                <tr key={tech.id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-gold font-bold text-sm">
                          {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tech.name}</p>
                        <p className="text-xs text-gray-500">{tech.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tech.level === 'N3' ? 'bg-purple-100 text-purple-800' :
                      tech.level === 'N2' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tech.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{tech.specialty}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${getLoadBgColor(tech.currentLoad, tech.maxTickets)}`}
                          style={{ width: `${Math.min((tech.currentLoad / tech.maxTickets) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getLoadColor(tech.currentLoad, tech.maxTickets)}`}>
                        {tech.currentLoad} / {tech.maxTickets}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${
                      tech.status === 'disponible' ? 'badge-active' :
                      tech.status === 'ocupado' ? 'badge-warning' :
                      'badge-inactive'
                    }`}>
                      {tech.status === 'disponible' ? 'Disponible' :
                       tech.status === 'ocupado' ? 'Ocupado' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {tech.isActive && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(tech.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={tech.status === 'disponible' ? 'Marcar ocupado' : 'Marcar disponible'}
                          >
                            {tech.status === 'disponible' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openModal(tech)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(tech.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar y reasignar tickets"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedTechnicians.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron técnicos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredTechnicians.length)} de{' '}
              {filteredTechnicians.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gold text-slate-dark font-semibold'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-dark">
                {editingTechnician ? 'Editar Técnico' : 'Nuevo Técnico'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input-field"
                  required
                  disabled={!!editingTechnician}
                >
                  <option value="">Seleccionar usuario</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {editingTechnician && (
                  <p className="text-xs text-gray-500 mt-1">El usuario no puede modificarse</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as 'N1' | 'N2' | 'N3' })}
                    className="input-field"
                    required
                  >
                    <option value="N1">N1 - Soporte General</option>
                    <option value="N2">N2 - Técnico Especializado</option>
                    <option value="N3">N3 - Experto Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máx. Tickets
                  </label>
                  <input
                    type="number"
                    value={formData.maxTickets}
                    onChange={(e) => setFormData({ ...formData, maxTickets: parseInt(e.target.value) || 10 })}
                    className="input-field"
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad *
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Hardware/Redes, Software, Aplicaciones Mineras"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingTechnician ? 'Guardar Cambios' : 'Crear Técnico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
