import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Service } from '../../types';

export default function CatalogoServicios() {
  const { services, categories, addService, updateService, deleteService } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [] as string[],
  });

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'activo' && service.isActive) ||
        (statusFilter === 'inactivo' && !service.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        categories: service.categories,
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', categories: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', categories: [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      updateService(editingService.id, {
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
      });
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        isActive: true,
        createdAt: new Date(),
      };
      addService(newService);
    }

    closeModal();
  };

  const handleToggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleDeactivate = (id: string) => {
    if (confirm('¿Está seguro de desactivar este servicio?')) {
      deleteService(id);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Catálogo de Servicios</h1>
          <p className="text-gray-500 text-sm">Gestión de servicios del sistema de soporte</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
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
              setStatusFilter(e.target.value as 'all' | 'activo' | 'inactivo');
              setCurrentPage(1);
            }}
            className="input-field w-full md:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
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
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Descripción</th>
                <th className="px-6 py-4 text-left">Categorías</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((service) => (
                <tr key={service.id} className="table-row">
                  <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {service.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {service.categories.slice(0, 2).map((catId) => {
                        const cat = categories.find((c) => c.id === catId);
                        return cat ? (
                          <span key={catId} className="chip text-xs">
                            {cat.name}
                          </span>
                        ) : null;
                      })}
                      {service.categories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{service.categories.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${service.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {service.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {service.isActive && (
                        <button
                          onClick={() => handleDeactivate(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron servicios
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
              {Math.min(currentPage * itemsPerPage, filteredServices.length)} de{' '}
              {filteredServices.length} resultados
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
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Soporte Técnico"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Descripción del servicio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías Aplicables
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c.isActive).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleToggleCategory(category.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.categories.includes(category.id)
                          ? 'bg-gold text-slate-dark border-2 border-gold'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gold'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {formData.categories.includes(category.id) && (
                          <Check className="w-4 h-4" />
                        )}
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
                {categories.filter(c => c.isActive).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No hay categorías disponibles</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
