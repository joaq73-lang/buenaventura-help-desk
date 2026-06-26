import React, { useState } from 'react';
import { Clock, AlertTriangle, X, Check, Save } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Priority, SlaAction } from '../../types';

export default function GestionPrioridades() {
  const { priorities, updatePriority } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Priority>>({});

  const actionOptions: { value: SlaAction; label: string; description: string }[] = [
    { value: 'escalar', label: 'Escalar', description: 'Escala automáticamente al siguiente nivel' },
    { value: 'alertar', label: 'Alertar', description: 'Envía alerta al supervisor' },
    { value: 'ambos', label: 'Ambos', description: 'Escala y envía alerta simultáneamente' },
  ];

  const handleEdit = (priority: Priority) => {
    setEditingId(priority.id);
    setEditData({
      responseHours: priority.responseHours,
      resolutionHours: priority.resolutionHours,
      actionOnBreach: priority.actionOnBreach,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = () => {
    if (editingId && editData) {
      updatePriority(editingId, {
        responseHours: editData.responseHours,
        resolutionHours: editData.resolutionHours,
        actionOnBreach: editData.actionOnBreach,
      });
      setEditingId(null);
      setEditData({});
    }
  };

  const getPriorityColor = (level: string) => {
    const colors: Record<string, string> = {
      muy_baja: 'bg-gray-500',
      baja: 'bg-blue-500',
      media: 'bg-yellow-500',
      alta: 'bg-orange-500',
      critica: 'bg-red-600',
    };
    return colors[level] || 'bg-gray-500';
  };

  const formatHours = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Gestión de Prioridades</h1>
        <p className="text-gray-500 text-sm">Configuración de SLA y acciones por prioridad</p>
      </div>

      {/* Priority Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {priorities.map((priority) => (
          <div
            key={priority.id}
            className={`card rounded-xl overflow-hidden ${
              priority.level === 'critica' ? 'ring-2 ring-red-500' : ''
            }`}
            style={{ borderTop: `4px solid ${priority.color}` }}
          >
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(priority.level)}`}
                  />
                  <h3 className="text-lg font-bold text-slate-dark">{priority.name}</h3>
                </div>
                {editingId === priority.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={handleSave}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Guardar"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Cancelar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(priority)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Editar"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Response Time */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Tiempo de Respuesta (SLA)
                </label>
                {editingId === priority.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editData.responseHours || 0}
                      onChange={(e) =>
                        setEditData({ ...editData, responseHours: parseInt(e.target.value) || 0 })
                      }
                      className="input-field w-20 text-center"
                      min="0"
                    />
                    <span className="text-gray-500 text-sm">horas</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-dark">
                    {formatHours(priority.responseHours)}
                  </p>
                )}
              </div>

              {/* Resolution Time */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Tiempo de Resolución (SLA)
                </label>
                {editingId === priority.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editData.resolutionHours || 0}
                      onChange={(e) =>
                        setEditData({ ...editData, resolutionHours: parseInt(e.target.value) || 0 })
                      }
                      className="input-field w-20 text-center"
                      min="0"
                    />
                    <span className="text-gray-500 text-sm">horas</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-dark">
                    {formatHours(priority.resolutionHours)}
                  </p>
                )}
              </div>

              {/* Action on Breach */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  Acción al Vencer SLA
                </label>
                {editingId === priority.id ? (
                  <div className="space-y-2">
                    {actionOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          editData.actionOnBreach === option.value
                            ? 'bg-gold/20 border border-gold'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`action-${priority.id}`}
                          value={option.value}
                          checked={editData.actionOnBreach === option.value}
                          onChange={() =>
                            setEditData({ ...editData, actionOnBreach: option.value })
                          }
                          className="text-gold focus:ring-gold"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        priority.actionOnBreach === 'escalar'
                          ? 'bg-red-100 text-red-800'
                          : priority.actionOnBreach === 'alertar'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {actionOptions.find((o) => o.value === priority.actionOnBreach)?.label || priority.actionOnBreach}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Critical Warning */}
            {priority.level === 'critica' && (
              <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                <p className="text-xs text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Prioridad máxima: Requiere atención inmediata
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Prioridades</h3>
        <div className="flex flex-wrap gap-4">
          {priorities.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(p.level)}`} />
              <span className="text-sm text-gray-600">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
