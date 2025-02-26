const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:4321', 'http://localhost:4322'], // Permitir ambos puertos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Importante para cookies/autenticación
}));

// Middleware para parsear JSON
app.use(bodyParser.json());

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Archivo de configuración (simulado)
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Crear archivo de configuración si no existe
if (!fs.existsSync(CONFIG_FILE)) {
  const defaultConfig = {
    siteName: 'Mi Sitio Web',
    siteDescription: 'Descripción de mi sitio web',
    navbarTitle: 'Mi Sitio',
    emailContacto: 'contacto@ejemplo.com',
    emailNotificaciones: 'notificaciones@ejemplo.com',
    modoMantenimiento: false,
    mensajeMantenimiento: 'Sitio en mantenimiento. Volveremos pronto.',
    colorPrimario: '#3490dc',
    colorSecundario: '#38a169'
  };
  
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  console.log('Archivo de configuración creado con valores predeterminados');
}

// Ruta para obtener la configuración
app.get('/api/config', (req, res) => {
  try {
    // Leer el archivo de configuración
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    
    // Enviar la configuración como respuesta
    res.json(config);
  } catch (error) {
    console.error('Error al leer la configuración:', error);
    res.status(500).json({ error: 'Error al leer la configuración' });
  }
});

// Ruta para actualizar la configuración
app.put('/api/config', (req, res) => {
  try {
    // Verificar autenticación (simulado)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    // Obtener la configuración actual
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const currentConfig = JSON.parse(configData);
    
    // Actualizar con los nuevos valores
    const updatedConfig = { ...currentConfig, ...req.body };
    
    // Guardar la configuración actualizada
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    
    // Enviar la configuración actualizada como respuesta
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
}); 