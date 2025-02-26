import { API_URL } from './config';

// Tipos de usuario
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Funciones de autenticación y manejo de usuario
export const isAuthenticated = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const token = window.localStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    const userStr = window.localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const logout = (): void => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.location.href = '/admin/login';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Función para verificar si el usuario es administrador
export const isAdmin = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;
    const user = getCurrentUser();
    if (!user) return false;
    
    const token = window.localStorage.getItem('token');
    
    const response = await fetch(`${API_URL.replace('/api', '')}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('No autorizado');
    }

    const data = await response.json();
    return data.user.isAdmin;
  } catch (error) {
    console.error('Error al verificar permisos de administrador:', error);
    return false;
  }
}; 