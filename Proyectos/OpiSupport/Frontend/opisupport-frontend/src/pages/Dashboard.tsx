
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTickets } from '../api/tickets';
import { getTechnicians } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import PriorityBadge from '../components/tickets/PriorityBadge';
import type { TicketListItem, Technician } from '../types';



const Dashboard = () => {
    const navigate = useNavigate();
    const { state } = useAuth();
    const userRole = state.user?.role;
    const location = useLocation();

    // Estado de tickets
    const [tickets, setTickets] = useState<TicketListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado de técnicos (para el filtro)
    const [technicians, setTechnicians] = useState<Technician[]>([]);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [technicianFilter, setTechnicianFilter] = useState('');
    const [onlyOverdue, setOnlyOverdue] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // ===== Cargar técnicos (Supervisor y Sistema) =====
    useEffect(() => {
        if (userRole === 'Supervisor' || userRole === 'Sistema') {
            const loadTechnicians = async () => {
                try {
                    const data = await getTechnicians();
                    setTechnicians(data);
                } catch (err) {
                    console.error('Error al cargar técnicos:', err);
                }
            };
            loadTechnicians();
        }
    }, [userRole]);

    // ===== Cargar tickets =====
    const loadTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getTickets({
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                technicianId: technicianFilter && technicianFilter !== 'unassigned'
                    ? parseInt(technicianFilter, 10)
                    : undefined,
                unassigned: technicianFilter === 'unassigned' ? true : undefined,
                onlyOverdue: onlyOverdue || undefined,
                page: currentPage,
                size: pageSize,
            });

            console.log('📦 Respuesta del backend (tickets):', response);
            console.log('📦 Tipo de response:', typeof response);
            console.log('📦 ¿Es un array?', Array.isArray(response));

            if (Array.isArray(response)) {
                setTickets(response);
                setTotalPages(1);
                setTotalItems(response.length);
            } else if (response.items && Array.isArray(response.items)) {
                setTickets(response.items);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || response.items.length);
            } else {
                setTickets([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err: any) {
            console.error('Error al cargar tickets:', err);
            setError('Error al cargar los tickets. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // ===== Efecto para recargar cuando cambian filtros o página =====
    useEffect(() => {
        loadTickets();
    }, [statusFilter, priorityFilter, technicianFilter, onlyOverdue, currentPage]);

    // ===== Handlers =====
    const handleApplyFilters = () => {
        setCurrentPage(1);
        loadTickets();
    };

    // Recargar tickets si venimos de crear un ticket
    useEffect(() => {
        if (location.state?.refresh) {
            loadTickets();
            // Limpiar el estado para evitar recargas innecesarias
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    const handleClearFilters = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setTechnicianFilter('');
        setOnlyOverdue(false);
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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

    // ===== Render =====
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-brand-primary">Dashboard</h1>
                <button
                    onClick={() => navigate('/create-ticket')}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors"
                >
                    + Crear Ticket
                </button>
            </div>

            {/* Filtros */}
            <div className="mb-4 flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg shadow">
                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Todos</option>
                        <option value="Abierto">Abierto</option>
                        <option value="Asignado">Asignado</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Cerrado">Cerrado</option>
                        <option value="Reabierto">Reabierto</option>
                    </select>
                </div>

                {/* Prioridad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Todas</option>
                        <option value="Crítica">Crítica</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                </div>

                {/* Técnico (Supervisor y Sistema) */}
                {(userRole === 'Supervisor' || userRole === 'Sistema') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Técnico</label>
                        <select
                            value={technicianFilter}
                            onChange={(e) => setTechnicianFilter(e.target.value)}
                            className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        >
                            <option value="">Todos</option>
                            <option value="unassigned">Sin asignar</option>
                            {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.fullName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Vencidos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vencidos</label>
                    <select
                        value={onlyOverdue ? 'true' : ''}
                        onChange={(e) => setOnlyOverdue(e.target.value === 'true')}
                        className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Todos</option>
                        <option value="true">Solo vencidos</option>
                    </select>
                </div>

                <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors"
                >
                    Aplicar filtros
                </button>
                <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Limpiar
                </button>
            </div>

            {/* Loading y errores */}
            {loading && <div className="text-center py-8 text-gray-500">Cargando tickets...</div>}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-4">
                    {error}
                </div>
            )}

            {/* Tabla de tickets */}
            {!loading && !error && (
                <>
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                            No hay tickets que coincidan con los filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{ticket.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${ticket.status === 'Abierto' ? 'bg-red-100 text-red-800' : ''}
                                                    ${ticket.status === 'Asignado' ? 'bg-blue-100 text-blue-800' : ''}
                                                    ${ticket.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${ticket.status === 'Resuelto' ? 'bg-green-100 text-green-800' : ''}
                                                    ${ticket.status === 'Cerrado' ? 'bg-gray-100 text-gray-800' : ''}
                                                    ${ticket.status === 'Reabierto' ? 'bg-purple-100 text-purple-800' : ''}
                                                `}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <PriorityBadge priority={ticket.priority} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {ticket.assignedToFullName || 'Sin asignar'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(ticket.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-primary">
                                                <button
                                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                    className="hover:underline"
                                                >
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                            –{Math.min(currentPage * pageSize, totalItems)} de {totalItems} resultados
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 border rounded-md text-sm ${page === currentPage
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;