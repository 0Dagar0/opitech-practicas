import axios from 'axios';

// ========== CONFIGURACIÓN BASE ==========
const apiClient = axios.create({
    baseURL: 'http://localhost:5030/api', // Cambiar si el backend cambia de puerto
    headers: {
        'Content-Type': 'application/json',
    },
});

// ========== INTERCEPTOR DE SOLICITUD ==========
// Agrega el token JWT a todas las peticiones (si existe)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔑 Enviando token:', token); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ========== INTERCEPTOR DE RESPUESTA ==========
// Maneja errores 401 (no autorizado)
apiClient.interceptors.response.use(
    (response) => response, // Si la respuesta es exitosa, la devuelve
    (error) => {
        // Si el error es 401 (token expirado o inválido)
        if (error.response?.status === 401) {
            // Eliminar credenciales del localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirigir al login (si no está ya en esa página)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;