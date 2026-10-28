
import apiClient from './client';
import type { SlaReport } from '../types';

/**
 * Obtiene el reporte de cumplimiento SLA
 * Solo disponible para Supervisores
 */
export const getSlaReport = async (): Promise<SlaReport> => {
    const response = await apiClient.get<SlaReport>('/reports/sla-compliance');
    return response.data;
};