#!/bin/bash

# Script de despliegue completo para Portfolio
# Este script realiza todas las tareas necesarias para desplegar la aplicación:
# - Clona el repositorio
# - Configura el entorno
# - Instala dependencias
# - Configura Nginx
# - Configura PM2
# - Configura SSL con Certbot
# - Inicia la aplicación

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# Función para verificar si un comando se ejecutó correctamente
check_command() {
  if [ $? -ne 0 ]; then
    error "$1"
  fi
}

# Verificar si el script se está ejecutando como root
if [ "$(id -u)" != "0" ]; then
   error "Este script debe ejecutarse como root. Usa 'sudo ./deploy.sh'"
fi

# Directorio de despliegue
DEPLOY_DIR="/home/aosika/web"
DOMAIN="aosika.es"
WWW_DOMAIN="www.aosika.es"
REPO_URL="https://github.com/Aosiika/Portfolio-Astro.MongoDB.git"
NGINX_CONF="/etc/nginx/sites-available/portfolio"
NGINX_ENABLED="/etc/nginx/sites-enabled/portfolio"
BACKUP_DIR="/home/aosika/backups/$(date +%Y%m%d_%H%M%S)"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"
check_command "No se pudo crear el directorio de backups"

# Función para hacer backup de archivos importantes
backup_files() {
  log "Realizando backup de archivos importantes..."
  
  # Backup de configuración de Nginx
  if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "$BACKUP_DIR/nginx_portfolio.bak"
    success "Backup de configuración de Nginx realizado"
  fi
  
  # Backup de la base de datos MongoDB
  log "Realizando backup de la base de datos MongoDB..."
  mongodump --db portfolio --out "$BACKUP_DIR/mongodb_backup"
  check_command "No se pudo realizar el backup de MongoDB"
  success "Backup de MongoDB realizado"
  
  # Backup del código actual si existe
  if [ -d "$DEPLOY_DIR" ]; then
    log "Realizando backup del código actual..."
    tar -czf "$BACKUP_DIR/web_backup.tar.gz" -C "$(dirname "$DEPLOY_DIR")" "$(basename "$DEPLOY_DIR")"
    check_command "No se pudo realizar el backup del código"
    success "Backup del código realizado"
  fi
}

# Función para instalar dependencias del sistema
install_system_dependencies() {
  log "Actualizando el sistema..."
  apt-get update
  check_command "No se pudo actualizar el sistema"
  
  log "Instalando dependencias del sistema..."
  apt-get install -y curl wget git nginx certbot python3-certbot-nginx build-essential
  check_command "No se pudieron instalar las dependencias del sistema"
  
  # Instalar Node.js si no está instalado
  if ! command -v node &> /dev/null; then
    log "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    check_command "No se pudo instalar Node.js"
  fi
  
  # Instalar PM2 si no está instalado
  if ! command -v pm2 &> /dev/null; then
    log "Instalando PM2..."
    npm install -g pm2
    check_command "No se pudo instalar PM2"
  fi
  
  # Instalar MongoDB si no está instalado
  if ! command -v mongod &> /dev/null; then
    log "Instalando MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl enable mongod
    systemctl start mongod
    check_command "No se pudo instalar MongoDB"
  fi
  
  success "Todas las dependencias del sistema han sido instaladas"
}

# Función para clonar o actualizar el repositorio
setup_repository() {
  if [ -d "$DEPLOY_DIR" ]; then
    log "El directorio de despliegue ya existe. Actualizando repositorio..."
    cd "$DEPLOY_DIR"
    git fetch --all
    git reset --hard origin/main
    check_command "No se pudo actualizar el repositorio"
  else
    log "Clonando repositorio..."
    mkdir -p "$DEPLOY_DIR"
    git clone "$REPO_URL" "$DEPLOY_DIR"
    check_command "No se pudo clonar el repositorio"
  fi
  
  success "Repositorio configurado correctamente"
}

# Función para configurar el entorno
setup_environment() {
  log "Configurando variables de entorno..."
  
  # Crear archivo .env para el frontend si no existe
  if [ ! -f "$DEPLOY_DIR/.env" ]; then
    cat > "$DEPLOY_DIR/.env" << EOF
PUBLIC_API_URL=/api
NODE_ENV=production
PORT=4322
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=tu_secreto_jwt_seguro_$(openssl rand -hex 12)
EOF
    success "Archivo .env creado para el frontend"
  fi
  
  # Crear archivo .env para el backend si no existe
  if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
    cat > "$DEPLOY_DIR/backend/.env" << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=tu_secreto_jwt_seguro_$(openssl rand -hex 12)
UPLOAD_PATH=../uploads
EOF
    success "Archivo .env creado para el backend"
  fi
  
  # Asegurarse de que el directorio de uploads existe
  mkdir -p "$DEPLOY_DIR/uploads/images"
  mkdir -p "$DEPLOY_DIR/uploads/documents"
  
  # Asegurarse de que el directorio de configuración existe
  mkdir -p "$DEPLOY_DIR/backend/config"
  
  # Crear archivo de configuración si no existe
  if [ ! -f "$DEPLOY_DIR/backend/config/config.json" ]; then
    cat > "$DEPLOY_DIR/backend/config/config.json" << EOF
{
  "siteName": "Portfolio Personal",
  "siteDescription": "Mi portfolio de proyectos y habilidades",
  "navbarTitle": "Portfolio",
  "emailContacto": "contacto@aosika.es",
  "emailNotificaciones": "notificaciones@aosika.es",
  "modoMantenimiento": false,
  "mensajeMantenimiento": "Sitio en mantenimiento. Volveremos pronto.",
  "colorPrimario": "#3490dc",
  "colorSecundario": "#38a169",
  "developerName": "Aosika",
  "developerTitle": "Desarrollador Full Stack & Diseñador UI/UX",
  "developerBio": "Desarrollador Full Stack apasionado por crear experiencias web innovadoras y atractivas",
  "aboutMeDescription": "Soy Aosika, un desarrollador Full Stack apasionado por crear soluciones web innovadoras y contenido digital de calidad. Con experiencia en el desarrollo de aplicaciones web modernas y la creación de contenido audiovisual, combino mis habilidades técnicas con mi creatividad para ofrecer experiencias únicas y valiosas.",
  "aboutMeSecondParagraph": "Mi objetivo es crear productos digitales que no solo funcionen perfectamente, sino que también inspiren y eduquen a otros. A través de mi trabajo, comparto conocimientos y experiencias en desarrollo web, diseño de interfaces y optimización de rendimiento.",
  "profileImage": "/images/profile.jpg",
  "cvLink": "/documents/cv.pdf",
  "contactEmail": "contacto@aosika.es",
  "notificationEmail": "notificaciones@aosika.es",
  "githubUrl": "https://github.com/aosika",
  "youtubeUrl": "https://youtube.com/@aosika_dev",
  "twitterUrl": "https://x.com/aosika_dev",
  "skills": "Desarrollo Full Stack, React, Node.js, TypeScript, Astro, TailwindCSS, Diseño UI/UX, Optimización Web, MongoDB, PostgreSQL"
}
EOF
    success "Archivo de configuración creado"
  fi
  
  # Establecer permisos correctos
  chown -R aosika:aosika "$DEPLOY_DIR"
  chmod -R 755 "$DEPLOY_DIR"
  
  success "Entorno configurado correctamente"
}

# Función para instalar dependencias de la aplicación
install_app_dependencies() {
  log "Instalando dependencias del frontend..."
  cd "$DEPLOY_DIR"
  npm install
  check_command "No se pudieron instalar las dependencias del frontend"
  
  log "Instalando dependencias del backend..."
  cd "$DEPLOY_DIR/backend"
  npm install
  check_command "No se pudieron instalar las dependencias del backend"
  
  success "Dependencias instaladas correctamente"
}

# Función para construir la aplicación
build_app() {
  log "Construyendo la aplicación..."
  cd "$DEPLOY_DIR"
  npm run build
  check_command "No se pudo construir la aplicación"
  
  success "Aplicación construida correctamente"
}

# Función para configurar Nginx
setup_nginx() {
  log "Configurando Nginx..."
  
  # Crear configuración de Nginx
  cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:4322;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias $DEPLOY_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    client_max_body_size 50M;
}
EOF
  
  # Crear enlace simbólico si no existe
  if [ ! -f "$NGINX_ENABLED" ]; then
    ln -s "$NGINX_CONF" "$NGINX_ENABLED"
    check_command "No se pudo crear el enlace simbólico para Nginx"
  fi
  
  # Verificar configuración de Nginx
  nginx -t
  check_command "La configuración de Nginx no es válida"
  
  # Reiniciar Nginx
  systemctl restart nginx
  check_command "No se pudo reiniciar Nginx"
  
  success "Nginx configurado correctamente"
}

# Función para configurar SSL con Certbot
setup_ssl() {
  log "Configurando SSL con Certbot..."
  
  # Obtener certificado SSL
  certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos --email contacto@aosika.es
  check_command "No se pudo obtener el certificado SSL"
  
  success "SSL configurado correctamente"
}

# Función para configurar PM2
setup_pm2() {
  log "Configurando PM2..."
  
  # Detener aplicaciones existentes si existen
  pm2 stop all 2>/dev/null || true
  
  # Crear archivo de configuración de PM2
  cat > "$DEPLOY_DIR/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [
    {
      name: 'portfolio-frontend',
      script: '$DEPLOY_DIR/dist/server/entry.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4322,
        HOST: '0.0.0.0'
      }
    },
    {
      name: 'portfolio-backend',
      script: '$DEPLOY_DIR/backend/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
EOF
  
  # Iniciar aplicaciones con PM2
  cd "$DEPLOY_DIR"
  pm2 start ecosystem.config.cjs
  check_command "No se pudieron iniciar las aplicaciones con PM2"
  
  # Guardar configuración de PM2
  pm2 save
  check_command "No se pudo guardar la configuración de PM2"
  
  # Configurar PM2 para iniciar en el arranque
  pm2 startup
  check_command "No se pudo configurar PM2 para iniciar en el arranque"
  
  success "PM2 configurado correctamente"
}

# Función para verificar el despliegue
verify_deployment() {
  log "Verificando el despliegue..."
  
  # Verificar que Nginx está funcionando
  if ! systemctl is-active --quiet nginx; then
    error "Nginx no está funcionando"
  fi
  
  # Verificar que MongoDB está funcionando
  if ! systemctl is-active --quiet mongod; then
    error "MongoDB no está funcionando"
  fi
  
  # Verificar que las aplicaciones de PM2 están funcionando
  if ! pm2 list | grep -q "portfolio-frontend"; then
    error "La aplicación frontend no está funcionando"
  fi
  
  if ! pm2 list | grep -q "portfolio-backend"; then
    error "La aplicación backend no está funcionando"
  fi
  
  # Verificar que el sitio es accesible
  if ! curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "200\|301\|302"; then
    warning "El sitio no parece estar accesible por HTTP"
  else
    success "El sitio es accesible por HTTP"
  fi
  
  if ! curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
    warning "El sitio no parece estar accesible por HTTPS"
  else
    success "El sitio es accesible por HTTPS"
  fi
  
  success "¡Despliegue verificado correctamente!"
}

# Función principal
main() {
  log "Iniciando despliegue completo de Portfolio..."
  
  # Realizar backup
  backup_files
  
  # Instalar dependencias del sistema
  install_system_dependencies
  
  # Configurar repositorio
  setup_repository
  
  # Configurar entorno
  setup_environment
  
  # Instalar dependencias de la aplicación
  install_app_dependencies
  
  # Construir la aplicación
  build_app
  
  # Configurar Nginx
  setup_nginx
  
  # Configurar SSL
  setup_ssl
  
  # Configurar PM2
  setup_pm2
  
  # Verificar despliegue
  verify_deployment
  
  success "¡Despliegue completo finalizado con éxito!"
  echo -e "${GREEN}=================================================${NC}"
  echo -e "${GREEN}  Portfolio desplegado en https://$WWW_DOMAIN  ${NC}"
  echo -e "${GREEN}=================================================${NC}"
}

# Ejecutar función principal
main 