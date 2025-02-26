const express = require('express');
const router = express.Router();
const {
  getConfig,
  updateConfig,
  toggleMaintenanceMode,
} = require('../controllers/configController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configuración inicial
let config = {
  navbarTitle: 'Portfolio',
  siteName: 'Mi Portfolio',
  siteDescription: 'Portfolio personal'
};

// Rutas públicas
router.get('/', (req, res) => {
  res.json(config);
});

// Rutas protegidas (solo admin)
router.put('/', protect, admin, express.json(), (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validar que el título del navbar no esté vacío
    if (newConfig.navbarTitle !== undefined && !newConfig.navbarTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El título del navbar no puede estar vacío'
      });
    }
    
    // Actualizar la configuración
    config = { ...config, ...newConfig };
    
    res.json({
      success: true,
      config,
      message: 'Configuración actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración',
      error: error.message
    });
  }
});

router.put('/maintenance', protect, admin, toggleMaintenanceMode);

module.exports = router; 