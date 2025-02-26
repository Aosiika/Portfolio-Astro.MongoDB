// Configuración de la API
// Siempre usamos el proxy de Astro para evitar problemas de CORS
export const API_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api';

// Función para obtener una URL completa para fetch
export function getApiUrl(endpoint: string): string {
  // Si estamos en el servidor, necesitamos una URL absoluta
  if (typeof window === 'undefined') {
    // Asegurarnos de que no haya doble barra
    if (endpoint.startsWith('/api/')) {
      return `http://localhost:5000${endpoint}`;
    } else if (endpoint.startsWith('/')) {
      return `http://localhost:5000/api${endpoint}`;
    } else {
      return `http://localhost:5000/api/${endpoint}`;
    }
  }
  
  // En el cliente, usamos el proxy de Astro
  if (endpoint.startsWith('/api/')) {
    return endpoint; // Ya tiene el prefijo /api/
  } else if (endpoint.startsWith('/')) {
    return `/api${endpoint}`; // Añadir prefijo /api a una ruta que ya empieza con /
  } else {
    return `/api/${endpoint}`; // Añadir prefijo /api/ a una ruta sin /
  }
}

// Tipos de usuario
interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Función para realizar peticiones autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Solo verificar token en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        window.location.href = '/admin/login';
        throw new Error('No hay token de autenticación');
      }
      
      // Añadir token a las opciones
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      };
    }

    // Obtener la URL completa usando el proxy de Astro
    const fullUrl = getApiUrl(url);
    console.log('Realizando petición a:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include'
    });

    if (!response.ok) {
      // Si el error es 401 y estamos en el cliente, redirigir al login
      if (response.status === 401 && typeof window !== 'undefined') {
        console.error('Token inválido o expirado');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        throw new Error('Token inválido o expirado');
      }

      const errorText = await response.text();
      console.error('Error en la respuesta:', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        body: errorText
      });
      throw new Error(`Error en la solicitud: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error en fetchWithAuth:', error);
    throw error;
  }
}

// Funciones de autenticación y manejo de usuario
export const isAuthenticated = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const logout = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

    const data = await fetchWithAuth('/api/users/profile');
    return data.user.isAdmin;
  } catch (error) {
    console.error('Error al verificar permisos de administrador:', error);
    return false;
  }
}; 