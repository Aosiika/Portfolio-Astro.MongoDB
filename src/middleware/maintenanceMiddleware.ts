import { defineMiddleware } from 'astro:middleware';
// Modificar la importación para evitar el error de resolución
const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

// Define el middleware
export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // No aplicar el middleware a las rutas de la API o admin
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    return next();
  }

  try {
    console.log('Verificando modo mantenimiento...');
    
    // Construir URL correcta para el servidor
    const configUrl = typeof window === 'undefined' 
      ? 'http://localhost:5000/api/config'
      : new URL('/api/config', url.origin).toString();
      
    console.log('URL de configuración:', configUrl);
    
    const response = await fetch(configUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Error al obtener la configuración:', response.status, response.statusText);
      return next();
    }

    const config = await response.json();
    console.log('Configuración cargada:', config);

    if (config.modoMantenimiento) {
      console.log('Modo mantenimiento activo, mostrando página de mantenimiento');
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sitio en Mantenimiento</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div class="max-w-2xl mx-auto p-8 text-center">
              <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white border-opacity-20">
                <h1 class="text-3xl font-bold text-white mb-4">Sitio en Mantenimiento</h1>
                <p class="text-xl text-white text-opacity-90 mb-8">${config.mensajeMantenimiento || 'Estamos realizando mejoras. Por favor, vuelve más tarde.'}</p>
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 503,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    return next();
  } catch (error) {
    console.error('Error en el middleware de mantenimiento:', error);
    return next();
  }
}); 