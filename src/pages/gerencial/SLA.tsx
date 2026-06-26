import React, { useState, useMemo } from 'react';
import { Clock, User, Building2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';

type TabType = 'ticket' | 'tecnico' | 'unidad' | 'prioridad';

export default function SLA() {
  const { tickets, technicians, miningUnits, priorities } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('ticket');

  const slaDataByTicket = useMemo(() => {
    return tickets.map(ticket => {
      const now = new Date();
      const responseDeadline = new Date(ticket.slaResponseDue);
      const resolutionDeadline = new Date(ticket.slaResolutionDue);

      const responseMet = ticket.status !== 'nuevo' || responseDeadline > now;
      const resolutionMet = ['cerrado', 'resuelto'].includes(ticket.status) ||
        (ticket.status !== 'cerrado' && ticket.status !== 'resuelto' && resolutionDeadline > now);

      return {
        id: ticket.id,
        code: ticket.code,
        title: ticket.title,
        responseMet,
        resolutionMet,
        responseDeadline,
        resolutionDeadline,
        status: ticket.status,
      };
    });
  }, [tickets]);

  const slaByTechnician = useMemo(() => {
    const data: Record<string, { name: string; total: number; met: number; rate: number }> = {};

    tickets.forEach(ticket => {
      const techName = ticket.technicianName || 'Sin Asignar';
      if (!data[techName]) {
        data[techName] = { name: techName, total: 0, met: 0, rate: 0 };
      }
      data[techName].total++;
      if (ticket.slaResolutionMet) {
        data[techName].met++;
      }
    });

    Object.keys(data).forEach(key => {
      data[key].rate = data[key].total > 0 ? (data[key].met / data[key].total) * 100 : 0;
    });

    return Object.values(data);
  }, [tickets]);

  const slaByUnit = useMemo(() => {
    const data: Record<string, { name: string; code: string; total: number; met: number; rate: number }> = {};

    tickets.forEach(ticket => {
      const unit = miningUnits.find(u => u.code === ticket.miningUnit);
      const unitName = unit?.name || ticket.miningUnit;
      if (!data[unitName]) {
        data[unitName] = { name: unitName, code: ticket.miningUnit, total: 0, met: 0, rate: 0 };
      }
      data[unitName].total++;
      if (ticket.slaResolutionMet) {
        data[unitName].met++;
      }
    });

    Object.keys(data).forEach(key => {
      data[key].rate = data[key].total > 0 ? (data[key].met / data[key].total) * 100 : 0;
    });

    return Object.values(data);
  }, [tickets, miningUnits]);

  const slaByPriority = useMemo(() => {
    const data: Record<string, { name: string; total: number; met: number; rate: number; color: string }> = {};

    tickets.forEach(ticket => {
      const priority = priorities.find(p => p.level === ticket.priority);
      const priorityName = priority?.name || ticket.priority;
      if (!data[priorityName]) {
        data[priorityName] = { name: priorityName, total: 0, met: 0, rate: 0, color: priority?.color || '#9CA3AF' };
      }
      data[priorityName].total++;
      if (ticket.slaResolutionMet) {
        data[priorityName].met++;
      }
    });

    Object.keys(data).forEach(key => {
      data[key].rate = data[key].total > 0 ? (data[key].met / data[key].total) * 100 : 100;
    });

    return Object.values(data);
  }, [tickets, priorities]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'ticket', label: 'Por Ticket', icon: <Clock className="w-4 h-4" /> },
    { id: 'tecnico', label: 'Por Técnico', icon: <User className="w-4 h-4" /> },
    { id: 'unidad', label: 'Por Unidad', icon: <Building2 className="w-4 h-4" /> },
    { id: 'prioridad', label: 'Por Prioridad', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const getSlaColor = (rate: number) => {
    if (rate >= 85) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSlaBarColor = (rate: number) => {
    if (rate >= 85) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Cumplimiento SLA</h1>
        <p className="text-gray-500 text-sm">Porcentaje de cumplimiento de acuerdos de nivel de servicio</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gold text-slate-dark'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* By Ticket */}
      {activeTab === 'ticket' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">Código</th>
                  <th className="px-6 py-4 text-left">Título</th>
                  <th className="px-6 py-4 text-center">SLA Respuesta</th>
                  <th className="px-6 py-4 text-center">SLA Resolución</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {slaDataByTicket.slice(0, 20).map(ticket => (
                  <tr key={ticket.id} className="table-row">
                    <td className="px-6 py-4 font-medium text-gray-900">{ticket.code}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{ticket.title}</td>
                    <td className="px-6 py-4 text-center">
                      {ticket.responseMet ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Cumplido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <X className="w-4 h-4" />
                          Vencido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {ticket.resolutionMet ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4 blink-alert" />
                          Vencido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${
                        ticket.responseMet && ticket.resolutionMet ? 'badge-active' : 'badge-critical'
                      }`}>
                        {ticket.responseMet && ticket.resolutionMet ? 'En SLA' : 'Fuera de SLA'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Technician */}
      {activeTab === 'tecnico' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slaByTechnician.map(tech => (
            <div key={tech.name} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.total} tickets</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSlaColor(tech.rate)}`}>
                  {tech.rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getSlaBarColor(tech.rate)}`}
                  style={{ width: `${tech.rate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{tech.met} cumplidos</span>
                <span>{tech.total - tech.met} vencidos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* By Unit */}
      {activeTab === 'unidad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slaByUnit.map(unit => (
            <div key={unit.code} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-dark rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{unit.name}</p>
                    <p className="text-xs text-gray-500">{unit.total} tickets</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSlaColor(unit.rate)}`}>
                  {unit.rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getSlaBarColor(unit.rate)}`}
                  style={{ width: `${unit.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* By Priority */}
      {activeTab === 'prioridad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slaByPriority.map(priority => (
            <div
              key={priority.name}
              className="card"
              style={{ borderTop: `4px solid ${priority.color}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-900">{priority.name}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSlaColor(priority.rate)}`}>
                  {priority.rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getSlaBarColor(priority.rate)}`}
                  style={{ width: `${priority.rate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{priority.met} cumplidos</span>
                <span>{priority.total} total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Interpretación del Cumplimiento SLA</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-gray-600">85% o más: Óptimo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-600">70-84%: Aceptable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Menos de 70%: Crítico</span>
          </div>
        </div>
      </div>
    </div>
  );
}
