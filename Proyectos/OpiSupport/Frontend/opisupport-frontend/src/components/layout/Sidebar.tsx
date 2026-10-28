// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { state } = useAuth();
    const userRole = state.user?.role;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Logo o título */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-brand-primary">OpiSupport</h1>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-1">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                >
                    <span>📋</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/create-ticket"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                >
                    <span>➕</span>
                    Crear Ticket
                </NavLink>

                {/* Reportes (solo Supervisor) */}
                {userRole === 'Supervisor' && (
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <span>📊</span>
                        Reportes SLA
                    </NavLink>
                )}

                {/* Mi Perfil (para todos) */}
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                >
                    <span>👤</span>
                    Mi Perfil
                </NavLink>
            </nav>

            {(userRole === 'Supervisor' || userRole === 'Sistema') && (
                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                >
                    <span>👥</span>
                    Administrar Usuarios
                </NavLink>
            )}

            {/* Información del usuario */}
            <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                    {state.user?.fullName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400">
                    {state.user?.role || 'Sin rol'}
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;