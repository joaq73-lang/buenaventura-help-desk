import React, { useState, useMemo } from 'react';
import { FilePlus, AlertTriangle, Paperclip, CheckCircle, Save, Building2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { generateTicketCode } from '../../store/AppContext';
import { PriorityLevel } from '../../types';

export default function GeneracionOrden() {
  const { services, categories, priorities, miningUnits, currentUser, technicians, addTicket } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    categoryId: '',
    priority: 'media' as PriorityLevel,
    miningUnit: currentUser?.miningUnit || '',
    affectsProduction: false,
    affectsSafety: false,
    attachments: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!formData.serviceId) return [];
    const service = services.find(s => s.id === formData.serviceId);
    if (!service) return [];
    return categories.filter(c => service.categories.includes(c.id) && c.isActive);
  }, [formData.serviceId, services, categories]);

  const isPriorityLocked = formData.affectsProduction || formData.affectsSafety;

  const availableTechnicians = technicians.filter(t => t.isActive && t.status === 'disponible');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const code = generateTicketCode();
    const priority = isPriorityLocked ? 'critica' : formData.priority;
    const priorityData = priorities.find(p => p.level === priority);

    const now = new Date();
    const responseDue = new Date(now.getTime() + (priorityData?.responseHours || 8) * 60 * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + (priorityData?.resolutionHours || 48) * 60 * 60 * 1000);

    // Auto-assign technician if available
    let assignedTech = null;
    if (availableTechnicians.length > 0) {
      // Find tech with lowest load
      assignedTech = availableTechnicians.reduce((min, t) =>
        t.currentLoad < min.currentLoad ? t : min
      );
    }

    const newTicket = {
      id: Date.now().toString(),
      code,
      title: formData.title,
      description: formData.description,
      serviceId: formData.serviceId,
      categoryId: formData.categoryId,
      priority,
      status: assignedTech ? 'asignado' : 'nuevo',
      requesterId: currentUser?.id || '',
      requesterName: currentUser?.name || '',
      technicianId: assignedTech?.id,
      technicianName: assignedTech?.name,
      miningUnit: formData.miningUnit,
      affectsProduction: formData.affectsProduction,
      affectsSafety: formData.affectsSafety,
      slaResponseDue: responseDue,
      slaResolutionDue: resolutionDue,
      createdAt: now,
      updatedAt: now,
      attachments: formData.attachments,
    };

    addTicket(newTicket);
    setGeneratedCode(code);
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const handleCheckboxChange = (field: 'affectsProduction' | 'affectsSafety', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      serviceId: '',
      categoryId: '',
      priority: 'media',
      miningUnit: currentUser?.miningUnit || '',
      affectsProduction: false,
      affectsSafety: false,
      attachments: [],
    });
    setShowSuccess(false);
    setGeneratedCode('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Generación de Orden de Servicio</h1>
        <p className="text-gray-500 text-sm">Reportar incidente o problema técnico</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-green-800">Ticket Creado Exitosamente</p>
              <p className="text-sm text-green-600 mt-1">
                Su ticket <span className="font-mono font-bold">{generatedCode}</span> ha sido registrado.
              </p>
              <div className="mt-3 flex gap-3">
                <button onClick={resetForm} className="btn-success text-sm">
                  Crear Nuevo Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Critical Flags */}
          <div className="card bg-status-warning border-2 border-yellow-400">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Indicadores de Impacto Crítico</p>
                <p className="text-sm text-yellow-700">
                  Si activa alguna de estas opciones, el ticket se registrará automáticamente como CRÍTICO
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                formData.affectsProduction ? 'bg-red-100 border-2 border-red-500' : 'bg-white border-2 border-gray-200 hover:border-yellow-400'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.affectsProduction}
                  onChange={(e) => handleCheckboxChange('affectsProduction', e.target.checked)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Afecta Producción Minera</p>
                  <p className="text-xs text-gray-500">El incidente impacta operaciones productivas</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                formData.affectsSafety ? 'bg-red-100 border-2 border-red-500' : 'bg-white border-2 border-gray-200 hover:border-yellow-400'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.affectsSafety}
                  onChange={(e) => handleCheckboxChange('affectsSafety', e.target.checked)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Afecta Seguridad Operativa</p>
                  <p className="text-xs text-gray-500">El incidente compromete la seguridad</p>
                </div>
              </label>
            </div>
          </div>

          {/* Main Form */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                <FilePlus className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-lg font-semibold text-slate-dark">Datos del Ticket</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad Minera *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.miningUnit}
                    onChange={(e) => setFormData({ ...formData, miningUnit: e.target.value })}
                    className="input-field pl-10"
                    required
                  >
                    <option value="">Seleccione unidad...</option>
                    {miningUnits.map(unit => (
                      <option key={unit.id} value={unit.code}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Incidente *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Descripción breve del problema"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, categoryId: '' })}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccione servicio...</option>
                    {services.filter(s => s.isActive).map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input-field"
                    required
                    disabled={!formData.serviceId}
                  >
                    <option value="">
                      {formData.serviceId ? 'Seleccione categoría...' : 'Primero seleccione un servicio'}
                    </option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formData.serviceId && filteredCategories.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No hay categorías para este servicio</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="Describa el problema con el mayor detalle posible..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad {isPriorityLocked && <span className="text-red-500">(Forzado a CRÍTICO)</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(priority => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => !isPriorityLocked && setFormData({ ...formData, priority: priority.level })}
                      disabled={isPriorityLocked}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isPriorityLocked
                          ? priority.level === 'critica'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : formData.priority === priority.level
                          ? 'bg-gold text-slate-dark border-2 border-gold'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gold'
                      }`}
                      style={!isPriorityLocked && formData.priority === priority.level ? { backgroundColor: priority.color, borderColor: priority.color } : {}}
                    >
                      {priority.name}
                    </button>
                  ))}
                </div>
                {isPriorityLocked && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    La prioridad está bloqueada como CRÍTICO por afectar producción o seguridad
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjuntos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors cursor-pointer">
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Arrastre archivos aquí o haga clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF hasta 10MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Generando...' : 'Generar Ticket'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
