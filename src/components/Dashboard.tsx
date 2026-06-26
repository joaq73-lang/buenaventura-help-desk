import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings, Wrench, Tag, Gauge, Users, FileText, ClipboardList,
  BarChart3, PieChart, Clock, Bell, UserPlus, FilePlus, ArrowUpCircle,
  Search, User, LogOut, ChevronDown, ChevronRight, Building2,
  ShieldCheck, Menu, X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'gerencial', label: 'Grupo Gerencial', icon: <Settings className="w-4 h-4" />,
    children: [
      {
        id: 'gerencial-mantenimiento', label: 'Parámetros', icon: <Wrench className="w-4 h-4" />,
        roles: ['administrador', 'supervisor'],
        children: [
          { id: 'servicios',   label: 'Catálogo de Servicios',  icon: <ClipboardList className="w-4 h-4" />, path: 'gerencial/servicios',   roles: ['administrador', 'supervisor'] },
          { id: 'categorias',  label: 'Categorías',              icon: <Tag           className="w-4 h-4" />, path: 'gerencial/categorias',  roles: ['administrador', 'supervisor'] },
          { id: 'prioridades', label: 'Prioridades',             icon: <Gauge         className="w-4 h-4" />, path: 'gerencial/prioridades', roles: ['administrador'] },
          { id: 'tecnicos',    label: 'Catálogo de Técnicos',    icon: <Users         className="w-4 h-4" />, path: 'gerencial/tecnicos',    roles: ['administrador', 'supervisor'] },
          { id: 'plantillas',  label: 'Plantillas de Respuesta', icon: <FileText      className="w-4 h-4" />, path: 'gerencial/plantillas',  roles: ['administrador', 'supervisor', 'tecnico'] },
        ],
      },
      {
        id: 'gerencial-consultas', label: 'Consultas Gerenciales', icon: <Search className="w-4 h-4" />,
        roles: ['administrador', 'supervisor'],
        children: [
          { id: 'estado-tickets', label: 'Estado de Tickets', icon: <ClipboardList className="w-4 h-4" />, path: 'gerencial/estado-tickets', roles: ['administrador', 'supervisor'] },
          { id: 'kpis',           label: "KPI's",             icon: <BarChart3     className="w-4 h-4" />, path: 'gerencial/kpis',           roles: ['administrador', 'supervisor'] },
          { id: 'graficos',       label: 'Gráficos',          icon: <PieChart      className="w-4 h-4" />, path: 'gerencial/graficos',       roles: ['administrador', 'supervisor'] },
          { id: 'sla',            label: 'SLA',               icon: <Clock         className="w-4 h-4" />, path: 'gerencial/sla',            roles: ['administrador', 'supervisor'] },
          { id: 'alertas',        label: 'Alertas',           icon: <Bell          className="w-4 h-4" />, path: 'gerencial/alertas',        roles: ['administrador', 'supervisor'] },
        ],
      },
    ],
  },
  {
    id: 'operativo', label: 'Grupo Operativo', icon: <ClipboardList className="w-4 h-4" />,
    children: [
      {
        id: 'operativo-entrada', label: 'Entrada de Datos', icon: <FilePlus className="w-4 h-4" />,
        children: [
          { id: 'registro-usuario',  label: 'Registro de Usuario',      icon: <UserPlus      className="w-4 h-4" />, path: 'operativo/registro-usuario',  roles: ['administrador', 'supervisor'] },
          { id: 'generacion-orden',  label: 'Generación de Orden',      icon: <FilePlus      className="w-4 h-4" />, path: 'operativo/generacion-orden',  roles: ['solicitante', 'tecnico', 'supervisor', 'administrador'] },
          { id: 'escalamiento',      label: 'Solicitud de Escalamiento', icon: <ArrowUpCircle className="w-4 h-4" />, path: 'operativo/escalamiento',       roles: ['tecnico'] },
        ],
      },
      {
        id: 'operativo-reportes', label: 'Reportes Operativos', icon: <BarChart3 className="w-4 h-4" />,
        children: [
          { id: 'consulta-cliente',  label: 'Estado de Mis Tickets',    icon: <Search      className="w-4 h-4" />, path: 'operativo/consulta-cliente',  roles: ['solicitante'] },
          { id: 'reporte-clientes',  label: 'Reporte de Clientes',      icon: <Users       className="w-4 h-4" />, path: 'operativo/reporte-clientes',  roles: ['administrador', 'supervisor'] },
          { id: 'reporte-tecnicos',  label: 'Reporte de Soporte',       icon: <ShieldCheck className="w-4 h-4" />, path: 'operativo/reporte-tecnicos',  roles: ['administrador', 'supervisor'] },
        ],
      },
    ],
  },
];

function MenuItemComponent({ item, expanded, toggle, depth = 0 }: {
  item: MenuItem;
  expanded: string[];
  toggle: (id: string) => void;
  depth?: number;
}) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser } = useApp();

  const hasChildren = !!(item.children?.length);
  const isExpanded  = expanded.includes(item.id);
  const isActive    = item.path && location.pathname.includes(item.path);
  const hasAccess   = !item.roles || (currentUser && item.roles.includes(currentUser.role));

  if (!hasAccess) return null;

  const indent = 12 + depth * 12;

  return (
    <>
      <div
        onClick={() => hasChildren ? toggle(item.id) : item.path && navigate(`/dashboard/${item.path}`)}
        className={`flex items-center justify-between py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm select-none ${
          isActive
            ? 'bg-white/15 text-white font-medium border-l-2 border-bv-teal-light'
            : 'text-gray-300 hover:bg-white/8 hover:text-white'
        }`}
        style={{ paddingLeft: `${indent}px`, paddingRight: '12px' }}
      >
        <div className="flex items-center gap-2.5">
          <span className={isActive ? 'text-bv-teal-light' : 'text-gray-400'}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
        {hasChildren && (
          <span className="text-gray-500">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map(child => (
            <MenuItemComponent key={child.id} item={child} expanded={expanded} toggle={toggle} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

// Inline Buenaventura B icon (SVG — matching brand mark)
function BuenaventuraIcon({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/images/image copy.png"
      alt="B"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className="drop-shadow"
    />
  );
}

export default function Dashboard() {
  const { currentUser, logout, alerts } = useApp();
  const [expanded,       setExpanded]   = useState<string[]>(['gerencial', 'gerencial-mantenimiento']);
  const [sidebarOpen,    setSidebarOpen] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const unread = alerts.filter(a => !a.isRead).length;

  const roleLabels: Record<string, string> = {
    administrador: 'Administrador',
    supervisor:    'Supervisor',
    tecnico:       'Técnico',
    solicitante:   'Solicitante',
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #1A3A34 0%, #0E2622 100%)' }}>

      {/* Logo bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex-shrink-0">
            <img src="/images/image copy.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Buenaventura</p>
            <p className="text-gray-400 text-xs">Help Desk</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User pill */}
      <div className="mx-3 my-3 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1A7A6A' }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-gray-400 text-xs">{currentUser && roleLabels[currentUser.role]}</p>
          </div>
          <span className="text-gray-500 text-xs">{currentUser?.miningUnit}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {menuItems.map(item => (
          <MenuItemComponent key={item.id} item={item} expanded={expanded} toggle={toggle} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800 p-1">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span className="text-gray-900 font-medium">
                {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={() => navigate('/dashboard/gerencial/alertas')}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1A7A6A' }}>
                {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser && roleLabels[currentUser.role]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-6 py-2.5 text-center text-xs text-gray-400">
          Compañía de Minas Buenaventura S.A.A. &nbsp;·&nbsp; Módulo On-line Help Desk v1.0 &nbsp;·&nbsp; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
