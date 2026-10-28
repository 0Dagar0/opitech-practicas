// src/api/users.ts
import apiClient from './client';
import type { UserListParams, UserResponse, UserCreateRequest, Technician } from '../types';

/**
 * Obtiene la lista de usuarios con filtros (solo para Supervisores y Sistema)
 */
export const getUsers = async (params?: UserListParams): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>('/users', { params });
    return response.data;
};

/**
 * Obtiene la lista de técnicos activos con sus especialidades
 */
export const getTechnicians = async (): Promise<Technician[]> => {
    const response = await apiClient.get<Technician[]>('/users/technicians');
    return response.data;
};

/**
 * Crea un nuevo usuario (solo disponible para Sistema y Supervisores)
 */
export const createUser = async (data: UserCreateRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/users', data);
    return response.data;
};

/**
 * Inhabilita un usuario (cambia IsActive a false)
 */
export const disableUser = async (userId: number): Promise<void> => {
    await apiClient.put(`/users/${userId}/disable`);
};

/**
 * Habilita un usuario (cambia IsActive a true)
 */
export const enableUser = async (userId: number): Promise<void> => {
    await apiClient.put(`/users/${userId}/enable`);
};

/**
 * Actualiza las especialidades de un técnico
 * @param userId ID del técnico
 * @param categoryIds Array de IDs de categorías
 */
export const updateTechnicianSpecialties = async (userId: number, categoryIds: number[]): Promise<void> => {
    await apiClient.put(`/users/${userId}/specialties`, categoryIds);
};