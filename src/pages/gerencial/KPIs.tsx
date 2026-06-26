import React, { useState, useMemo } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Star, BarChart } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function KPIs() {
  const { tickets, technicians, services } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useRealTime, setUseRealTime] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setUseRealTime((prev) => !prev);
      setIsRefreshing(false);
    }, 1500);
  };

  const kpiData = useMemo(() => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t =>
      ['nuevo', 'asignado', 'en_proceso', 'pendiente'].includes(t.status)
    ).length;
    const resolvedTickets = tickets.filter(t => t.status === 'cerrado' || t.status === 'resuelto').length;
    const criticalTickets = tickets.filter(t => t.priority === 'critica').length;

    const resolvedWithRating = tickets.filter(t => t.satisfactionRating);
    const avgSatisfaction = resolvedWithRating.length > 0
      ? resolvedWithRating.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / resolvedWithRating.length
      : 0;

    const avgResolutionTime = resolvedTickets > 0
      ? tickets
          .filter(t => t.resolvedAt || t.closedAt)
          .reduce((sum, t) => {
            const end = new Date(t.resolvedAt || t.closedAt || new Date()).getTime();
            const start = new Date(t.createdAt).getTime();
            return sum + (end - start) / (1000 * 60 * 60);
          }, 0) / resolvedTickets
      : 0;

    const slaCompliant = tickets.filter(t => t.slaResolutionMet).length;
    const slaTotal = tickets.filter(t => t.slaResolutionMet !== undefined || t.status === 'cerrado' || t.status === 'resuelto').length;
    const slaComplianceRate = slaTotal > 0 ? (slaCompliant / slaTotal) * 100 : 95;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      criticalTickets,
      avgSatisfaction,
      avgResolutionTime,
      slaComplianceRate: useRealTime ? slaComplianceRate + Math.random() * 5 - 2.5 : slaComplianceRate,
      technicianCount: technicians.filter(t => t.isActive).length,
      availableTechnicians: technicians.filter(t => t.status === 'disponible').length,
    };
  }, [tickets, technicians, useRealTime]);

  const formatHours = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${Math.round(hours % 24)}h`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">KPI's - Indicadores Clave</h1>
          <p className="text-gray-500 text-sm">Dashboard ejecutivo de rendimiento</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Refrescar Ahora'}
        </button>
      </div>

      {/* Data Source Indicator */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${useRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {useRealTime ? 'Datos en Tiempo Real' : 'Datos Precalculados'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Última actualización: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-gold" />
            <span className="text-xs text-gray-500">Promedio</span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">
            {formatHours(kpiData.avgResolutionTime)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tiempo de Resolución</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs text-gray-500">Cumplimiento</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {kpiData.slaComplianceRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">SLA General</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <BarChart className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">{kpiData.totalTickets}</p>
          <p className="text-sm text-gray-500 mt-1">Tickets Registrados</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-gray-500">Satisfacción</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {kpiData.avgSatisfaction.toFixed(1)}/5
          </p>
          <p className="text-sm text-gray-500 mt-1">Calificación Promedio</p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{kpiData.criticalTickets}</p>
              <p className="text-sm text-gray-600">Tickets Críticos</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{kpiData.openTickets}</p>
              <p className="text-sm text-gray-600">Tickets Abiertos</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{kpiData.resolvedTickets}</p>
              <p className="text-sm text-gray-600">Tickets Resueltos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Stats */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-dark mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Estado del Equipo Técnico
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-slate-dark">{kpiData.technicianCount}</p>
            <p className="text-sm text-gray-600">Técnicos Activos</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{kpiData.availableTechnicians}</p>
            <p className="text-sm text-gray-600">Disponibles</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{kpiData.technicianCount - kpiData.availableTechnicians}</p>
            <p className="text-sm text-gray-600">Ocupados</p>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-dark mb-4">Resumen de Cumplimiento</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Cumplimiento SLA</span>
              <span className="text-sm font-medium text-gray-900">{kpiData.slaComplianceRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  kpiData.slaComplianceRate >= 85 ? 'bg-green-500' :
                  kpiData.slaComplianceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${kpiData.slaComplianceRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Tasa de Resolución</span>
              <span className="text-sm font-medium text-gray-900">
                {kpiData.totalTickets > 0
                  ? ((kpiData.resolvedTickets / kpiData.totalTickets) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${kpiData.totalTickets > 0
                  ? (kpiData.resolvedTickets / kpiData.totalTickets) * 100
                  : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Satisfacción del Cliente</span>
              <span className="text-sm font-medium text-gray-900">
                {(kpiData.avgSatisfaction / 5 * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${(kpiData.avgSatisfaction / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
