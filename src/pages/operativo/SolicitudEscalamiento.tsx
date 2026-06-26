import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, AlertTriangle, CheckCircle, Send, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { EscalationLevel } from '../../types';

export default function SolicitudEscalamiento() {
  const { tickets, currentUser, technicians } = useApp();

  const [selectedTicket, setSelectedTicket] = useState('');
  const [escalationLevel, setEscalationLevel] = useState<EscalationLevel>('N2');
  const [justification, setJustification] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const myTickets = useMemo(() => {
    return tickets.filter(t =>
      t.technicianId === currentUser?.id ||
      (['en_proceso', 'asignado', 'pendiente'].includes(t.status))
    );
  }, [tickets, currentUser]);

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  const technicianLevel = technicians.find(t => t.userId === currentUser?.id)?.level || 'N1';

  const escalationOptions = useMemo(() => {
    const options: { value: EscalationLevel; label: string; available: boolean }[] = [
      { value: 'N2', label: 'Escalamiento a N2', available: technicianLevel === 'N1' },
      { value: 'N3', label: 'Escalamiento a N3', available: technicianLevel === 'N1' || technicianLevel === 'N2' },
      { value: 'proveedor_externo', label: 'Proveedor Externo', available: true },
    ];
    return options.filter(o => o.available);
  }, [technicianLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !justification.trim()) return;

    setShowSuccess(true);
  };

  const resetForm = () => {
    setSelectedTicket('');
    setEscalationLevel('N2');
    setJustification('');
    setShowSuccess(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      nuevo: 'bg-blue-100 text-blue-800',
      asignado: 'bg-purple-100 text-purple-800',
      en_proceso: 'bg-yellow-100 text-yellow-800',
      pendiente: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Solicitud de Escalamiento</h1>
        <p className="text-gray-500 text-sm">Elevar ticket a nivel superior de soporte</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-green-800">Escalamiento Solicitado</p>
              <p className="text-sm text-green-600 mt-1">
                La solicitud ha sido enviada al supervisor para aprobación.
              </p>
              <button onClick={resetForm} className="btn-success text-sm mt-3">
                Nueva Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {!showSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Selection */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-lg font-semibold text-slate-dark">Seleccionar Ticket</h2>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay tickets asignados disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myTickets.slice(0, 10).map(ticket => (
                  <label
                    key={ticket.id}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedTicket === ticket.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-200 hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="ticket"
                        checked={selectedTicket === ticket.id}
                        onChange={() => setSelectedTicket(ticket.id)}
                        className="w-4 h-4 text-gold focus:ring-gold"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{ticket.code}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">{ticket.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticket.status)}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Escalation Details */}
          {selectedTicket && selectedTicketData && (
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Ticket</p>
                  <p className="font-semibold text-gray-900">{selectedTicketData.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prioridad Actual</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedTicketData.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="font-semibold text-gray-900">{selectedTicketData.requesterName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Escalamiento *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {escalationOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all border-2 ${
                          escalationLevel === option.value
                            ? 'border-gold bg-gold/10'
                            : 'border-gray-200 hover:border-gold/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="level"
                          checked={escalationLevel === option.value}
                          onChange={() => setEscalationLevel(option.value)}
                          className="w-4 h-4 text-gold focus:ring-gold"
                        />
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificación del Escalamiento *
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="input-field min-h-[120px]"
                    placeholder="Explique detalladamente por qué este caso requiere escalamiento..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La justificación es obligatoria y será revisada por el supervisor
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Advertencia</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      El escalamiento será enviado al supervisor para aprobación.
                      Asegúrese de haber agotado las opciones de resolución en su nivel actual.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!justification.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Solicitar Escalamiento
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
