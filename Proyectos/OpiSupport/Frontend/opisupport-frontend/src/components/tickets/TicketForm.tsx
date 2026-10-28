
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateTicketRequest } from '../../types';

// ===== 1. DEFINIR EL ESQUEMA DE VALIDACIÓN CON ZOD =====
const ticketSchema = z.object({
    title: z.string()
        .min(5, 'El título debe tener al menos 5 caracteres')
        .max(100, 'El título no puede exceder 100 caracteres'),
    description: z.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(1000, 'La descripción no puede exceder 1000 caracteres'),
    categoryId: z.number({ required_error: 'Debes seleccionar una categoría' }),
    areaId: z.number({ required_error: 'Debes seleccionar un área' }),
    priority: z.enum(['Crítica', 'Alta', 'Media', 'Baja'] as const, {
        required_error: 'Debes seleccionar una prioridad',
    }),
});

// ===== 2. INFERIR EL TIPO DEL FORMULARIO =====
type TicketFormData = z.infer<typeof ticketSchema>;

// ===== 3. PROPS DEL COMPONENTE =====
interface TicketFormProps {
    onSubmit: (data: CreateTicketRequest) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

// ===== 4. COMPONENTE =====
export const TicketForm = ({ onSubmit, isSubmitting = false, onCancel }: TicketFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            priority: 'Media',
        },
    });

    // ===== 5. MANEJAR ENVÍO =====
    const handleFormSubmit = (data: TicketFormData) => {
        onSubmit({
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            areaId: data.areaId,
            priority: data.priority,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Título */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título del ticket
                </label>
                <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    placeholder="Ej: Impresora no enciende"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción
                </label>
                <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    placeholder="Describe el problema detalladamente..."
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
            </div>

            {/* Categoría y Área - dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                        Categoría
                    </label>
                    <select
                        id="categoryId"
                        {...register('categoryId', { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Seleccionar categoría</option>
                        {/* TODO: Cargar desde API */}
                        <option value="1">Hardware</option>
                        <option value="2">Software</option>
                        <option value="3">Red</option>
                        <option value="4">Infraestructura / Instalaciones</option>
                        <option value="5">Otro</option>
                    </select>
                    {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="areaId" className="block text-sm font-medium text-gray-700">
                        Área de reporte
                    </label>
                    <select
                        id="areaId"
                        {...register('areaId', { valueAsNumber: true })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    >
                        <option value="">Seleccionar área</option>
                        {/* TODO: Cargar desde API */}
                        <option value="1">Sistemas / TI</option>
                        <option value="2">Recursos Humanos</option>
                        <option value="3">Contabilidad / Finanzas</option>
                        <option value="4">Operaciones / Planta</option>
                        <option value="5">Dirección / Gerencia</option>
                        <option value="6">Ventas / Comercial</option>
                        <option value="7">Logística / Bodega</option>
                        <option value="8">Servicios Generales / Mantenimiento</option>
                    </select>
                    {errors.areaId && (
                        <p className="mt-1 text-sm text-red-600">{errors.areaId.message}</p>
                    )}
                </div>
            </div>

            {/* Prioridad */}
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Prioridad
                </label>
                <select
                    id="priority"
                    {...register('priority')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                </select>
                {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creando...' : 'Crear ticket'}
                </button>
            </div>
        </form>
    );
};