import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, Ticket, Service, Category, Technician, Template, Alert, Priority, TicketHistory, MiningUnit } from '../types';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  services: Service[];
  categories: Category[];
  priorities: Priority[];
  technicians: Technician[];
  templates: Template[];
  tickets: Ticket[];
  ticketHistory: TicketHistory[];
  alerts: Alert[];
  miningUnits: MiningUnit[];
}

interface AppContextType extends AppState {
  login: (employeeCode: string, username: string, password: string) => { success: boolean; isFirstLogin: boolean; error?: string };
  logout: () => void;
  changePassword: (newPassword: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updatePriority: (id: string, updates: Partial<Priority>) => void;
  addTechnician: (technician: Technician) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addTicketHistory: (history: TicketHistory) => void;
  resolveTicket: (ticketId: string, rating?: number, comment?: string) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  reassignTechnicianTickets: (technicianId: string) => void;
}

const initialPriorities: Priority[] = [
  { id: '1', name: 'Muy Baja', level: 'muy_baja', responseHours: 48, resolutionHours: 120, actionOnBreach: 'alertar', color: '#6B7280' },
  { id: '2', name: 'Baja', level: 'baja', responseHours: 24, resolutionHours: 72, actionOnBreach: 'alertar', color: '#3B82F6' },
  { id: '3', name: 'Media', level: 'media', responseHours: 8, resolutionHours: 48, actionOnBreach: 'ambos', color: '#F59E0B' },
  { id: '4', name: 'Alta', level: 'alta', responseHours: 4, resolutionHours: 24, actionOnBreach: 'ambos', color: '#F97316' },
  { id: '5', name: 'Crítica', level: 'critica', responseHours: 1, resolutionHours: 8, actionOnBreach: 'escalar', color: '#EF4444' },
];

const initialMiningUnits: MiningUnit[] = [
  { id: '1', name: 'Unidad Minera Uchucchacua', code: 'UCH', location: 'Lima', isActive: true },
  { id: '2', name: 'Unidad Minera Orcopampa', code: 'ORC', location: 'Arequipa', isActive: true },
  { id: '3', name: 'Unidad Minera Julcani', code: 'JUL', location: 'Huancavelica', isActive: true },
  { id: '4', name: 'Unidad Minera El Brocal', code: 'BRO', location: 'Pasco', isActive: true },
  { id: '5', name: 'Unidad Minera San Cristóbal', code: 'SCR', location: 'Ayacucho', isActive: true },
];

const initialCategories: Category[] = [
  { id: '1', name: 'Hardware', description: 'Problemas de hardware y equipos físicos', applicableServices: ['1', '2', '3'], isActive: true, createdAt: new Date() },
  { id: '2', name: 'Software', description: 'Problemas de software y aplicaciones', applicableServices: ['1', '2', '4'], isActive: true, createdAt: new Date() },
  { id: '3', name: 'Redes', description: 'Problemas de conectividad y redes', applicableServices: ['1', '3', '5'], isActive: true, createdAt: new Date() },
  { id: '4', name: 'Aplicaciones Mineras', description: 'Sistemas específicos de operación minera', applicableServices: ['4', '5', '6'], isActive: true, createdAt: new Date() },
];

const initialServices: Service[] = [
  { id: '1', name: 'Soporte Técnico', description: 'Asistencia técnica general para equipos y sistemas', categories: ['1', '2', '3'], isActive: true, createdAt: new Date() },
  { id: '2', name: 'Mantenimiento Preventivo', description: 'Mantenimiento programado de equipos', categories: ['1', '2', '4'], isActive: true, createdAt: new Date() },
  { id: '3', name: 'Instalación de Software', description: 'Instalación y configuración de software', categories: ['2', '3'], isActive: true, createdAt: new Date() },
  { id: '4', name: 'Sistema de Gestión Minera', description: 'Soporte para sistemas SIG y geológicos', categories: ['4', '2'], isActive: true, createdAt: new Date() },
  { id: '5', name: 'Control de Producción', description: 'Sistemas de monitoreo y control de producción', categories: ['4', '3'], isActive: true, createdAt: new Date() },
  { id: '6', name: 'Seguridad Operativa', description: 'Sistemas de seguridad y vigilancia', categories: ['4', '3', '1'], isActive: true, createdAt: new Date() },
];

const initialUsers: User[] = [
  { id: '1', employeeCode: 'EMP001', username: 'admin', name: 'Carlos Administrador', email: 'admin@buenaventura.com', role: 'administrador', isFirstLogin: false, miningUnit: 'UCH', isActive: true, createdAt: new Date() },
  { id: '2', employeeCode: 'EMP002', username: 'supervisor', name: 'María Supervisora', email: 'supervisor@buenaventura.com', role: 'supervisor', isFirstLogin: false, miningUnit: 'UCH', isActive: true, createdAt: new Date() },
  { id: '3', employeeCode: 'EMP003', username: 'tecnico1', name: 'Juan Técnico N2', email: 'tecnico1@buenaventura.com', role: 'tecnico', isFirstLogin: false, miningUnit: 'UCH', technicianLevel: 'N2', specialty: 'Hardware/Redes', isActive: true, createdAt: new Date() },
  { id: '4', employeeCode: 'EMP004', username: 'tecnico2', name: 'Pedro Técnico N3', email: 'tecnico2@buenaventura.com', role: 'tecnico', isFirstLogin: false, miningUnit: 'ORC', technicianLevel: 'N3', specialty: 'Aplicaciones Mineras', isActive: true, createdAt: new Date() },
  { id: '5', employeeCode: 'EMP005', username: 'solicitante', name: 'Ana Solicitante', email: 'solicitante@buenaventura.com', role: 'solicitante', isFirstLogin: false, miningUnit: 'UCH', isActive: true, createdAt: new Date() },
  { id: '6', employeeCode: 'EMP006', username: 'nuevousuario', name: 'Luis Nuevo', email: 'nuevo@buenaventura.com', role: 'solicitante', isFirstLogin: true, miningUnit: 'JUL', isActive: true, createdAt: new Date() },
];

const initialTechnicians: Technician[] = [
  { id: '1', userId: '3', name: 'Juan Técnico N2', level: 'N2', specialty: 'Hardware/Redes', currentLoad: 3, status: 'ocupado', maxTickets: 10, isActive: true },
  { id: '2', userId: '4', name: 'Pedro Técnico N3', level: 'N3', specialty: 'Aplicaciones Mineras', currentLoad: 5, status: 'ocupado', maxTickets: 8, isActive: true },
  { id: '3', userId: '7', name: 'Rosa Técnico N1', level: 'N1', specialty: 'Soporte General', currentLoad: 2, status: 'disponible', maxTickets: 15, isActive: true },
];

const initialTemplates: Template[] = [
  { id: '1', name: 'Respuesta Inicial', content: 'Hemos recibido su solicitud y estamos trabajando en ello.', categoryId: undefined, isActive: true },
  { id: '2', name: 'Escalamiento', content: 'Su ticket ha sido escalado a un nivel superior para mejor atención.', categoryId: undefined, isActive: true },
  { id: '3', name: 'Hardware - Mantenimiento', content: 'Se requiere mantenimiento físico del equipo. Se programará visita técnica.', categoryId: '1', isActive: true },
  { id: '4', name: 'Software - Instalación', content: 'Se procederá a instalar el software solicitado en horario programado.', categoryId: '2', isActive: true },
];

function generateTicketCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `TKT-${year}-${random}`;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    users: initialUsers,
    services: initialServices,
    categories: initialCategories,
    priorities: initialPriorities,
    technicians: initialTechnicians,
    templates: initialTemplates,
    tickets: [],
    ticketHistory: [],
    alerts: [],
    miningUnits: initialMiningUnits,
  });

  const login = useCallback((employeeCode: string, username: string, password: string) => {
    const user = state.users.find(
      u => u.employeeCode === employeeCode && u.username === username && u.isActive
    );

    if (!user) {
      return { success: false, isFirstLogin: false, error: 'Credenciales inválidas' };
    }

    // Simulate password check (in real app, this would be validated against hash)
    if (password.length < 4) {
      return { success: false, isFirstLogin: false, error: 'Contraseña incorrecta' };
    }

    setState(prev => ({
      ...prev,
      currentUser: user,
      isAuthenticated: true,
    }));

    return { success: true, isFirstLogin: user.isFirstLogin };
  }, [state.users]);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      isAuthenticated: false,
    }));
  }, []);

  const changePassword = useCallback((_newPassword: string) => {
    if (state.currentUser) {
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, isFirstLogin: false } : null,
        users: prev.users.map(u =>
          u.id === prev.currentUser?.id ? { ...u, isFirstLogin: false } : u
        ),
      }));
    }
  }, [state.currentUser]);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, ...updates } : null,
    }));
  }, []);

  const addService = useCallback((service: Service) => {
    setState(prev => ({ ...prev, services: [...prev.services, service] }));
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteService = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, isActive: false } : s),
    }));
  }, []);

  const addCategory = useCallback((category: Category) => {
    setState(prev => ({ ...prev, categories: [...prev.categories, category] }));
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, isActive: false } : c),
    }));
  }, []);

  const updatePriority = useCallback((id: string, updates: Partial<Priority>) => {
    setState(prev => ({
      ...prev,
      priorities: prev.priorities.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const addTechnician = useCallback((technician: Technician) => {
    setState(prev => ({ ...prev, technicians: [...prev.technicians, technician] }));
  }, []);

  const updateTechnician = useCallback((id: string, updates: Partial<Technician>) => {
    setState(prev => ({
      ...prev,
      technicians: prev.technicians.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTechnician = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      technicians: prev.technicians.map(t => t.id === id ? { ...t, isActive: false } : t),
    }));
  }, []);

  const addTemplate = useCallback((template: Template) => {
    setState(prev => ({ ...prev, templates: [...prev.templates, template] }));
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === id ? { ...t, isActive: false } : t),
    }));
  }, []);

  const addTicket = useCallback((ticket: Ticket) => {
    setState(prev => ({ ...prev, tickets: [...prev.tickets, ticket] }));

    // Generate alert if critical
    if (ticket.priority === 'critica') {
      const alert: Alert = {
        id: Date.now().toString(),
        type: 'ticket_critico',
        ticketId: ticket.id,
        ticketCode: ticket.code,
        message: `Ticket Crítico creado: ${ticket.code} - ${ticket.title}`,
        isRead: false,
        createdAt: new Date(),
      };
      setState(prev => ({ ...prev, alerts: [alert, ...prev.alerts] }));
    }
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const addTicketHistory = useCallback((history: TicketHistory) => {
    setState(prev => ({ ...prev, ticketHistory: [...prev.ticketHistory, history] }));
  }, []);

  const resolveTicket = useCallback((ticketId: string, rating?: number, comment?: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'cerrado' as const,
              closedAt: new Date(),
              satisfactionRating: rating,
              satisfactionComment: comment,
            }
          : t
      ),
    }));
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setState(prev => ({ ...prev, alerts: [alert, ...prev.alerts] }));
  }, []);

  const markAlertAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, isRead: true } : a),
    }));
  }, []);

  const addUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u),
    }));
  }, []);

  const reassignTechnicianTickets = useCallback((technicianId: string) => {
    const availableTechs = state.technicians.filter(
      t => t.id !== technicianId && t.isActive && t.status === 'disponible'
    );

    if (availableTechs.length > 0) {
      const ticketsToReassign = state.tickets.filter(
        t => t.technicianId === technicianId && (t.status === 'asignado' || t.status === 'en_proceso')
      );

      ticketsToReassign.forEach((ticket, index) => {
        const newTech = availableTechs[index % availableTechs.length];
        updateTicket(ticket.id, {
          technicianId: newTech.id,
          technicianName: newTech.name,
          status: 'asignado',
        });
      });
    }
  }, [state.technicians, state.tickets, updateTicket]);

  const value: AppContextType = {
    ...state,
    login,
    logout,
    changePassword,
    updateCurrentUser,
    addService,
    updateService,
    deleteService,
    addCategory,
    updateCategory,
    deleteCategory,
    updatePriority,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addTicket,
    updateTicket,
    addTicketHistory,
    resolveTicket,
    addAlert,
    markAlertAsRead,
    addUser,
    updateUser,
    reassignTechnicianTickets,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { generateTicketCode };
