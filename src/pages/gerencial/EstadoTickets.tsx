import React, { useState, useMemo } from 'react';
import { Search, Download, AlertTriangle, Calendar, Filter, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketStatus, PriorityLevel } from '../../types';

export default function EstadoTickets() {
  const { tickets, technicians, miningUnits, services, categories, priorities } = useApp();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: '' as TicketStatus | '',
    priority: '' as PriorityLevel | '',
    technicianId: '',
    miningUnit: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 15;

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.technicianId && ticket.technicianId !== filters.technicianId) return false;
      if (filters.miningUnit && ticket.miningUnit !== filters.miningUnit) return false;
      if (filters.dateFrom && new Date(ticket.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(ticket.createdAt) > new Date(filters.dateTo)) return false;
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesCode = ticket.code.toLowerCase().includes(search);
        const matchesTitle = ticket.title.toLowerCase().includes(search);
        const matchesRequester = ticket.requesterName.toLowerCase().includes(search);
        if (!matchesCode && !matchesTitle && !matchesRequester) return false;
      }
      return true;
    });
  }, [tickets, filters]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      // Critical tickets first
      if (a.priority === 'critica' && b.priority !== 'critica') return -1;
      if (b.priority === 'critica' && a.priority !== 'critica') return 1;
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTickets]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTickets.slice(start, start + itemsPerPage);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

  const getStatusBadge = (status: TicketStatus) => {
    const styles: Record<TicketStatus, string> = {
      nuevo: 'bg-blue-100 text-blue-800',
      asignado: 'bg-purple-100 text-purple-800',
      en_proceso: 'bg-yellow-100 text-yellow-800',
      pendiente: 'bg-orange-100 text-orange-800',
      resuelto: 'bg-green-100 text-green-800',
      cerrado: 'bg-gray-100 text-gray-800',
      reabierto: 'bg-red-100 text-red-800',
    };
    const labels: Record<TicketStatus, string> = {
      nuevo: 'Nuevo',
      asignado: 'Asignado',
      en_proceso: 'En Proceso',
      pendiente: 'Pendiente',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
      reabierto: 'Reabierto',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    const priorityData = priorities.find((p) => p.level === priority);
    return (
      <span
        className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: priorityData?.color || '#6B7280' }}
      >
        {priorityData?.name || priority}
      </span>
    );
  };

  const isSlaVencido = (ticket: Ticket) => {
    const now = new Date();
    return (
      (ticket.status !== 'cerrado' && ticket.status !== 'resuelto') &&
      (new Date(ticket.slaResolutionDue) < now)
    );
  };

  const exportToExcel = () => {
    const data = filteredTickets.map((ticket) => ({
      'Código': ticket.code,
      'Título': ticket.title,
      'Servicio': services.find((s) => s.id === ticket.serviceId)?.name || '',
      'Categoría': categories.find((c) => c.id === ticket.categoryId)?.name || '',
      'Prioridad': ticket.priority.toUpperCase(),
      'Estado': ticket.status,
      'Solicitante': ticket.requesterName,
      'Técnico': ticket.technicianName || 'Sin asignar',
      'Unidad Minera': ticket.miningUnit,
      'Afecta Producción': ticket.affectsProduction ? 'Sí' : 'No',
      'Afecta Seguridad': ticket.affectsSafety ? 'Sí' : 'No',
      'Fecha Creación': new Date(ticket.createdAt).toLocaleString(),
      'SLA Respuesta': new Date(ticket.slaResponseDue).toLocaleString(),
      'SLA Resolución': new Date(ticket.slaResolutionDue).toLocaleString(),
      'SLA Vencido': isSlaVencido(ticket) ? 'Sí' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    XLSX.writeFile(wb, `tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      technicianId: '',
      miningUnit: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Estado de Tickets</h1>
          <p className="text-gray-500 text-sm">Visor maestro para supervisores</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline flex items-center gap-2 ${showFilters ? 'border-gold bg-gold/10' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold rounded-full" />
            )}
          </button>
          <button onClick={exportToExcel} className="btn-success flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-dark">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as TicketStatus | '' })}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="asignado">Asignado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="pendiente">Pendiente</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
                <option value="reabierto">Reabierto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as PriorityLevel | '' })}
                className="input-field"
              >
                <option value="">Todas</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.level}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
              <select
                value={filters.technicianId}
                onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}
                className="input-field"
              >
                <option value="">Todos</option>
                {technicians.filter(t => t.isActive).map((tech) => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad Minera</label>
              <select
                value={filters.miningUnit}
                onChange={(e) => setFilters({ ...filters, miningUnit: e.target.value })}
                className="input-field"
              >
                <option value="">Todas</option>
                {miningUnits.map((unit) => (
                  <option key={unit.id} value={unit.code}>{unit.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Código, título o solicitante..."
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Críticos</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredTickets.filter(t => t.priority === 'critica').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredTickets.filter(t => t.status === 'en_proceso').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-700">
          <p className="text-xs text-gray-500">SLA Vencidos</p>
          <p className="text-2xl font-bold text-red-700">
            {filteredTickets.filter(t => isSlaVencido(t)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Resueltos</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredTickets.filter(t => t.status === 'resuelto' || t.status === 'cerrado').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Solicitante</th>
                <th className="px-4 py-3 text-left">Técnico</th>
                <th className="px-4 py-3 text-left">Unidad</th>
                <th className="px-4 py-3 text-center">SLA</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`table-row ${ticket.priority === 'critica' ? 'bg-status-critical' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{ticket.code}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{ticket.title}</td>
                  <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.requesterName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.technicianName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.miningUnit}</td>
                  <td className="px-4 py-3 text-center">
                    {isSlaVencido(ticket) ? (
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="w-5 h-5 text-red-500 blink-alert" />
                        <span className="text-xs text-red-600 font-medium">Vencido</span>
                      </div>
                    ) : (
                      <span className="text-xs text-green-600">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/dashboard/operativo/detalle-servicio/${ticket.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedTickets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron tickets con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, sortedTickets.length)} de{' '}
              {sortedTickets.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
