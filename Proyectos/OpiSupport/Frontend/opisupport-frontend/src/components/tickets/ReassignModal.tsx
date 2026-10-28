
import { useState, useEffect } from 'react';
import { getTechnicians } from '../../api/users';
import { assignTicket } from '../../api/tickets';
import type { Technician } from '../../types';

interface ReassignModalProps {
    isOpen: boolean;
    ticketId: number;
    currentTechnicianId?: number | null;
    onClose: () => void;
    onReassigned: () => void;
}

const ReassignModal = ({
    isOpen,
    ticketId,
    currentTechnicianId,
    onClose,
    onReassigned,
}: ReassignModalProps) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar técnicos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const loadTechnicians = async () => {
                try {
                    const data = await getTechnicians();
                    setTechnicians(data);
                    // Seleccionar el técnico actual si existe
                    if (currentTechnicianId) {
                        setSelectedTechnicianId(currentTechnicianId);
                    }
                } catch (err) {
                    console.error('Error al cargar técnicos:', err);
                    setError('No se pudieron cargar los técnicos.');
                }
            };
            loadTechnicians();
        }
    }, [isOpen, currentTechnicianId]);

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
                <p className="text-sm text-gray-600 mb-4">
                    Ticket #{ticketId} - Asignar a otro técnico
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Seleccionar técnico</label>
                        <select
                            value={selectedTechnicianId}
                            onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : '')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            required
                        >
                            <option value="">Selecciona un técnico...</option>
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
                            disabled={loading || !selectedTechnicianId}
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