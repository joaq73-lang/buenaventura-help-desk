import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Building2, CheckCircle, MessageSquare, Send, AlertTriangle, Paperclip, Calendar } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function DetalleServicio() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { tickets, services, categories, priorities, users, currentUser, addTicketHistory, updateTicket, technicians } = useApp();

  const [newComment, setNewComment] = React.useState('');

  const ticket = tickets.find(t => t.id === ticketId);

  const service = useMemo(() =>
    ticket ? services.find(s => s.id === ticket.serviceId) : null,
  [ticket, services]);

  const category = useMemo(() =>
    ticket ? categories.find(c => c.id === ticket.categoryId) : null,
  [ticket, categories]);

  const priority = useMemo(() =>
    ticket ? priorities.find(p => p.level === ticket.priority) : null,
  [ticket, priorities]);

  const isTechnician = currentUser?.role === 'tecnico';
  const isAssignedToMe = ticket?.technicianId === currentUser?.id || ticket?.technicianName === currentUser?.name;

  if (!ticket) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Ticket no encontrado</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">
          Volver
        </button>
      </div>
    );
  }

  // Mock timeline data
  const timeline = [
    {
      id: '1',
      action: 'Ticket Creado',
      description: 'El ticket fue registrado en el sistema',
      userName: ticket.requesterName,
      timestamp: ticket.createdAt,
      type: 'creation',
    },
    ...(ticket.technicianName ? [{
      id: '2',
      action: 'Asignado a Técnico',
      description: `Ticket asignado a ${ticket.technicianName}`,
      userName: 'Sistema',
      timestamp: new Date(new Date(ticket.createdAt).getTime() + 5 * 60 * 1000),
      type: 'assignment',
    }] : []),
    ...(ticket.status === 'en_proceso' ? [{
      id: '3',
      action: 'En Proceso',
      description: 'El técnico inició el diagnóstico',
      userName: ticket.technicianName || 'Técnico',
      timestamp: new Date(new Date(ticket.createdAt).getTime() + 30 * 60 * 1000),
      type: 'status',
    }] : []),
    ...(ticket.status === 'resuelto' ? [{
      id: '4',
      action: 'Resuelto',
      description: 'El problema ha sido solucionado',
      userName: ticket.technicianName || 'Técnico',
      timestamp: ticket.resolvedAt || new Date(),
      type: 'resolution',
    }] : []),
  ];

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const handleResolveTicket = () => {
    if (!newComment.trim()) {
      alert('Por favor agregue una nota de resolución');
      return;
    }

    updateTicket(ticket.id, {
      status: 'resuelto',
      resolvedAt: new Date(),
      updatedAt: new Date(),
    });

    addTicketHistory({
      id: Date.now().toString(),
      ticketId: ticket.id,
      action: 'Resuelto',
      description: newComment,
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Técnico',
      timestamp: new Date(),
    });

    setNewComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addTicketHistory({
      id: Date.now().toString(),
      ticketId: ticket.id,
      action: 'Comentario',
      description: newComment,
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Usuario',
      timestamp: new Date(),
    });

    setNewComment('');
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

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>;
      case 'assignment':
        return <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>;
      case 'status':
        return <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>;
      case 'resolution':
        return <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>;
      default:
        return <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">
            {ticket.code}
          </h1>
          <p className="text-gray-500 text-sm">{ticket.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Details */}
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              {getStatusBadge(ticket.status)}
              <div className="flex items-center gap-2">
                {ticket.affectsProduction && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    Afecta Producción
                  </span>
                )}
                {ticket.affectsSafety && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    Afecta Seguridad
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Servicio</p>
                <p className="font-medium text-gray-900">{service?.name || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Categoría</p>
                <p className="font-medium text-gray-900">{category?.name || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Prioridad</p>
                <p className="font-medium text-gray-900"
                  style={{ color: priority?.color }}
                >
                  {priority?.name || ticket.priority}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Unidad</p>
                <p className="font-medium text-gray-900">{ticket.miningUnit}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Descripción</p>
              <p className="text-gray-600">{ticket.description}</p>
            </div>

            {/* SLA Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-status-warning rounded-lg">
              <div>
                <p className="text-xs text-yellow-700">SLA Respuesta</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(ticket.slaResponseDue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-yellow-700">SLA Resolución</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(ticket.slaResolutionDue)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-dark mb-4">Historial del Ticket</h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getTimelineIcon(event.type)}
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{event.action}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Por: {event.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-dark mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notas de Soporte
            </h2>

            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Agregue una nota o comentario..."
              />
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="btn-outline flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Agregar Nota
              </button>

              {isTechnician && isAssignedToMe && ticket.status !== 'resuelto' && ticket.status !== 'cerrado' && (
                <button
                  onClick={handleResolveTicket}
                  disabled={!newComment.trim()}
                  className="btn-success flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolver Ticket
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* People */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Personas</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Solicitante</p>
                  <p className="font-medium text-gray-900">{ticket.requesterName}</p>
                </div>
              </div>

              {ticket.technicianName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Técnico Asignado</p>
                    <p className="font-medium text-gray-900">{ticket.technicianName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Fechas</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Creado</p>
                  <p className="font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-gray-500">Resuelto</p>
                    <p className="font-medium text-gray-900">{formatDate(ticket.resolvedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Adjuntos
            </h3>
            {ticket.attachments.length > 0 ? (
              <div className="space-y-2">
                {ticket.attachments.map((att, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                    {att}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin adjuntos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
