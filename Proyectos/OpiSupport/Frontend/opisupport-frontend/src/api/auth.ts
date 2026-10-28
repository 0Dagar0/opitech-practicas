import apiClient from './client';
import type { LoginResponse, User } from '../types';

export const login = async (identifier: string, password: string): Promise<{ token: string; user: User }> => {
    console.log('📤 Intentando login con:', { identifier, password });

    try {
        // La respuesta del backend es de tipo LoginResponse (token, userId, fullName, role)
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            identifier,
            password,
        });

        console.log('✅ Login exitoso, respuesta:', response.data);

        // Construir el objeto User a partir de la respuesta del backend
        const userData: User = {
            id: response.data.userId,
            fullName: response.data.fullName,
            role: response.data.role,
        };

        console.log('👤 Usuario mapeado:', userData);

        // Guardar token y usuario en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('💾 Token guardado:', localStorage.getItem('token'));
        console.log('💾 Usuario guardado:', localStorage.getItem('user'));

        // Devolver el token y el usuario en la estructura que espera el frontend
        return {
            token: response.data.token,
            user: userData,
        };
    } catch (error: any) {
        console.error('❌ Error en login:', error);
        if (error.response) {
            console.error('📄 Respuesta del servidor:', error.response.data);
            console.error('🔢 Código de estado:', error.response.status);
        } else if (error.request) {
            console.error('⚠️ No se recibió respuesta del servidor');
        } else {
            console.error('⚠️ Error al configurar la petición:', error.message);
        }
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🔴 Sesión cerrada');
};

export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as User;
    } catch {
        return null;
    }
};

export const getStoredToken = (): string | null => {
    return localStorage.getItem('token');
};