

import { createContext, useReducer, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { login as apiLogin, getStoredUser, logout as apiLogout } from '../api/auth';

// ========== 1. DEFINIR EL ESTADO ==========
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // empezamos cargando
    error: null,
};

// ========== 2. DEFINIR LOS TIPOS DE ACCIONES ==========
type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_ERROR'; payload: string }
    | { type: 'UPDATE_USER_NAME'; payload: string }
    | { type: 'LOGOUT' };

// ========== 3. CREAR EL REDUCER ==========
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                isAuthenticated: false,
                user: null,
            };
        case 'UPDATE_USER_NAME':
            // Solo cambia el nombre mostrado; la sesión sigue igual.
            return state.user
                ? { ...state, user: { ...state.user, fullName: action.payload } }
                : state;
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        default:
            return state;
    }
};

// ========== 4. CREAR EL CONTEXT ==========
interface AuthContextType {
    state: AuthState;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
    /** Actualiza el nombre del usuario en sesión (por ejemplo, al renombrarse a sí mismo). */
    updateProfileName: (fullName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========== 5. CREAR EL PROVIDER ==========
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ===== VERIFICAR SESIÓN AL CARGAR LA APP =====
    useEffect(() => {
        const storedUser = getStoredUser();
        const token = localStorage.getItem('token');
        console.log('📦 Token en localStorage:', token);
        console.log('📦 Usuario guardado:', storedUser);

        if (token && storedUser) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser });
            console.log('🔵 Sesión recuperada:', storedUser);
        } else {
            dispatch({ type: 'SET_LOADING', payload: false });
            console.log('🔵 Sin sesión guardada');
        }
    }, []);

    // ===== 5.1 Función login =====
    const login = async (identifier: string, password: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await apiLogin(identifier, password);
            // response ya tiene la estructura { token, user: { id, fullName, role } }
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
            console.log('🔑 Token guardado:', localStorage.getItem('token'));
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            dispatch({ type: 'LOGIN_ERROR', payload: message });
            throw new Error(message);
        }
    };

    // ===== 5.2 Función logout =====
    const logout = () => {
        apiLogout();
        dispatch({ type: 'LOGOUT' });
    };

    // ===== 5.3 Actualizar el nombre del usuario en sesión =====
    const updateProfileName = (fullName: string) => {
        dispatch({ type: 'UPDATE_USER_NAME', payload: fullName });

        const storedUser = getStoredUser();
        if (storedUser) {
            localStorage.setItem('user', JSON.stringify({ ...storedUser, fullName }));
        }
    };

    // ===== 5.4 Valor del contexto =====
    const value: AuthContextType = {
        state,
        login,
        logout,
        updateProfileName,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ========== 6. CREAR EL HOOK PERSONALIZADO ==========
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};