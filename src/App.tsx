import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Login from './components/Login';
import ChangePasswordModal from './components/ChangePasswordModal';
import Dashboard from './components/Dashboard';
import CatalogoServicios from './pages/gerencial/CatalogoServicios';
import Categorias from './pages/gerencial/Categorias';
import GestionPrioridades from './pages/gerencial/GestionPrioridades';
import CatalogoTecnicos from './pages/gerencial/CatalogoTecnicos';
import CatalogoPlantillas from './pages/gerencial/CatalogoPlantillas';
import EstadoTickets from './pages/gerencial/EstadoTickets';
import KPIs from './pages/gerencial/KPIs';
import Graficos from './pages/gerencial/Graficos';
import SLA from './pages/gerencial/SLA';
import Alertas from './pages/gerencial/Alertas';
import RegistroUsuario from './pages/operativo/RegistroUsuario';
import GeneracionOrden from './pages/operativo/GeneracionOrden';
import SolicitudEscalamiento from './pages/operativo/SolicitudEscalamiento';
import EstadoConsultaCliente from './pages/operativo/EstadoConsultaCliente';
import DetalleServicio from './pages/operativo/DetalleServicio';
import ReporteClientes from './pages/operativo/ReporteClientes';
import ReporteTecnicos from './pages/operativo/ReporteTecnicos';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {currentUser?.isFirstLogin && <ChangePasswordModal />}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Gerencial - Maintenance */}
          <Route path="gerencial/servicios" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><CatalogoServicios /></ProtectedRoute>} />
          <Route path="gerencial/categorias" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><Categorias /></ProtectedRoute>} />
          <Route path="gerencial/prioridades" element={<ProtectedRoute allowedRoles={['administrador']}><GestionPrioridades /></ProtectedRoute>} />
          <Route path="gerencial/tecnicos" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><CatalogoTecnicos /></ProtectedRoute>} />
          <Route path="gerencial/plantillas" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor', 'tecnico']}><CatalogoPlantillas /></ProtectedRoute>} />

          {/* Gerencial - Queries */}
          <Route path="gerencial/estado-tickets" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><EstadoTickets /></ProtectedRoute>} />
          <Route path="gerencial/kpis" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><KPIs /></ProtectedRoute>} />
          <Route path="gerencial/graficos" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><Graficos /></ProtectedRoute>} />
          <Route path="gerencial/sla" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><SLA /></ProtectedRoute>} />
          <Route path="gerencial/alertas" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><Alertas /></ProtectedRoute>} />

          {/* Operativo - Data Entry */}
          <Route path="operativo/registro-usuario" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><RegistroUsuario /></ProtectedRoute>} />
          <Route path="operativo/generacion-orden" element={<ProtectedRoute allowedRoles={['solicitante', 'tecnico', 'supervisor', 'administrador']}><GeneracionOrden /></ProtectedRoute>} />
          <Route path="operativo/escalamiento" element={<ProtectedRoute allowedRoles={['tecnico']}><SolicitudEscalamiento /></ProtectedRoute>} />

          {/* Operativo - Reports */}
          <Route path="operativo/consulta-cliente" element={<ProtectedRoute allowedRoles={['solicitante']}><EstadoConsultaCliente /></ProtectedRoute>} />
          <Route path="operativo/detalle-servicio/:ticketId" element={<ProtectedRoute><DetalleServicio /></ProtectedRoute>} />
          <Route path="operativo/reporte-clientes" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><ReporteClientes /></ProtectedRoute>} />
          <Route path="operativo/reporte-tecnicos" element={<ProtectedRoute allowedRoles={['administrador', 'supervisor']}><ReporteTecnicos /></ProtectedRoute>} />

          <Route index element={<ProtectedRoute><EstadoConsultaCliente /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
