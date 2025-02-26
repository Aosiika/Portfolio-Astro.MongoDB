const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware para proteger rutas
 * Verifica el token JWT y establece req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Verificar si hay token en el header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'No autorizado, token inválido'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No autorizado, no hay token'
    });
  }
};

/**
 * Middleware para verificar si el usuario es administrador
 * Debe usarse después del middleware protect
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'No autorizado como administrador'
    });
  }
};

module.exports = { protect, admin }; 