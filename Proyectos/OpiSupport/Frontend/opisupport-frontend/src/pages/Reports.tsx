
import { useState, useEffect } from 'react';
import { getSlaReport } from '../api/reports';
import type { SlaReport } from '../types';

const Reports = () => {
    const [report, setReport] = useState<SlaReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Cargar reporte
    const loadReport = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔑 Token actual:', localStorage.getItem('token')); // <--- AGREGAR
            const data = await getSlaReport();
            setReport(data);
        } catch (err: any) {
            console.error('Error al cargar reporte:', err);
            setError('Error al cargar el reporte SLA');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    const handleFilter = () => {
        console.log('📅 Filtrando por fechas:', { startDate, endDate });
        // TODO: Implementar filtro por fechas cuando el backend lo soporte
        loadReport();
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        loadReport();
    };

    const formatPercentage = (value: number) => value.toFixed(1);

    if (loading) return <div className="p-6 text-center text-gray-500">Cargando reporte...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!report) return <div className="p-6 text-center text-gray-500">No hay datos disponibles</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-brand-primary mb-6">Reporte de Cumplimiento SLA</h1>

            {/* Filtros de fecha */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    />
                </div>
                <button
                    onClick={handleFilter}
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

            {/* Cumplimiento global */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Cumplimiento Global</h2>
                <div className="text-4xl font-bold text-brand-primary">
                    {formatPercentage(report.globalCompliancePercentage)}%
                </div>
                <div className="text-sm text-gray-500">
                    Promedio de cumplimiento SLA en el período seleccionado
                </div>
            </div>

            {/* Tabla de técnicos */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Cumplimiento por Técnico</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resueltos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumplidos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incumplidos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Cumplimiento</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.technicians.map((tech) => (
                                <tr key={tech.technicianId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{tech.technicianName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{tech.totalResolved}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">{tech.compliant}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">{tech.nonCompliant}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        <span className={`${tech.compliancePercentage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(tech.compliancePercentage)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla de categorías */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Cumplimiento por Categoría</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resueltos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumplidos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incumplidos</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Cumplimiento</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {report.categories.map((cat) => (
                                <tr key={cat.categoryId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cat.categoryName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cat.totalResolved}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">{cat.compliant}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">{cat.nonCompliant}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        <span className={`${cat.compliancePercentage >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(cat.compliancePercentage)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;