import type { TicketPriority } from '../types';

/**
 * Estilos de prioridad para badges "suaves": fondo claro, texto oscuro y un
 * punto de color que refuerza la urgencia sin gritar visualmente.
 *
 * La escala va de frío a caliente:
 *   Baja (azul) → Media (ámbar) → Alta (naranja) → Crítica (rojo)
 */
export interface PriorityStyle {
    badge: string;
    dot: string;
    /** Texto para el atributo title (accesibilidad y tooltip). */
    label: string;
}

export const PRIORITY_STYLES: Record<TicketPriority, PriorityStyle> = {
    'Baja': {
        badge: 'bg-blue-50 text-blue-700 ring-blue-200',
        dot: 'bg-blue-500',
        label: 'Prioridad baja',
    },
    'Media': {
        badge: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500',
        label: 'Prioridad media',
    },
    'Alta': {
        badge: 'bg-orange-50 text-orange-700 ring-orange-200',
        dot: 'bg-orange-500',
        label: 'Prioridad alta',
    },
    'Crítica': {
        badge: 'bg-red-50 text-red-700 ring-red-200',
        dot: 'bg-red-600',
        label: 'Prioridad crítica',
    },
};

/** Estilo neutro para valores inesperados que lleguen del backend. */
const FALLBACK_STYLE: PriorityStyle = {
    badge: 'bg-gray-50 text-gray-700 ring-gray-200',
    dot: 'bg-gray-400',
    label: 'Prioridad sin definir',
};

export const getPriorityStyle = (priority: string): PriorityStyle =>
    PRIORITY_STYLES[priority as TicketPriority] ?? FALLBACK_STYLE;
