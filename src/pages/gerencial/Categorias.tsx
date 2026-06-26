import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Category } from '../../types';

export default function Categorias() {
  const { categories, services, addCategory, updateCategory, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applicableServices: [] as string[],
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        applicableServices: category.applicableServices,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', applicableServices: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', applicableServices: [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        applicableServices: formData.applicableServices,
      });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        applicableServices: formData.applicableServices,
        isActive: true,
        createdAt: new Date(),
      };
      addCategory(newCategory);
    }

    closeModal();
  };

  const handleToggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableServices: prev.applicableServices.includes(serviceId)
        ? prev.applicableServices.filter((s) => s !== serviceId)
        : [...prev.applicableServices, serviceId],
    }));
  };

  const handleDeactivate = (id: string) => {
    if (confirm('¿Está seguro de desactivar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Categorías</h1>
          <p className="text-gray-500 text-sm">Tipos de problemas y clasificación</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field pl-10"
          />
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
                <th className="px-6 py-4 text-left">Servicios Aplicables</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => (
                <tr key={category.id} className="table-row">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                    {category.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {category.applicableServices.slice(0, 2).map((servId) => {
                        const serv = services.find((s) => s.id === servId);
                        return serv ? (
                          <span key={servId} className="chip text-xs">
                            {serv.name}
                          </span>
                        ) : null;
                      })}
                      {category.applicableServices.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{category.applicableServices.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${category.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {category.isActive && (
                        <button
                          onClick={() => handleDeactivate(category.id)}
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
              {paginatedCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron categorías
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
              {Math.min(currentPage * itemsPerPage, filteredCategories.length)} de{' '}
              {filteredCategories.length} resultados
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
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Hardware, Software, Redes..."
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
                  className="input-field min-h-[80px]"
                  placeholder="Descripción del tipo de problema..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios Aplicables
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Seleccione a qué servicios aplica esta categoría para filtrado dinámico
                </p>
                <div className="flex flex-wrap gap-2">
                  {services.filter(s => s.isActive).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleToggleService(service.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.applicableServices.includes(service.id)
                          ? 'bg-gold text-slate-dark border-2 border-gold'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gold'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {formData.applicableServices.includes(service.id) && (
                          <Check className="w-4 h-4" />
                        )}
                        {service.name}
                      </span>
                    </button>
                  ))}
                </div>
                {services.filter(s => s.isActive).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No hay servicios disponibles</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
