// src/pages/UserManagement.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserResponse } from '../types';
import { getCategories } from '../api/masters';
import type { Category } from '../types';
import type { Technician } from '../types';
import { getUsers, createUser, disableUser, enableUser, getTechnicians } from '../api/users';
import EditSpecialtiesModal from '../components/common/EditSpecialtiesModal';



const UserManagement = () => {
    const { state } = useAuth();
    const userRole = state.user?.role;
    const isSystem = userRole === 'Sistema';
    const isSupervisor = userRole === 'Supervisor';
    const canManage = isSystem || isSupervisor;

    // Estados para el formulario
    const [fullName, setFullName] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Colaborador' | 'Tecnico' | 'Supervisor'>('Colaborador');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estados para listado de usuarios
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Filtros
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [techniciansWithSpecialties, setTechniciansWithSpecialties] = useState<Technician[]>([]);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<{ id: number; name: string; specialties: number[] } | null>(null);

    // Cargar usuarios al montar y cuando cambien los filtros
    useEffect(() => {
        const loadUsers = async () => {
            if (!canManage) return;
            setLoadingUsers(true);
            try {
                const params: any = {};
                if (roleFilter) params.role = roleFilter;
                if (statusFilter === 'active') params.isActive = true;
                else if (statusFilter === 'inactive') params.isActive = false;
                const data = await getUsers(params);
                setUsers(data);
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
                setMessage({ type: 'error', text: 'Error al cargar usuarios.' });
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, [canManage, roleFilter, statusFilter]);

    // Cargar categorías para las especialidades
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                setMessage({ type: 'error', text: 'Error al cargar categorías.' });
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    // Cargar técnicos con especialidades
    useEffect(() => {
        const loadTechnicians = async () => {
            try {
                const data = await getTechnicians();
                setTechniciansWithSpecialties(data);
            } catch (error) {
                console.error('Error al cargar técnicos:', error);
            }
        };
        if (canManage) {
            loadTechnicians();
        }
    }, [canManage]);

    // Obtener el nombre de una categoría por su ID
    const getCategoryName = (categoryId: number): string => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : `ID ${categoryId}`;
    };

    const handleOpenEditSpecialties = (userId: number, userName: string) => {
        const tech = techniciansWithSpecialties.find(t => t.id === userId);
        setSelectedTechnician({
            id: userId,
            name: userName,
            specialties: tech?.specialties || [],
        });
        setEditModalOpen(true);
    };

    const handleSpecialtiesUpdated = async () => {
        try {
            const data = await getTechnicians();
            setTechniciansWithSpecialties(data);
            setMessage({ type: 'success', text: 'Especialidades actualizadas correctamente.' });
        } catch (error) {
            console.error('Error al recargar técnicos:', error);
        }
    };



    // ===== CREAR USUARIO =====
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Validar que el rol seleccionado sea permitido
            if (!isSystem && role === 'Supervisor') {
                setMessage({ type: 'error', text: 'No tienes permisos para crear un Supervisor.' });
                setLoading(false);
                return;
            }

            // Construir el body
            const userData: any = {
                fullName,
                employeeCode,
                email: email || undefined,
                password,
                role,
            };

            // Si el rol es Tecnico, incluir especialidades
            if (role === 'Tecnico') {
                userData.specialtyCategoryIds = selectedSpecialties;
            }

            await createUser(userData);

            setMessage({ type: 'success', text: 'Usuario creado exitosamente.' });
            // Limpiar formulario
            setFullName('');
            setEmployeeCode('');
            setEmail('');
            setPassword('');
            setRole('Colaborador');
            setSelectedSpecialties([]);
            // Recargar lista
            const updated = await getUsers({});
            setUsers(updated);
        } catch (error: any) {
            console.error('Error al crear usuario:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear usuario.' });
        } finally {
            setLoading(false);
        }
    };

    // ===== INHABILITAR / HABILITAR USUARIO =====
    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        const action = currentStatus ? 'inhabilitar' : 'habilitar';
        if (!confirm(`¿Estás seguro de que deseas ${action} a este usuario?`)) return;
        setActionLoading(userId);
        try {
            if (currentStatus) {
                await disableUser(userId);
            } else {
                await enableUser(userId);
            }
            // Recargar lista
            const updated = await getUsers({});
            setUsers(updated);
            setMessage({ type: 'success', text: `Usuario ${action}do correctamente.` });
        } catch (error: any) {
            console.error(`Error al ${action} usuario:`, error);
            setMessage({ type: 'error', text: error.response?.data?.message || `Error al ${action} usuario.` });
        } finally {
            setActionLoading(null);
        }
    };

    if (!canManage) {
        return <div className="p-6 text-red-500">No tienes permisos para acceder a esta página.</div>;
    }

    // Determinar opciones de rol para el formulario
    const roleOptions = isSystem
        ? ['Colaborador', 'Tecnico', 'Supervisor'] as const
        : ['Colaborador', 'Tecnico'] as const;

    // Filtrar usuarios para mostrar según el rol autenticado
    const visibleUsers = users.filter(user => {
        if (isSystem) return true; // Sistema ve todo
        if (isSupervisor) {
            // Supervisor solo ve Colaboradores y Técnicos (no Supervisores ni Sistema)
            return user.role === 'Colaborador' || user.role === 'Tecnico';
        }
        return false;
    });

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-brand-primary mb-6">Administración de Usuarios</h1>

            {message && (
                <div className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {message.text}
                </div>
            )}

            {/* Formulario de creación */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código de empleado *</label>
                            <input
                                type="text"
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rol *</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as typeof role)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            >
                                {roleOptions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Especialidades (solo para rol Tecnico) */}
                    {role === 'Tecnico' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Especialidades (categorías que puede atender)
                            </label>
                            {loadingCategories ? (
                                <div className="text-sm text-gray-500">Cargando categorías...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecialties.includes(cat.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSpecialties([...selectedSpecialties, cat.id]);
                                                    } else {
                                                        setSelectedSpecialties(selectedSpecialties.filter(id => id !== cat.id));
                                                    }
                                                }}
                                                className="form-checkbox h-4 w-4 text-brand-primary rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Si no seleccionas ninguna, el técnico no tendrá especialidades (no recibirá tickets automáticamente).
                            </p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
            </div>

            {/* Filtros y listado */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Usuarios Registrados</h2>

                {/* Filtros */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        >
                            <option value="">Todos</option>
                            <option value="Colaborador">Colaborador</option>
                            <option value="Tecnico">Técnico</option>
                            {isSystem && <option value="Supervisor">Supervisor</option>}
                            {isSystem && <option value="Sistema">Sistema</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>
                </div>

                {loadingUsers ? (
                    <div className="text-center text-gray-500">Cargando usuarios...</div>
                ) : visibleUsers.length === 0 ? (
                    <div className="text-center text-gray-500">No hay usuarios que coincidan con los filtros.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidades</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visibleUsers.map((user) => {
                                    const isSelf = state.user?.id === user.id;
                                    const canDisable =
                                        (isSystem) ||
                                        (isSupervisor && (user.role === 'Colaborador' || user.role === 'Tecnico'));
                                    const showAction = canDisable && !isSelf;

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.employeeCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.role}</td>

                                            {/*CELDA DE ESPECIALIDADES*/}
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {user.role === 'Tecnico' ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(() => {
                                                            const tech = techniciansWithSpecialties.find(t => t.id === user.id);
                                                            if (tech && tech.specialties && tech.specialties.length > 0) {
                                                                return tech.specialties.map((catId) => (
                                                                    <span
                                                                        key={catId}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-primary bg-opacity-10 text-brand-primary"
                                                                    >
                                                                        {getCategoryName(catId)}
                                                                    </span>
                                                                ));
                                                            }
                                                            return <span className="text-gray-400 text-xs">Sin especialidades</span>;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">N/A</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                {user.role === 'Tecnico' && (isSystem || isSupervisor) && (
                                                    <button
                                                        onClick={() => handleOpenEditSpecialties(user.id, user.fullName)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs mr-2"
                                                    >
                                                        Editar especialidades
                                                    </button>
                                                )}
                                                {showAction && (
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                                        disabled={actionLoading === user.id}
                                                        className={`px-3 py-1 rounded-md text-white text-xs transition-colors ${user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50`}
                                                    >
                                                        {actionLoading === user.id ? 'Procesando...' : user.isActive ? 'Inhabilitar' : 'Habilitar'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selectedTechnician && (
                <EditSpecialtiesModal
                    isOpen={editModalOpen}
                    technicianId={selectedTechnician.id}
                    technicianName={selectedTechnician.name}
                    currentSpecialties={selectedTechnician.specialties}
                    onClose={() => setEditModalOpen(false)}
                    onUpdated={handleSpecialtiesUpdated}
                />
            )}
        </div>
    );
};

export default UserManagement;