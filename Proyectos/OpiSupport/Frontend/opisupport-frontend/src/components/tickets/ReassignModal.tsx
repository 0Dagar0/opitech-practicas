
import { useState, useEffect } from 'react';
import { getTechnicians } from '../../api/users';
import { assignTicket } from '../../api/tickets';
import type { Technician } from '../../types';

interface ReassignModalProps {
    isOpen: boolean;
    ticketId: number;
    /** Categoría del ticket: solo se pueden elegir técnicos con esta especialidad. */
    categoryId: number;
    categoryName?: string;
    currentTechnicianId?: number | null;
    onClose: () => void;
    onReassigned: () => void;
}

const ReassignModal = ({
    isOpen,
    ticketId,
    categoryId,
    categoryName,
    currentTechnicianId,
    onClose,
    onReassigned,
}: ReassignModalProps) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar técnicos al abrir el modal.
    // Se listan únicamente los técnicos activos con la especialidad del ticket,
    // para que no se pueda reasignar a alguien que no puede atenderlo.
    useEffect(() => {
        if (!isOpen) return;

        setError(null);
        setSelectedTechnicianId(currentTechnicianId ?? '');

        const loadTechnicians = async () => {
            setLoadingTechnicians(true);
            try {
                const data = await getTechnicians();
                const matching = data.filter((tech) =>
                    (tech.specialties ?? []).includes(categoryId)
                );
                setTechnicians(matching);

                // Si el técnico actual no tiene la especialidad, no se deja seleccionado
                if (currentTechnicianId && !matching.some((tech) => tech.id === currentTechnicianId)) {
                    setSelectedTechnicianId('');
                }
            } catch (err) {
                console.error('Error al cargar técnicos:', err);
                setError('No se pudieron cargar los técnicos.');
            } finally {
                setLoadingTechnicians(false);
            }
        };

        loadTechnicians();
    }, [isOpen, currentTechnicianId, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTechnicianId) {
            setError('Selecciona un técnico.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await assignTicket(ticketId, Number(selectedTechnicianId));
            onReassigned();
            onClose();
        } catch (err: any) {
            console.error('Error al reasignar ticket:', err);
            const status = err.response?.status;
            const backendMessage = err.response?.data?.message;

            // Mostrar la causa real en vez de un texto genérico
            if (backendMessage) {
                setError(backendMessage);
            } else if (status === 403) {
                setError('Solo un supervisor puede reasignar tickets.');
            } else if (status === 404) {
                setError('No se encontró el ticket o la ruta de reasignación.');
            } else if (status) {
                setError(`Error al reasignar el ticket (HTTP ${status}).`);
            } else {
                setError('Error al reasignar el ticket: no se pudo conectar con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Reasignar Ticket</h2>
                <p className="text-sm text-gray-600 mb-1">
                    Ticket #{ticketId} - Asignar a otro técnico
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Solo se muestran técnicos con la especialidad:{' '}
                    <span className="font-medium text-gray-700">{categoryName || 'la del ticket'}</span>
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {!loadingTechnicians && technicians.length === 0 && !error && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md mb-4 text-sm">
                        No hay técnicos activos con esta especialidad. Asigna la especialidad desde
                        «Administrar Usuarios» o crea un técnico para esta categoría.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Seleccionar técnico</label>
                        <select
                            value={selectedTechnicianId}
                            onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : '')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary disabled:bg-gray-100"
                            required
                            disabled={loadingTechnicians || technicians.length === 0}
                        >
                            <option value="">
                                {loadingTechnicians ? 'Cargando técnicos...' : 'Selecciona un técnico...'}
                            </option>
                            {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.fullName} {currentTechnicianId === tech.id ? '(Actual)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || loadingTechnicians || !selectedTechnicianId}
                            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Reasignando...' : 'Reasignar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReassignModal;