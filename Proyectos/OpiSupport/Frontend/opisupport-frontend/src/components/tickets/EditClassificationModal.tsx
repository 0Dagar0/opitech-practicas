// src/components/tickets/EditClassificationModal.tsx
import { useEffect, useState } from 'react';
import { getCategories } from '../../api/masters';
import { updateTicketClassification } from '../../api/tickets';
import type { Category, TicketPriority } from '../../types';

interface EditClassificationModalProps {
    isOpen: boolean;
    ticketId: number;
    ticketTitle: string;
    currentCategoryId: number;
    currentCategoryName: string;
    currentPriority: TicketPriority;
    /** Fecha de creación del ticket: el SLA se cuenta desde aquí. */
    createdAt: string;
    onClose: () => void;
    onUpdated: () => void;
}

/** Horas de SLA por prioridad (las mismas que usa el backend). */
const SLA_HOURS: Record<TicketPriority, number> = {
    'Crítica': 2,
    'Alta': 4,
    'Media': 8,
    'Baja': 24,
};

const PRIORITIES: TicketPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

/** Color de cada botón de prioridad, igual que en el detalle del ticket. */
const PRIORITY_STYLES: Record<TicketPriority, string> = {
    'Baja': 'data-[active=true]:text-blue-700',
    'Media': 'data-[active=true]:text-yellow-700',
    'Alta': 'data-[active=true]:text-orange-700',
    'Crítica': 'data-[active=true]:text-red-700',
};

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 300;

const formatDateTime = (value: string | Date) =>
    new Date(value).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

/**
 * Modal exclusivo del perfil Sistema (SYS) para corregir la categoría y la
 * prioridad de un ticket. El backend vuelve a validar el rol y el motivo.
 */
const EditClassificationModal = ({
    isOpen,
    ticketId,
    ticketTitle,
    currentCategoryId,
    currentCategoryName,
    currentPriority,
    createdAt,
    onClose,
    onUpdated,
}: EditClassificationModalProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState(currentCategoryId);
    const [priority, setPriority] = useState<TicketPriority>(currentPriority);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reiniciar el formulario cada vez que se abre
    useEffect(() => {
        if (!isOpen) return;

        setCategoryId(currentCategoryId);
        setPriority(currentPriority);
        setReason('');
        setError(null);

        const loadCategories = async () => {
            setLoadingCategories(true);
            try {
                setCategories(await getCategories());
            } catch (err) {
                console.error('Error al cargar categorías:', err);
                setError('No se pudieron cargar las categorías.');
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [isOpen, currentCategoryId, currentPriority]);

    if (!isOpen) return null;

    const selectedCategory = categories.find((category) => category.id === categoryId);
    const newCategoryName = selectedCategory?.name ?? currentCategoryName;

    const categoryChanged = categoryId !== currentCategoryId;
    const priorityChanged = priority !== currentPriority;
    const hasChanges = categoryChanged || priorityChanged;

    // Vista previa del nuevo SLA: se cuenta desde la creación del ticket
    const newDeadline = new Date(
        new Date(createdAt).getTime() + SLA_HOURS[priority] * 60 * 60 * 1000
    );

    const trimmedReason = reason.trim();
    const reasonIsValid = trimmedReason.length >= MIN_REASON_LENGTH;
    const canSubmit = hasChanges && reasonIsValid && !loading && !loadingCategories;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError(null);
        try {
            await updateTicketClassification(ticketId, {
                categoryId,
                priority,
                reason: trimmedReason,
            });
            onUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar la clasificación:', err);
            setError(err.response?.data?.message || 'Error al actualizar la clasificación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="classification-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
                {/* Encabezado */}
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="classification-title" className="text-xl font-bold text-brand-primary">
                            Editar clasificación
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Ticket #{ticketId} · «{ticketTitle}»
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="h-8 w-8 rounded-md text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Categoría y prioridad */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Categoría
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                                disabled={loadingCategories}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-brand-secondary disabled:bg-gray-100"
                            >
                                {loadingCategories && <option>Cargando...</option>}
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Prioridad
                            </label>
                            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                                {PRIORITIES.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        data-active={priority === option}
                                        onClick={() => setPriority(option)}
                                        className={`flex-1 rounded-md px-1 py-1.5 text-xs font-semibold text-gray-500 transition-colors data-[active=true]:bg-white data-[active=true]:shadow ${PRIORITY_STYLES[option]}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Resumen antes → después */}
                    {hasChanges && (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                Resumen del cambio
                            </p>

                            {categoryChanged && (
                                <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="w-20 text-gray-500">Categoría</span>
                                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500 line-through">
                                        {currentCategoryName}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                                        {newCategoryName}
                                    </span>
                                </div>
                            )}

                            {priorityChanged && (
                                <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="w-20 text-gray-500">Prioridad</span>
                                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500 line-through">
                                        {currentPriority}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                                        {priority}
                                    </span>
                                </div>
                            )}

                            {priorityChanged && (
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="w-20 text-gray-500">Nuevo SLA</span>
                                    <span className="font-semibold text-gray-800">
                                        {formatDateTime(newDeadline)} ({SLA_HOURS[priority]} h)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aviso de consecuencia */}
                    {categoryChanged && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-secondary text-xs font-extrabold text-gray-900">
                                !
                            </span>
                            <p className="text-sm text-amber-800">
                                Se reasignará automáticamente a un técnico con la especialidad{' '}
                                <strong>{newCategoryName}</strong>. Si no hay ninguno disponible, el
                                ticket quedará <strong>sin asignar</strong>.
                            </p>
                        </div>
                    )}

                    {/* Motivo obligatorio */}
                    <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                            Motivo del cambio <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={MAX_REASON_LENGTH}
                            placeholder="Ej.: el usuario reportó la categoría equivocada; el problema es del sistema, no del equipo."
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-brand-secondary"
                        />
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>Quedará resaltado en el historial del ticket.</span>
                            <span>
                                {reason.length}/{MAX_REASON_LENGTH}
                            </span>
                        </div>
                        {!reasonIsValid && reason.length > 0 && (
                            <p className="mt-1 text-xs text-red-600">
                                El motivo debe tener al menos {MIN_REASON_LENGTH} caracteres.
                            </p>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassificationModal;
