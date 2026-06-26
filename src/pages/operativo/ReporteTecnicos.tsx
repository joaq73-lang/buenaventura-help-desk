import React, { useMemo } from 'react';
import { Users, Clock, Star, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import * as XLSX from 'xlsx';

export default function ReporteTecnicos() {
  const { tickets, technicians } = useApp();

  const technicianReport = useMemo(() => {
    const report: Record<string, {
      technicianId: string;
      technicianName: string;
      level: string;
      totalAssigned: number;
      resolved: number;
      open: number;
      slaMet: number;
      slaTotal: number;
      satisfactionSum: number;
      satisfactionCount: number;
      totalResolutionTime: number;
      resolutionCount: number;
    }> = {};

    tickets.forEach(ticket => {
      if (!ticket.technicianId && !ticket.technicianName) return;

      const techKey = ticket.technicianId || ticket.technicianName;
      const tech = technicians.find(t => t.id === ticket.technicianId);

      if (!report[techKey]) {
        report[techKey] = {
          technicianId: ticket.technicianId || '',
          technicianName: ticket.technicianName || 'Sin Asignar',
          level: tech?.level || 'N1',
          totalAssigned: 0,
          resolved: 0,
          open: 0,
          slaMet: 0,
          slaTotal: 0,
          satisfactionSum: 0,
          satisfactionCount: 0,
          totalResolutionTime: 0,
          resolutionCount: 0,
        };
      }

      report[techKey].totalAssigned++;

      if (['resuelto', 'cerrado'].includes(ticket.status)) {
        report[techKey].resolved++;

        if (ticket.resolvedAt) {
          const resolutionTime = (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
          report[techKey].totalResolutionTime += resolutionTime;
          report[techKey].resolutionCount++;
        }

        if (ticket.slaResolutionMet !== undefined) {
          report[techKey].slaTotal++;
          if (ticket.slaResolutionMet) {
            report[techKey].slaMet++;
          }
        }
      } else {
        report[techKey].open++;
      }

      if (ticket.satisfactionRating) {
        report[techKey].satisfactionSum += ticket.satisfactionRating;
        report[techKey].satisfactionCount++;
      }
    });

    return Object.values(report).map(r => ({
      ...r,
      slaCompliance: r.slaTotal > 0 ? (r.slaMet / r.slaTotal) * 100 : 100,
      averageResolutionTime: r.resolutionCount > 0
        ? r.totalResolutionTime / r.resolutionCount
        : 0,
      averageSatisfaction: r.satisfactionCount > 0
        ? r.satisfactionSum / r.satisfactionCount
        : 0,
    })).sort((a, b) => a.slaCompliance - b.slaCompliance);
  }, [tickets, technicians]);

  const getSlaHighlight = (sla: number) => {
    if (sla < 70) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-400',
      };
    }
    if (sla < 85) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-400',
      };
    }
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-400',
    };
  };

  const exportToExcel = () => {
    const data = technicianReport.map(tech => ({
      'Técnico': tech.technicianName,
      'Nivel': tech.level,
      'Asignados': tech.totalAssigned,
      'Resueltos': tech.resolved,
      'Abiertos': tech.open,
      'Cumplimiento SLA (%)': tech.slaCompliance.toFixed(1),
      'Tiempo Promedio (h)': tech.averageResolutionTime.toFixed(1),
      'Satisfacción Promedio': tech.averageSatisfaction.toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Técnicos');
    XLSX.writeFile(wb, `reporte_tecnicos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Reporte de Soporte Técnico</h1>
          <p className="text-gray-500 text-sm">Rendimiento del personal de soporte</p>
        </div>
        <button onClick={exportToExcel} className="btn-success flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* Legend */}
      <div className="card bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-700">Interpretación de Cumplimiento SLA</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Menor a 70%: Crítico (requiere atención)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-600">70-84%: Aceptable (mejora necesaria)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-gray-600">85% o más: Óptimo</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4 text-left">Técnico</th>
                <th className="px-6 py-4 text-center">Nivel</th>
                <th className="px-6 py-4 text-center">Asignados</th>
                <th className="px-6 py-4 text-center">Resueltos</th>
                <th className="px-6 py-4 text-center">Abiertos</th>
                <th className="px-6 py-4 text-center">Cumplimiento SLA</th>
                <th className="px-6 py-4 text-center">Tiempo Prom.</th>
                <th className="px-6 py-4 text-center">Satisfacción</th>
              </tr>
            </thead>
            <tbody>
              {technicianReport.map((tech) => {
                const slaHighlight = getSlaHighlight(tech.slaCompliance);

                return (
                  <tr
                    key={tech.technicianId || tech.technicianName}
                    className={`table-row ${tech.slaCompliance < 70 ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gold">
                            {tech.technicianName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{tech.technicianName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tech.level === 'N3' ? 'bg-purple-100 text-purple-800' :
                        tech.level === 'N2' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tech.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">{tech.totalAssigned}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 font-medium">{tech.resolved}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tech.open > 0 ? (
                        <span className="text-yellow-600 font-medium">{tech.open}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border ${slaHighlight.bg} ${slaHighlight.text} ${slaHighlight.border}`}>
                        {tech.slaCompliance < 70 && <TrendingDown className="w-4 h-4" />}
                        <span className="font-bold">{tech.slaCompliance.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {tech.averageResolutionTime > 0
                          ? `${tech.averageResolutionTime.toFixed(1)}h`
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tech.averageSatisfaction > 0 ? (
                        renderStars(tech.averageSatisfaction)
                      ) : (
                        <span className="text-gray-400 text-sm">Sin datos</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {technicianReport.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No hay datos de técnicos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {technicianReport.filter(t => t.slaCompliance >= 85).length}
              </p>
              <p className="text-sm text-green-600">Técnicos Óptimos (&gt;85% SLA)</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {technicianReport.filter(t => t.slaCompliance >= 70 && t.slaCompliance < 85).length}
              </p>
              <p className="text-sm text-yellow-600">En Mejora (70-84% SLA)</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {technicianReport.filter(t => t.slaCompliance < 70).length}
              </p>
              <p className="text-sm text-red-600">Críticos (&lt;70% SLA)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
