import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Template } from '../../types';

export default function CatalogoPlantillas() {
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    categoryId: '',
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || template.categoryId === categoryFilter;
      return matchesSearch && matchesCategory && template.isActive;
    });
  }, [templates, searchTerm, categoryFilter]);

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(start, start + itemsPerPage);
  }, [filteredTemplates, currentPage]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

  const openModal = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        content: template.content,
        categoryId: template.categoryId || '',
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', content: '', categoryId: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', categoryId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: formData.name,
        content: formData.content,
        categoryId: formData.categoryId || undefined,
      });
    } else {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: formData.name,
        content: formData.content,
        categoryId: formData.categoryId || undefined,
        isActive: true,
      };
      addTemplate(newTemplate);
    }

    closeModal();
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = (id: string) => {
    if (confirm('¿Está seguro de desactivar esta plantilla?')) {
      deleteTemplate(id);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'General';
    return categories.find((c) => c.id === categoryId)?.name || 'General';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Catálogo de Plantillas</h1>
          <p className="text-gray-500 text-sm">Respuestas rápidas predefinidas</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Plantilla
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar plantilla..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-full md:w-48"
          >
            <option value="all">Todas las categorías</option>
            <option value="">General (sin categoría)</option>
            {categories.filter(c => c.isActive).map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedTemplates.map((template) => (
          <div key={template.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-dark">{template.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                  {getCategoryName(template.categoryId)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(template.content, template.id)}
                  className="p-2 text-gray-500 hover:text-gold hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar texto"
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openModal(template)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeactivate(template.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Desactivar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
              {template.content}
            </p>
          </div>
        ))}
        {paginatedTemplates.length === 0 && (
          <div className="card col-span-full text-center py-12">
            <p className="text-gray-500">No se encontraron plantillas</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-dark">
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Respuesta Inicial, Escalamiento..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido / Texto *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="Escriba el texto predefinido..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría Relacionada (Opcional)
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sin categoría específica (General)</option>
                  {categories.filter(c => c.isActive).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Si selecciona una categoría, la plantilla se recomendará automáticamente para tickets de esa categoría
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
