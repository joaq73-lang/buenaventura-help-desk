import React, { useMemo } from 'react';
import { Users, Star, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import * as XLSX from 'xlsx';

export default function ReporteClientes() {
  const { tickets, users, miningUnits } = useApp();

  const clientReport = useMemo(() => {
    const report: Record<string, {
      userId: string;
      userName: string;
      miningUnit: string;
      totalTickets: number;
      openTickets: number;
      resolvedTickets: number;
      reopenedTickets: number;
      satisfactionSum: number;
      satisfactionCount: number;
    }> = {};

    tickets.forEach(ticket => {
      const requesterKey = ticket.requesterId || ticket.requesterName;

      if (!report[requesterKey]) {
        report[requesterKey] = {
          userId: ticket.requesterId,
          userName: ticket.requesterName,
          miningUnit: ticket.miningUnit,
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          reopenedTickets: 0,
          satisfactionSum: 0,
          satisfactionCount: 0,
        };
      }

      report[requesterKey].totalTickets++;

      if (['nuevo', 'asignado', 'en_proceso', 'pendiente'].includes(ticket.status)) {
        report[requesterKey].openTickets++;
      }

      if (['resuelto', 'cerrado'].includes(ticket.status)) {
        report[requesterKey].resolvedTickets++;
      }

      if (ticket.status === 'reabierto') {
        report[requesterKey].reopenedTickets++;
      }

      if (ticket.satisfactionRating) {
        report[requesterKey].satisfactionSum += ticket.satisfactionRating;
        report[requesterKey].satisfactionCount++;
      }
    });

    return Object.values(report).map(r => ({
      ...r,
      averageSatisfaction: r.satisfactionCount > 0
        ? r.satisfactionSum / r.satisfactionCount
        : 0,
    })).sort((a, b) => b.totalTickets - a.totalTickets);
  }, [tickets]);

  const totalStats = useMemo(() => {
    return {
      totalClients: clientReport.length,
      totalTickets: clientReport.reduce((sum, c) => sum + c.totalTickets, 0),
      avgSatisfaction: clientReport.reduce((sum, c) => sum + c.averageSatisfaction, 0) / Math.max(clientReport.length, 1),
    };
  }, [clientReport]);

  const exportToExcel = () => {
    const data = clientReport.map(client => ({
      'Solicitante': client.userName,
      'Unidad Minera': client.miningUnit,
      'Total Tickets': client.totalTickets,
      'Abiertos': client.openTickets,
      'Resueltos': client.resolvedTickets,
      'Reabiertos': client.reopenedTickets,
      'Satisfacción Promedio': client.averageSatisfaction.toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Clientes');
    XLSX.writeFile(wb, `reporte_clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Reporte de Clientes</h1>
          <p className="text-gray-500 text-sm">Análisis de solicitantes de tickets</p>
        </div>
        <button onClick={exportToExcel} className="btn-success flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-gold">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-gold" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalClients}</p>
              <p className="text-sm text-gray-500">Solicitantes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalTickets}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {totalStats.avgSatisfaction.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">Satisfacción Promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-4 text-left">Solicitante</th>
                <th className="px-6 py-4 text-left">Unidad Minera</th>
                <th className="px-6 py-4 text-center">Total Tickets</th>
                <th className="px-6 py-4 text-center">Abiertos</th>
                <th className="px-6 py-4 text-center">Resueltos</th>
                <th className="px-6 py-4 text-center">Reabiertos</th>
                <th className="px-6 py-4 text-center">Satisfacción</th>
              </tr>
            </thead>
            <tbody>
              {clientReport.map((client) => (
                <tr key={client.userId || client.userName} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {client.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{client.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{client.miningUnit}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                      {client.totalTickets}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {client.openTickets > 0 ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {client.openTickets}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {client.resolvedTickets > 0 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit mx-auto">
                        <CheckCircle className="w-3 h-3" />
                        {client.resolvedTickets}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {client.reopenedTickets > 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {client.reopenedTickets}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {client.averageSatisfaction > 0 ? (
                        renderStars(client.averageSatisfaction)
                      ) : (
                        <span className="text-gray-400 text-sm">Sin datos</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clientReport.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay datos de clientes disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
