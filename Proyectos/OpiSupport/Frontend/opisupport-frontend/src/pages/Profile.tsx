// src/pages/Profile.tsx
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { state, logout } = useAuth();
    const user = state.user;

    if (!user) {
        return <div className="p-6">No hay usuario autenticado.</div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-brand-primary mb-6">Mi Perfil</h1>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre completo</label>
                    <p className="text-lg text-gray-900">{user.fullName}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500">Rol</label>
                    <p className="text-lg text-gray-900">{user.role}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500">ID de usuario</label>
                    <p className="text-lg text-gray-900">{user.id}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;