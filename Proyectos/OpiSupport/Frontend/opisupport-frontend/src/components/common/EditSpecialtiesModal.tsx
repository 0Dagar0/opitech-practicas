// src/components/common/EditSpecialtiesModal.tsx
import { useState, useEffect } from 'react';
import { getCategories } from '../../api/masters';
import { updateTechnicianSpecialties } from '../../api/users';
import type { Category } from '../../types';

interface EditSpecialtiesModalProps {
    isOpen: boolean;
    technicianId: number;
    technicianName: string;
    currentSpecialties: number[]; // IDs de categorías actuales
    onClose: () => void;
    onUpdated: () => void;
}

const EditSpecialtiesModal = ({
    isOpen,
    technicianId,
    technicianName,
    currentSpecialties,
    onClose,
    onUpdated,
}: EditSpecialtiesModalProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selected, setSelected] = useState<number[]>(currentSpecialties);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar categorías y sincronizar selección al abrir
    useEffect(() => {
        if (isOpen) {
            setSelected(currentSpecialties);
            const loadCategories = async () => {
                try {
                    const data = await getCategories();
                    setCategories(data);
                } catch (err) {
                    console.error('Error al cargar categorías:', err);
                    setError('No se pudieron cargar las categorías.');
                }
            };
            loadCategories();
        }
    }, [isOpen, currentSpecialties]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await updateTechnicianSpecialties(technicianId, selected);
            onUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error al actualizar especialidades:', err);
            setError(err.response?.data?.message || 'Error al actualizar especialidades.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Editar Especialidades</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Técnico: <span className="font-medium">{technicianName}</span>
                </p>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 max-h-60 overflow-y-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categorías que puede atender
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {categories.map((cat) => (
                                <label key={cat.id} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(cat.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelected([...selected, cat.id]);
                                            } else {
                                                setSelected(selected.filter((id) => id !== cat.id));
                                            }
                                        }}
                                        className="form-checkbox h-4 w-4 text-brand-primary rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
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
                            disabled={loading}
                            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSpecialtiesModal;