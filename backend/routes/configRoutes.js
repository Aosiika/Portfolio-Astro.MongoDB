const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const {
  getConfig,
  updateConfig,
  toggleMaintenanceMode,
} = require('../controllers/configController');
const { protect, admin } = require('../middleware/authMiddleware');

// Ruta al archivo de configuración
const CONFIG_FILE = path.join(__dirname, '../config/config.json');

// Middleware para verificar si el archivo de configuración existe
const checkConfigFile = (req, res, next) => {
  if (!fs.existsSync(CONFIG_FILE)) {
    // Crear archivo de configuración con valores predeterminados
    const defaultConfig = {
      siteName: "Portfolio Personal",
      siteDescription: "Mi portfolio de proyectos y habilidades",
      navbarTitle: "Portfolio",
      emailContacto: "contacto@ejemplo.com",
      emailNotificaciones: "notificaciones@ejemplo.com",
      modoMantenimiento: false,
      mensajeMantenimiento: "Sitio en mantenimiento. Volveremos pronto.",
      colorPrimario: "#3490dc",
      colorSecundario: "#38a169"
    };
    
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      console.log('Archivo de configuración creado con valores predeterminados');
    } catch (error) {
      console.error('Error al crear el archivo de configuración:', error);
      return res.status(500).json({ error: 'Error al crear el archivo de configuración' });
    }
  }
  next();
};

// Aplicar middleware a todas las rutas
router.use(checkConfigFile);

// Obtener la configuración
router.get('/', (req, res) => {
  try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    res.json(config);
  } catch (error) {
    console.error('Error al leer la configuración:', error);
    res.status(500).json({ error: 'Error al leer la configuración' });
  }
});

// Actualizar la configuración
router.put('/', (req, res) => {
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

router.put('/maintenance', protect, admin, toggleMaintenanceMode);

module.exports = router; 