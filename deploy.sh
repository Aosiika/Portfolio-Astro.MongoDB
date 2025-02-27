#!/bin/bash

# Script de despliegue para Portfolio con Astro y MongoDB
# Autor: Aosiika
# Fecha: Febrero 2024

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Crear directorio de despliegue si no existe
DEPLOY_DIR="/home/aosika/web"
print_message "Verificando directorio de despliegue: $DEPLOY_DIR"

if [ ! -d "$DEPLOY_DIR" ]; then
  print_message "Creando directorio de despliegue..."
  mkdir -p $DEPLOY_DIR
fi

# Clonar el repositorio desde GitHub
print_message "Clonando el repositorio desde GitHub..."
if [ -d "$DEPLOY_DIR/.git" ]; then
  print_message "El repositorio ya existe. Actualizando..."
  cd $DEPLOY_DIR
  git pull origin main
else
  print_message "Clonando repositorio nuevo..."
  git clone https://github.com/Aosiika/Portfolio-Astro.MongoDB.git $DEPLOY_DIR
  cd $DEPLOY_DIR
fi

# Verificar si el clon fue exitoso
if [ ! -f "$DEPLOY_DIR/package.json" ]; then
  print_error "No se encontró el archivo package.json después de clonar. Verifica la URL del repositorio."
  exit 1
fi

# Configurar variables de entorno
print_message "Configurando variables de entorno..."
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  print_warning "No se encontró archivo .env en el directorio de despliegue. Creando uno nuevo..."
  cat > $DEPLOY_DIR/.env << EOL
# Variables de entorno para producción
PUBLIC_API_URL=/api
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=30d
NODE_ENV=production
EOL
  print_message "Archivo .env creado con valores predeterminados. Recuerda actualizar los valores según sea necesario."
else
  print_message "Archivo .env encontrado. Asegúrate de que tenga la configuración correcta para producción."
fi

# Configurar variables de entorno para el backend
print_message "Configurando variables de entorno para el backend..."
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
  print_warning "No se encontró archivo .env en el directorio backend. Creando uno nuevo..."
  cat > $DEPLOY_DIR/backend/.env << EOL
# Variables de entorno para el backend en producción
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=30d
NODE_ENV=production
EOL
  print_message "Archivo .env para backend creado con valores predeterminados. Recuerda actualizar los valores según sea necesario."
else
  print_message "Archivo .env para backend encontrado. Asegúrate de que tenga la configuración correcta para producción."
fi

# Actualizar la configuración de Astro para producción
print_message "Actualizando configuración de Astro para producción..."
cat > $DEPLOY_DIR/astro.config.mjs << EOL
// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://tudominio.com', // Cambia esto por tu dominio real
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 4322,
    host: true
  },
  vite: {
    ssr: {
      noExternal: ['@fortawesome/fontawesome-free'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        }
      }
    }
  }
});
EOL

# Instalar dependencias y construir el proyecto
print_message "Instalando dependencias del proyecto principal..."
cd $DEPLOY_DIR
npm install

print_message "Construyendo el proyecto..."
npm run build

# Instalar dependencias del backend
print_message "Instalando dependencias del backend..."
cd $DEPLOY_DIR/backend
npm install

# Crear archivos de servicio para PM2
print_message "Creando archivos de configuración para PM2..."
cat > $DEPLOY_DIR/ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'portfolio-frontend',
      script: 'node ./dist/server/entry.mjs',
      cwd: '/home/aosika/web',
      env: {
        NODE_ENV: 'production',
        PORT: '4322'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'portfolio-backend',
      script: 'server.js',
      cwd: '/home/aosika/web/backend',
      env: {
        NODE_ENV: 'production',
        PORT: '5000'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOL

# Crear configuración de Nginx
print_message "Creando configuración de Nginx..."
cat > $DEPLOY_DIR/nginx.conf << EOL
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:4322;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        alias /home/aosika/web/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOL

print_message "Creando instrucciones para completar el despliegue..."
cat > $DEPLOY_DIR/INSTRUCCIONES_DESPLIEGUE.md << EOL
# Instrucciones para completar el despliegue

## Requisitos previos

Asegúrate de tener instalado en tu servidor:

1. Node.js (v16 o superior)
2. MongoDB
3. Nginx
4. PM2

## Pasos para completar el despliegue

1. **Instalar MongoDB** (si aún no está instalado):
   \`\`\`bash
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl enable mongodb
   sudo systemctl start mongodb
   \`\`\`

2. **Instalar Nginx** (si aún no está instalado):
   \`\`\`bash
   sudo apt update
   sudo apt install -y nginx
   sudo systemctl enable nginx
   sudo systemctl start nginx
   \`\`\`

3. **Instalar PM2 globalmente** (si aún no está instalado):
   \`\`\`bash
   sudo npm install -g pm2
   \`\`\`

4. **Configurar Nginx**:
   \`\`\`bash
   sudo cp /home/aosika/web/nginx.conf /etc/nginx/sites-available/portfolio
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

5. **Iniciar la aplicación con PM2**:
   \`\`\`bash
   cd /home/aosika/web
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`

6. **Crear un usuario administrador** (si es necesario):
   \`\`\`bash
   cd /home/aosika/web
   node backend/scripts/createAdminUser.js
   \`\`\`

7. **Configurar certificado SSL con Let's Encrypt** (opcional pero recomendado):
   \`\`\`bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com -d www.tudominio.com
   \`\`\`

## Verificación

1. Visita tu dominio en el navegador para verificar que la aplicación funciona correctamente.
2. Verifica los logs de PM2 para detectar posibles errores:
   \`\`\`bash
   pm2 logs
   \`\`\`

## Mantenimiento

- Para actualizar la aplicación, vuelve a ejecutar este script de despliegue.
- Para reiniciar la aplicación: \`pm2 restart all\`
- Para ver el estado de la aplicación: \`pm2 status\`
EOL

print_message "¡Despliegue preparado con éxito!"
print_message "Revisa el archivo INSTRUCCIONES_DESPLIEGUE.md para completar la configuración del servidor." 