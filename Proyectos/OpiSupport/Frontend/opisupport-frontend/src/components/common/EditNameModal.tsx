// src/components/common/EditNameModal.tsx
import { useState, useEffect } from 'react';
import { updateUserName } from '../../api/users';

interface EditNameModalProps {
    isOpen: boolean;
    userId: number;
    currentName: string;
    onClose: () => void;
    onUpdated: (newName: string) => void;
}

/**
 * Modal para cambiar el nombre completo de un usuario.
 * La interfaz solo se muestra al perfil Sistema, pero el backend
 * vuelve a validar el permiso antes de guardar.
 */
const EditNameModal = ({
    isOpen,
    userId,
    currentName,
    onClose,
    onUpdated,
}: EditNameModalProps) => {
    const [fullName, setFullName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sincronizar el campo cada vez que se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFullName(currentName);
            setError(null);
        }
    }, [isOpen, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = fullName.trim();

        if (trimmedName.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await updateUserName(userId, trimmedName);
            onUpdated(trimmedName);
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar el nombre:', err);
            setError(err.response?.data?.message || 'Error al actualizar el nombre.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-brand-primary">Editar nombre</h2>
                <p className="mb-4 text-sm text-gray-600">
                    Usuario #{userId}
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            minLength={3}
                            maxLength={150}
                            autoFocus
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-brand-secondary"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-brand-primary px-4 py-2 text-white transition-colors hover:bg-purple-800 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNameModal;
