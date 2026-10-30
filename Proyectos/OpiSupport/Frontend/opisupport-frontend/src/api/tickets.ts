
import apiClient from './client';
import type {
    CreateTicketRequest,
    TicketDetail,
    TicketListItem,
    TicketPriority,
    PaginatedResponse
} from '../types';

/**
 * Obtiene la lista de tickets con filtros y paginación
 */
export const getTickets = async (params?: {
    status?: string;
    priority?: string;
    technicianId?: number;
    onlyOverdue?: boolean;
    /** Solo tickets sin técnico asignado (Supervisor y Sistema). */
    unassigned?: boolean;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<TicketListItem>> => {
    const response = await apiClient.get<PaginatedResponse<TicketListItem>>('/tickets', {
        params,
    });
    return response.data;
};

/**
 * Obtiene el detalle de un ticket por ID
 */
export const getTicketDetail = async (id: number): Promise<TicketDetail> => {
    const response = await apiClient.get<TicketDetail>(`/tickets/${id}`);
    return response.data;
};

/**
 * Crea un nuevo ticket
 */
export const createTicket = async (data: CreateTicketRequest): Promise<TicketDetail> => {
    const response = await apiClient.post<TicketDetail>('/tickets', data);
    return response.data;
};

/**
 * Cambia el estado de un ticket
 */
export const changeTicketStatus = async (
  id: number,
  newStatus: string,
  comment?: string
): Promise<TicketDetail> => {
  const body: any = { newStatus };
  if (comment) {
    body.comment = comment;
  }
  const response = await apiClient.put<TicketDetail>(`/tickets/${id}/status`, body);
  return response.data;
};

/**
 * Reasigna un ticket a otro técnico (solo Supervisor)
 */
export const assignTicket = async (id: number, technicianId: number): Promise<TicketDetail> => {
    const response = await apiClient.put<TicketDetail>(`/tickets/${id}/assign`, {
        technicianId,
    });
    return response.data;
};

/**
 * Agrega un comentario a un ticket
 */export const addComment = async (ticketId: number, text: string): Promise<any> => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, { text });
    console.log('📝 Comentario creado (respuesta):', response.data);
    return response.data;
};

/**
 * Cambia la categoría y/o la prioridad de un ticket.
 * Solo el perfil Sistema (SYS) tiene permiso en el backend.
 * El motivo es obligatorio y queda resaltado en el historial del ticket.
 */
export const updateTicketClassification = async (
    id: number,
    data: { categoryId: number; priority: TicketPriority; reason: string }
): Promise<TicketDetail> => {
    const response = await apiClient.put<TicketDetail>(`/tickets/${id}/classification`, data);
    return response.data;
};