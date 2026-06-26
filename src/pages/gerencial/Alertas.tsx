import React from 'react';
import { Bell, AlertTriangle, ExternalLink, Check, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Alertas() {
  const { alerts, markAlertAsRead } = useApp();
  const navigate = useNavigate();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sla_vencido':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'ticket_critico':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'ticket_sin_asignar':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'escalamiento_pendiente':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'sla_vencido':
        return 'border-l-red-500 bg-red-50';
      case 'ticket_critico':
        return 'border-l-red-600 bg-red-50';
      case 'ticket_sin_asignar':
        return 'border-l-orange-500 bg-orange-50';
      case 'escalamiento_pendiente':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleViewTicket = (ticketId: string, alertId: string) => {
    markAlertAsRead(alertId);
    navigate(`/dashboard/operativo/detalle-servicio/${ticketId}`);
  };

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    if (diffMinutes < 1440) return `Hace ${Math.floor(diffMinutes / 60)} horas`;
    return alertDate.toLocaleDateString();
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Alertas del Sistema</h1>
          <p className="text-gray-500 text-sm">Notificaciones automáticas importantes</p>
        </div>
        {unreadAlerts.length > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {unreadAlerts.length} sin leer
          </span>
        )}
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Alertas Nuevas
          </h2>
          <div className="space-y-3">
            {unreadAlerts.map(alert => (
              <div
                key={alert.id}
                className={`card border-l-4 ${getAlertStyle(alert.type)} ${
                  alert.type === 'sla_vencido' || alert.type === 'ticket_critico' ? 'blink-alert' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.ticketId && (
                      <button
                        onClick={() => handleViewTicket(alert.ticketId!, alert.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Ticket"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como leída"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Alertas Leídas</h2>
          <div className="space-y-3">
            {readAlerts.map(alert => (
              <div
                key={alert.id}
                className="card border-l-4 border-gray-300 bg-gray-50 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 opacity-50">{getAlertIcon(alert.type)}</div>
                    <div>
                      <p className="font-medium text-gray-700">{alert.message}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Leída</span>
                    {alert.ticketId && (
                      <button
                        onClick={() => navigate(`/dashboard/operativo/detalle-servicio/${alert.ticketId}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Ticket"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay alertas en este momento</p>
          <p className="text-sm text-gray-400 mt-1">
            Las alertas se generarán automáticamente según las reglas del sistema
          </p>
        </div>
      )}
    </div>
  );
}
