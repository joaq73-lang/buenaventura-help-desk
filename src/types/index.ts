// User and Authentication Types
export type UserRole = 'solicitante' | 'tecnico' | 'supervisor' | 'administrador';

export interface User {
  id: string;
  employeeCode: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  isFirstLogin: boolean;
  miningUnit?: string;
  technicianLevel?: 'N1' | 'N2' | 'N3';
  specialty?: string;
  isActive: boolean;
  createdAt: Date;
}

// Service and Category Types
export interface Service {
  id: string;
  name: string;
  description: string;
  categories: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  applicableServices: string[];
  isActive: boolean;
  createdAt: Date;
}

// Priority Types
export type PriorityLevel = 'muy_baja' | 'baja' | 'media' | 'alta' | 'critica';
export type SlaAction = 'escalar' | 'alertar' | 'ambos';

export interface Priority {
  id: string;
  name: string;
  level: PriorityLevel;
  responseHours: number;
  resolutionHours: number;
  actionOnBreach: SlaAction;
  color: string;
}

// Technician Types
export type TechnicianStatus = 'disponible' | 'ocupado' | 'inactivo';

export interface Technician {
  id: string;
  userId: string;
  name: string;
  level: 'N1' | 'N2' | 'N3';
  specialty: string;
  currentLoad: number;
  status: TechnicianStatus;
  maxTickets: number;
  isActive: boolean;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  content: string;
  categoryId?: string;
  isActive: boolean;
}

// Ticket Types
export type TicketStatus = 'nuevo' | 'asignado' | 'en_proceso' | 'pendiente' | 'resuelto' | 'cerrado' | 'reabierto';

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  serviceId: string;
  categoryId: string;
  priority: PriorityLevel;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  technicianId?: string;
  technicianName?: string;
  miningUnit: string;
  affectsProduction: boolean;
  affectsSafety: boolean;
  slaResponseDue: Date;
  slaResolutionDue: Date;
  slaResponseMet?: boolean;
  slaResolutionMet?: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  satisfactionRating?: number;
  satisfactionComment?: string;
  attachments: string[];
}

// Ticket History/Timeline
export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Alert Types
export type AlertType = 'sla_vencido' | 'ticket_critico' | 'ticket_sin_asignar' | 'escalamiento_pendiente';

export interface Alert {
  id: string;
  type: AlertType;
  ticketId?: string;
  ticketCode?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Escalation Types
export type EscalationLevel = 'N2' | 'N3' | 'proveedor_externo';

export interface Escalation {
  id: string;
  ticketId: string;
  fromLevel: 'N1' | 'N2' | 'N3';
  toLevel: EscalationLevel;
  reason: string;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  createdAt: Date;
}

// KPI Types
export interface KPIData {
  averageResolutionTime: number;
  slaComplianceRate: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  criticalTickets: number;
  averageSatisfaction: number;
}

// Report Types
export interface ClientReport {
  userId: string;
  userName: string;
  miningUnit: string;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  reopenedTickets: number;
  averageSatisfaction: number;
}

export interface TechnicianReport {
  technicianId: string;
  technicianName: string;
  level: string;
  totalAssigned: number;
  resolved: number;
  open: number;
  slaCompliance: number;
  averageResolutionTime: number;
  averageSatisfaction: number;
}

// Mining Unit
export interface MiningUnit {
  id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
}

// Filter Types
export interface TicketFilters {
  status?: TicketStatus;
  priority?: PriorityLevel;
  technicianId?: string;
  miningUnit?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}
