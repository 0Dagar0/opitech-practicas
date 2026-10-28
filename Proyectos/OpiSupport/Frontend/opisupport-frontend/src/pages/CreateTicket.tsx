// src/pages/CreateTicket.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTicket } from '../api/tickets';
import { getCategories, getAreas } from '../api/masters';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Category, Area } from '../types';

// === ESQUEMA DE VALIDACIÓN ===
const ticketSchema = z.object({
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    categoryId: z.number({ required_error: 'Selecciona una categoría' }),
    areaId: z.number({ required_error: 'Selecciona un área' }),
    priority: z.enum(['Crítica', 'Alta', 'Media', 'Baja'], {
        required_error: 'Selecciona una prioridad',
    }),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const CreateTicket = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loadingMasters, setLoadingMasters] = useState(true);

    // Cargar categorías y áreas al montar
    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [cats, ars] = await Promise.all([getCategories(), getAreas()]);
                setCategories(cats);
                setAreas(ars);
            } catch (err) {
                console.error('Error al cargar categorías/áreas:', err);
                setServerError('Error al cargar los datos maestros.');
            } finally {
                setLoadingMasters(false);
            }
        };
        loadMasters();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
    });

    const onSubmit = async (data: TicketFormData) => {
        setServerError(null);
        try {
            const newTicket = await createTicket(data);
            console.log('✅ Ticket creado exitosamente:', newTicket);
            // Redirigir al Dashboard con un estado que indique que debe recargar
            navigate('/dashboard', { state: { refresh: true } });
        } catch (error: any) {
            console.error('❌ Error al crear ticket:', error);
            setServerError(error.message || 'Error al crear el ticket. Intenta nuevamente.');
        }
    };

    if (loadingMasters) {
        return <div className="p-6 text-center text-gray-500">Cargando formulario...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-brand-primary mb-6">Crear Nuevo Ticket</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text"
                        {...register('title')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        rows={4}
                        {...register('description')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                {/* Categoría */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                        {...register('categoryId', { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>

                {/* Área */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Área</label>
                    <select
                        {...register('areaId', { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Selecciona un área</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                    {errors.areaId && <p className="text-red-500 text-sm mt-1">{errors.areaId.message}</p>}
                </div>

                {/* Prioridad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                    <select
                        {...register('priority')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Selecciona una prioridad</option>
                        <option value="Crítica">Crítica</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                    {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
                </div>

                {/* Mensaje de error del servidor */}
                {serverError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {serverError}
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creando...' : 'Crear Ticket'}
                    </button>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTicket;