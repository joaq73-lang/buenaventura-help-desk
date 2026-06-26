import React, { useState, useMemo } from 'react';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Graficos() {
  const { tickets, technicians, miningUnits, priorities, services, categories } = useApp();
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<'estado' | 'prioridad' | 'tecnico' | 'unidad'>('estado');

  const statusLabels: Record<string, string> = {
    nuevo: 'Nuevo',
    asignado: 'Asignado',
    en_proceso: 'En Proceso',
    pendiente: 'Pendiente',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
    reabierto: 'Reabierto',
  };

  const statusColors: Record<string, string> = {
    nuevo: '#3B82F6',
    asignado: '#8B5CF6',
    en_proceso: '#F59E0B',
    pendiente: '#F97316',
    resuelto: '#10B981',
    cerrado: '#6B7280',
    reabierto: '#EF4444',
  };

  const ticketsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      counts[ticket.status] = (counts[ticket.status] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  const ticketsByPriority = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      counts[ticket.priority] = (counts[ticket.priority] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  const ticketsByTechnician = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const name = ticket.technicianName || 'Sin Asignar';
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  const ticketsByUnit = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((ticket) => {
      const unit = miningUnits.find(u => u.code === ticket.miningUnit)?.name || ticket.miningUnit;
      counts[unit] = (counts[unit] || 0) + 1;
    });
    return counts;
  }, [tickets, miningUnits]);

  const pieDataByStatus = {
    labels: Object.keys(ticketsByStatus).map(k => statusLabels[k] || k),
    datasets: [{
      data: Object.values(ticketsByStatus),
      backgroundColor: Object.keys(ticketsByStatus).map(k => statusColors[k] || '#9CA3AF'),
      borderColor: '#FFFFFF',
      borderWidth: 2,
    }],
  };

  const pieDataByPriority = {
    labels: Object.keys(ticketsByPriority).map(k => {
      const p = priorities.find(p => p.level === k);
      return p?.name || k;
    }),
    datasets: [{
      data: Object.values(ticketsByPriority),
      backgroundColor: Object.keys(ticketsByPriority).map(k => {
        const p = priorities.find(p => p.level === k);
        return p?.color || '#9CA3AF';
      }),
      borderColor: '#FFFFFF',
      borderWidth: 2,
    }],
  };

  const barDataByTechnician = {
    labels: Object.keys(ticketsByTechnician),
    datasets: [{
      label: 'Tickets Asignados',
      data: Object.values(ticketsByTechnician),
      backgroundColor: '#D4AF37',
      borderColor: '#B8962F',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const barDataByUnit = {
    labels: Object.keys(ticketsByUnit),
    datasets: [{
      label: 'Tickets por Unidad',
      data: Object.values(ticketsByUnit),
      backgroundColor: '#2F3640',
      borderColor: '#1F2937',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const handleChartClick = (type: string, label: string) => {
    // Navigate to filtered view
    navigate(`/dashboard/gerencial/estado-tickets`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
    onClick: (_event: unknown, elements: { index: number }[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = activeChart === 'estado'
          ? Object.keys(ticketsByStatus)[index]
          : activeChart === 'prioridad'
          ? Object.keys(ticketsByPriority)[index]
          : '';
        handleChartClick(activeChart, label);
      }
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#F3F4F6',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-dark">Gráficos Estadísticos</h1>
        <p className="text-gray-500 text-sm">Visualización de distribución de tickets</p>
      </div>

      {/* Chart Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveChart('estado')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'estado'
              ? 'bg-gold text-slate-dark'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Por Estado
        </button>
        <button
          onClick={() => setActiveChart('prioridad')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'prioridad'
              ? 'bg-gold text-slate-dark'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Por Prioridad
        </button>
        <button
          onClick={() => setActiveChart('tecnico')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'tecnico'
              ? 'bg-gold text-slate-dark'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Por Técnico
        </button>
        <button
          onClick={() => setActiveChart('unidad')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'unidad'
              ? 'bg-gold text-slate-dark'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Por Unidad Minera
        </button>
      </div>

      {/* Chart Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-dark mb-4">
            {activeChart === 'estado' && 'Distribución por Estado'}
            {activeChart === 'prioridad' && 'Distribución por Prioridad'}
            {activeChart === 'tecnico' && 'Tickets por Técnico'}
            {activeChart === 'unidad' && 'Tickets por Unidad Minera'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Haga clic en un sector para ver los tickets relacionados
          </p>
          <div className="h-80">
            {activeChart === 'estado' && <Pie data={pieDataByStatus} options={chartOptions} />}
            {activeChart === 'prioridad' && <Pie data={pieDataByPriority} options={chartOptions} />}
            {activeChart === 'tecnico' && <Bar data={barDataByTechnician} options={barOptions} />}
            {activeChart === 'unidad' && <Bar data={barDataByUnit} options={barOptions} />}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Estados</h3>
          <div className="space-y-2">
            {Object.entries(ticketsByStatus)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColors[status] || '#9CA3AF' }}
                    />
                    <span className="text-sm text-gray-600">{statusLabels[status] || status}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Prioridades</h3>
          <div className="space-y-2">
            {Object.entries(ticketsByPriority)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([priority, count]) => {
                const p = priorities.find(pr => pr.level === priority);
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: p?.color || '#9CA3AF' }}
                      />
                      <span className="text-sm text-gray-600">{p?.name || priority}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
