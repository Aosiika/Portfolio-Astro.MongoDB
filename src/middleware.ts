import { defineMiddleware } from 'astro:middleware';

// Define el middleware
export const onRequest = defineMiddleware(async (context, next) => {
  // Desactivamos la redirección forzada para permitir que la verificación
  // del lado del cliente funcione correctamente
  return next();
  
  /* Código original comentado
  const { request, redirect } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Solo aplicar a rutas de admin
  if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
    // En el servidor no podemos verificar localStorage, así que siempre redirigimos
    // La verificación real se hará en el cliente
    return redirect('/admin/login');
  }

  // Continuar con la solicitud para otras rutas
  return next();
  */
}); 