
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketDetail, changeTicketStatus, addComment } from '../api/tickets';
import { useAuth } from '../contexts/AuthContext';
import type { TicketDetail as TicketDetailType } from '../types';
import ReassignModal from '../components/tickets/ReassignModal';
import { getAvailableTransitions, STATUS_ACTIONS } from '../utils/ticketStatus';


const TicketDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { state } = useAuth();
    const userRole = state.user?.role;
    const navigate = useNavigate();

    const [ticket, setTicket] = useState<TicketDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);


    // Cargar ticket
    useEffect(() => {
        const loadTicket = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getTicketDetail(parseInt(id));
                console.log('📦 Ticket completo del backend:', data);
                console.log('💬 Comentarios:', data.comments);
                setTicket(data);
                setError(null);
            } catch (err: any) {
                console.error('Error al cargar ticket:', err);
                setError('Error al cargar el ticket');
            } finally {
                setLoading(false);
            }
        };
        loadTicket();
    }, [id]);

    // Cambiar estado
    const handleStatusChange = async (newStatus: string) => {
        if (!ticket) return;

        // Si el nuevo estado es "Resuelto", pedir comentario obligatorio
        let comment: string | undefined = undefined;
        if (newStatus === 'Resuelto') {
            const userComment = prompt('Ingresa un comentario de resolución (obligatorio):');
            if (!userComment || !userComment.trim()) {
                alert('El comentario es obligatorio para resolver el ticket.');
                return;
            }
            comment = userComment.trim();
        }

        setIsSubmitting(true);
        try {
            const ticketId = typeof ticket.id === 'number' ? ticket.id : parseInt(ticket.id);
            await changeTicketStatus(ticketId, newStatus, comment);

            // Recargar el ticket completo para obtener los comentarios actualizados
            const updatedTicket = await getTicketDetail(ticketId);
            setTicket(updatedTicket);

            alert(`Estado cambiado a: ${newStatus}`);
        } catch (err: any) {
            console.error('Error al cambiar estado:', err);
            alert(err.response?.data?.message || 'Error al cambiar el estado');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReassign = () => {
        setShowReassignModal(true);
    };

    // Enviar comentario
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !ticket) return;

        try {
            const ticketId = typeof ticket.id === 'number' ? ticket.id : parseInt(ticket.id);
            const newCommentData = await addComment(ticketId, newComment.trim());

            console.log('📝 Nuevo comentario recibido del backend:', newCommentData);

            // Agregar el comentario localmente
            const updatedComments = [...ticket.comments, newCommentData];

            setTicket({
                ...ticket,
                comments: updatedComments,
            });

            setNewComment('');
            alert('Comentario enviado correctamente');
        } catch (err: any) {
            console.error('Error al enviar comentario:', err);
            alert('Error al enviar el comentario');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calcular si el colaborador puede reabrir (dentro de 48h desde resolvedAt)
    const canReopen = () => {
        if (!ticket || !ticket.resolvedAt) return false;
        if (userRole !== 'Colaborador') return true; // Supervisor y Sistema siempre pueden
        const resolvedDate = new Date(ticket.resolvedAt).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - resolvedDate) / (1000 * 60 * 60);
        return hoursDiff <= 48;
    };


    if (loading) return <div className="p-6 text-center text-gray-500">Cargando ticket...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!ticket) return <div className="p-6 text-center text-gray-500">Ticket no encontrado</div>;
    // Normalizar roles para comparación (sin acentos)
    const normalizedRole = userRole?.toLowerCase();
    const isTechnician = normalizedRole === 'tecnico';
    const isSupervisor = normalizedRole === 'supervisor' || normalizedRole === 'sistema'; // <--- Sistema incluido
    const isColaborador = normalizedRole === 'colaborador';

    // Botones de estado generados desde la tabla de transiciones compartida.
    // Cada rol ve solo las transiciones que puede ejecutar:
    //   - Colaborador: únicamente reabrir, y solo dentro de las 48 h.
    //   - Técnico: todas menos reabrir.
    //   - Supervisor / Sistema: todas.
    const canUseTransition = (target: string) => {
        if (isColaborador) return target === 'Reabierto' && canReopen();
        if (isTechnician) return target !== 'Reabierto';
        return isSupervisor;
    };

    const availableActions = getAvailableTransitions(ticket.status)
        .filter(canUseTransition)
        .map((target) => ({
            status: target,
            label: STATUS_ACTIONS[target]?.label ?? target,
            className: STATUS_ACTIONS[target]?.className ?? 'bg-gray-500 hover:bg-gray-600',
        }));

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="mb-4 text-brand-primary hover:underline"
            >
                ← Volver al Dashboard
            </button>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
                    <p className="text-gray-600">{ticket.title}</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${ticket.status === 'Abierto' ? 'bg-red-100 text-red-800' : ''}
                        ${ticket.status === 'Asignado' ? 'bg-blue-100 text-blue-800' : ''}
                        ${ticket.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${ticket.status === 'Resuelto' ? 'bg-green-100 text-green-800' : ''}
                        ${ticket.status === 'Cerrado' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                        {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
                        ${ticket.priority === 'Crítica' ? 'bg-red-600 text-white' : ''}
                        ${ticket.priority === 'Alta' ? 'bg-orange-500 text-white' : ''}
                        ${ticket.priority === 'Media' ? 'bg-yellow-500 text-white' : ''}
                        ${ticket.priority === 'Baja' ? 'bg-blue-500 text-white' : ''}
                    `}>
                        {ticket.priority}
                    </span>
                </div>
            </div>

            {/* Botones de acción según estado y rol (generados desde la tabla de transiciones) */}
            <div className="flex flex-wrap gap-2 mb-6">
                {availableActions.map((action) => (
                    <button
                        key={action.status}
                        onClick={() => handleStatusChange(action.status)}
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${action.className}`}
                    >
                        {action.label}
                    </button>
                ))}

                {isSupervisor && (
                    <button
                        onClick={handleReassign}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                    >
                        Reasignar
                    </button>
                )}

                {isColaborador && !canReopen() && ticket.resolvedAt && (
                    <div className="text-sm text-gray-500 italic">
                        No puedes reabrir este ticket porque han pasado más de 48 horas desde su resolución.
                    </div>
                )}

            </div>

            {/* Información del ticket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <p><strong>Descripción:</strong></p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{ticket.description}</p>
                </div>
                <div className="space-y-2">
                    <p><strong>Detalles:</strong></p>
                    <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                        <p><span className="font-medium">Categoría:</span> {ticket.category}</p>
                        <p><span className="font-medium">Área:</span> {ticket.area}</p>
                        <p><span className="font-medium">Creado por:</span> {ticket.createdByFullName}</p>
                        <p><span className="font-medium">Asignado a:</span> {ticket.assignedToFullName || 'Sin asignar'}</p>
                        <p><span className="font-medium">Fecha creación:</span> {formatDate(ticket.createdAt)}</p>
                        {ticket.resolvedAt && (
                            <p><span className="font-medium">Resuelto:</span> {formatDate(ticket.resolvedAt)}</p>
                        )}
                        {ticket.isOverdue && (
                            <p className="text-red-600 font-semibold">⚠️ Vencido (SLA excedido)</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pestañas */}
            <div className="mb-8">
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex gap-6">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`pb-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'comments'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Comentarios
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'history'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Historial
                        </button>
                    </nav>
                </div>

                {activeTab === 'comments' && (
                    <div>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {ticket.comments.length === 0 ? (
                                <p className="text-gray-500 text-sm">No hay comentarios aún.</p>
                            ) : (
                                ticket.comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium">
                                                {comment.author || 'Usuario desconocido'}
                                            </span>
                                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-gray-50 p-3 rounded space-y-2 max-h-60 overflow-y-auto">
                        {ticket.history.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay historial de cambios.</p>
                        ) : (
                            ticket.history.map((entry, index) => (
                                <div key={index} className="text-sm border-l-2 border-brand-primary pl-3">
                                    <p>
                                        <span className="font-medium">{entry.user}</span>{' '}
                                        {entry.note ? (
                                            <>
                                                {entry.note}
                                                {entry.previousStatus !== entry.newStatus && (
                                                    <span className="text-gray-500">
                                                        {' '}({entry.previousStatus || '—'} → {entry.newStatus})
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                cambió de
                                                <span className="font-medium"> {entry.previousStatus || '—'} </span>
                                                a <span className="font-medium">{entry.newStatus}</span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            <ReassignModal
                isOpen={showReassignModal}
                ticketId={ticket.id}
                currentTechnicianId={ticket.assignedToId ?? null}
                onClose={() => setShowReassignModal(false)}
                onReassigned={async () => {
                    // Recargar el ticket después de reasignar
                    if (id) {
                        const updated = await getTicketDetail(parseInt(id));
                        setTicket(updated);
                    }
                    setShowReassignModal(false);
                }}
            />
        </div>
    );
};

export default TicketDetail;