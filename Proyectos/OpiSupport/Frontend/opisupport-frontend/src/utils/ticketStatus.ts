import type { TicketStatus } from '../types';

/**
 * Transiciones permitidas por estado.
 *
 * IMPORTANTE: esta tabla debe coincidir con
 * Backend/OpiSupport.Domain/Shared/TicketStatusTransitions.cs.
 * Si cambia una, hay que cambiar la otra.
 */
export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    'Abierto': ['En Proceso'],
    'Asignado': ['En Proceso'],
    'En Proceso': ['Resuelto'],
    'Resuelto': ['Cerrado', 'Reabierto'],
    'Reabierto': ['En Proceso'],
    'Cerrado': ['Reabierto'],
};

/** Estados a los que se puede pasar desde el estado actual. */
export const getAvailableTransitions = (status: TicketStatus): TicketStatus[] =>
    STATUS_TRANSITIONS[status] ?? [];

interface StatusAction {
    label: string;
    className: string;
}

/** Texto y color de cada botón de cambio de estado. */
export const STATUS_ACTIONS: Record<string, StatusAction> = {
    'En Proceso': { label: 'En Proceso', className: 'bg-yellow-500 hover:bg-yellow-600' },
    'Resuelto': { label: 'Resolver', className: 'bg-green-500 hover:bg-green-600' },
    'Cerrado': { label: 'Cerrar', className: 'bg-gray-500 hover:bg-gray-600' },
    'Reabierto': { label: 'Reabrir', className: 'bg-blue-500 hover:bg-blue-600' },
};
