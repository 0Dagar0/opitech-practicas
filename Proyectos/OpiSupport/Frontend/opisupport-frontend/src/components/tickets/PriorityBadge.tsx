// src/components/tickets/PriorityBadge.tsx
import { getPriorityStyle } from '../../utils/ticketPriority';

interface PriorityBadgeProps {
    priority: string;
}

/**
 * Muestra la prioridad del ticket como un badge sutil:
 * punto de color + texto, con un anillo suave del mismo tono.
 * El color comunica la urgencia sin competir con el badge de estado.
 */
const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
    const style = getPriorityStyle(priority);

    return (
        <span
            title={style.label}
            aria-label={style.label}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
            {priority}
        </span>
    );
};

export default PriorityBadge;
