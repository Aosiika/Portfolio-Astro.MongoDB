# Portfolio Personal con Astro y MongoDB

Este proyecto es un portfolio personal moderno y dinámico construido con Astro en el frontend y MongoDB en el backend. Incluye un panel de administración para gestionar el contenido, modo mantenimiento, y más características.

## Características

- 🚀 **Frontend con Astro**: Rápido y optimizado para SEO
- 🎨 **Diseño Responsive**: Adaptable a todos los dispositivos
- 🌙 **Modo Oscuro**: Soporte para tema claro/oscuro
- 📊 **Panel de Administración**: Gestión completa del contenido
- 🔧 **Modo Mantenimiento**: Activable desde el panel de administración
- 🔒 **Autenticación**: Sistema de login seguro con JWT
- 📱 **Animaciones**: Experiencia de usuario mejorada con GSAP
- 📝 **Formulario de Contacto**: Envío de mensajes desde la web

## Tecnologías Utilizadas

- **Frontend**:
  - Astro
  - TailwindCSS
  - TypeScript
  - GSAP (Animaciones)
  - Font Awesome (Iconos)

- **Backend**:
  - Node.js
  - Express
  - MongoDB
  - JWT (Autenticación)

## Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o en la nube)
- npm o yarn

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Aosiika/Portfolio-Astro.MongoDB.git
   cd Portfolio-Astro.MongoDB
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Actualiza las variables con tus propios valores

4. Configura el archivo de API:
   - Copia `src/api/config.example.ts` a `src/api/config.ts`

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. En otra terminal, inicia el backend:
   ```bash
   npm run backend
   ```

## Estructura del Proyecto

```
/
├── public/             # Archivos estáticos
├── src/                # Código fuente del frontend
│   ├── api/            # Configuración de la API
│   ├── components/     # Componentes reutilizables
│   ├── layouts/        # Layouts de Astro
│   └── pages/          # Páginas de Astro
├── backend/            # Código del servidor backend
│   ├── config/         # Configuración del backend
│   ├── controllers/    # Controladores de la API
│   ├── middleware/     # Middleware personalizado
│   ├── models/         # Modelos de MongoDB
│   └── routes/         # Rutas de la API
└── package.json        # Dependencias y scripts
```

## Despliegue

### Frontend (Astro)
El frontend puede desplegarse en cualquier plataforma que soporte Astro, como Vercel, Netlify o GitHub Pages.

### Backend (Node.js + MongoDB)
El backend puede desplegarse en plataformas como Heroku, Railway, o cualquier servidor que soporte Node.js.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
