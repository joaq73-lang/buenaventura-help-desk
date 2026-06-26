import React, { useState, useMemo } from 'react';
import { Search, Eye, Star, MessageSquare, X, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../../types';

export default function EstadoConsultaCliente() {
  const { tickets, currentUser, resolveTicket, updateTicket } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const myTickets = useMemo(() => {
    return tickets.filter(t =>
      t.requesterId === currentUser?.id || t.requesterName === currentUser?.name
    ).filter(t =>
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, currentUser, searchTerm]);

  const resolvedTickets = myTickets.filter(t => t.status === 'resuelto' && !t.satisfactionRating);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      nuevo: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nuevo' },
      asignado: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Asignado' },
      en_proceso: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En Proceso' },
      pendiente: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pendiente' },
      resuelto: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resuelto' },
      cerrado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cerrado' },
    };
    const style = styles[status] || styles.nuevo;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      muy_baja: 'bg-gray-500',
      baja: 'bg-blue-500',
      media: 'bg-yellow-500',
      alta: 'bg-orange-500',
      critica: 'bg-red-600',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${colors[priority] || 'bg-gray-500'}`}
      >
        {priority.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const handleValidateClosure = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowValidationModal(true);
    setRating(0);
    setComment('');
  };

  const handleSubmitValidation = () => {
    if (selectedTicket && rating > 0) {
      resolveTicket(selectedTicket.id, rating, comment);
      setShowValidationModal(false);
      setSelectedTicket(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingValidations = resolvedTickets.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Estado de Mis Tickets</h1>
          <p className="text-gray-500 text-sm">Consulta el estatus de tus solicitudes</p>
        </div>
        {pendingValidations > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              Tienes {pendingValidations} ticket{pendingValidations > 1 ? 's' : ''} esperando validación
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{myTickets.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-600">
            {myTickets.filter(t => ['en_proceso', 'asignado', 'pendiente'].includes(t.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Resueltos</p>
          <p className="text-2xl font-bold text-green-600">
            {myTickets.filter(t => ['resuelto', 'cerrado'].includes(t.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-gold">
          <p className="text-xs text-gray-500">Sin Validar</p>
          <p className="text-2xl font-bold text-gold">{pendingValidations}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por código o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {myTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`card ${ticket.status === 'resuelto' && !ticket.satisfactionRating ? 'border-2 border-green-400' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-slate-dark">{ticket.code}</span>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
                <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span>Fecha: {formatDate(ticket.createdAt)}</span>
                  {ticket.technicianName && (
                    <span>Técnico: {ticket.technicianName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {ticket.status === 'resuelto' && !ticket.satisfactionRating && (
                  <button
                    onClick={() => handleValidateClosure(ticket)}
                    className="btn-success flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Validar Cierre
                  </button>
                )}
                <button
                  onClick={() => navigate(`/dashboard/operativo/detalle-servicio/${ticket.id}`)}
                  className="btn-outline flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </button>
                {ticket.satisfactionRating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (ticket.satisfactionRating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {myTickets.length === 0 && (
          <div className="card text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron tickets</p>
            <button
              onClick={() => navigate('/dashboard/operativo/generacion-orden')}
              className="btn-primary mt-4"
            >
              Crear Nuevo Ticket
            </button>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-dark">Validar Cierre de Ticket</h2>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ticket</p>
                <p className="font-bold text-gray-900">{selectedTicket.code}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedTicket.title}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Calificación *
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          value <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {rating === 0 && 'Selecciona una calificación'}
                  {rating === 1 && 'Muy Malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios Adicionales
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Escribe tus comentarios sobre la atención recibida..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitValidation}
                  disabled={rating === 0}
                  className="btn-success flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirmar Cierre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
