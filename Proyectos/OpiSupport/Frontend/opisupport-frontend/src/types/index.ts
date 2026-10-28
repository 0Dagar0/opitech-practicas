// ========== TIPOS BÁSICOS (union types) ==========
export type Role = 'Colaborador' | 'Tecnico' | 'Supervisor' | 'Sistema';
export type TicketStatus = 'Abierto' | 'Asignado' | 'En Proceso' | 'Resuelto' | 'Cerrado' | 'Reabierto';
export type TicketPriority = 'Crítica' | 'Alta' | 'Media' | 'Baja';

// ========== MODELOS DE RESPUESTA ==========

// Usuario (login)
export interface User {
    id: number;
    fullName: string;
    role: Role;
}

// Respuesta de login
export interface LoginResponse {
    token: string;
    userId: number;
    fullName: string;
    role: Role;
}
// Categoría y Área
export interface Category {
    id: number;
    name: string;
}

export interface Area {
    id: number;
    name: string;
}

// Técnico con especialidades (respuesta de GET /api/users/technicians)
export interface Technician {
  id: number;
  fullName: string;
  specialties: number[]; // Array de IDs de categorías
}

// Ticket en listado (TicketListDto)
export interface TicketListItem {
    id: number;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    area: string;
    createdAt: string; // ISO string
    assignedToFullName: string | null;
    createdByFullName: string;
    isOverdue: boolean;
}

// Comentario
export interface Comment {
    id: number;
    author: string;
    text: string;
    createdAt: string;
}

// Historial de estado
export interface StatusHistoryEntry {
    date: string;
    previousStatus: TicketStatus | null;
    newStatus: TicketStatus;
    note?: string | null; // Evento que no es un cambio de estado (ej. reasignación)
    user: string;
}

// Ticket detalle (TicketDetailDto)
export interface TicketDetail {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    area: string;
    createdAt: string;
    resolvedAt: string | null;
    slaDeadline: string;
    assignedToFullName: string | null;
    assignedToId?: number | null; // <--- NUEVO CAMPO
    createdByFullName: string;
    isOverdue: boolean;
    reopenCount: number;
    comments: Comment[];
    history: StatusHistoryEntry[];
}

// Crear ticket (request)
export interface CreateTicketRequest {
    title: string;
    description: string;
    categoryId: number;
    areaId: number;
    priority: TicketPriority;
}

// Cambiar estado (request)
export interface ChangeStatusRequest {
    newStatus: TicketStatus;
    comment?: string; // obligatorio si newStatus es 'Resuelto'
}

// Reasignar (request)
export interface AssignTicketRequest {
    technicianId: number;
}

// Listado paginado
export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

// Reporte SLA
export interface TechnicianReport {
    technicianId: number;
    technicianName: string;
    totalResolved: number;
    compliant: number;
    nonCompliant: number;
    compliancePercentage: number;
}

export interface CategoryReport {
    categoryId: number;
    categoryName: string;
    totalResolved: number;
    compliant: number;
    nonCompliant: number;
    compliancePercentage: number;
}

export interface SlaReport {
    globalCompliancePercentage: number;
    technicians: TechnicianReport[];
    categories: CategoryReport[];
}

// ========== ALERTAS ==========
export interface Alert {
    id: number;
    ticketId: number;
    message: string;
    createdAt: string;
    ticketTitle: string;
}

// ========== USUARIOS (Gestión) ==========

// Parámetros para listar usuarios (GET /api/users)
export interface UserListParams {
    role?: 'Colaborador' | 'Tecnico' | 'Supervisor' | 'Sistema';
    isActive?: boolean;
    search?: string;
}

/**
 * Respuesta del backend al crear/obtener un usuario
 */
export interface UserResponse {
    id: number;
    fullName: string;
    employeeCode: string;
    email: string | null;
    role: 'Colaborador' | 'Tecnico' | 'Supervisor' | 'Sistema';
    isActive: boolean;
    createdAt: string;
}


/**
 * Solicitud para crear un nuevo usuario
 */
export interface UserCreateRequest {
    fullName: string;
    employeeCode: string;
    email?: string;
    password: string;
    role: 'Colaborador' | 'Tecnico' | 'Supervisor';
}

/**
 * Extender Technician para incluir campos adicionales (employeeCode, email)
 */
export interface Technician {
    id: number;
    fullName: string;
    employeeCode?: string; // opcional porque algunos pueden no tenerlo
    email?: string; // opcional
}

// USUARIOS (Gestión) 

// Request para crear usuario (ahora con specialtyCategoryIds)
export interface UserCreateRequest {
  fullName: string;
  employeeCode: string;
  email?: string;
  password: string;
  role: 'Colaborador' | 'Tecnico' | 'Supervisor';
  specialtyCategoryIds?: number[]; // Solo para rol 'Tecnico'
}

// Usuario (respuesta del listado y creación)
export interface UserResponse {
  id: number;
  fullName: string;
  employeeCode: string;
  email: string | null;
  role: 'Colaborador' | 'Tecnico' | 'Supervisor' | 'Sistema';
  isActive: boolean;
  createdAt: string;
  specialties?: number[]; // Solo para técnicos
}